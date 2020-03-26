
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import parseFontSizeQuery from '../../util/parseFontSizeQuery'
import sizeNeedsBreakpoints from '../../util/sizeNeedsBreakpoints'

/**
 * FONTSIZE
 *
 * @param {fontSizeQuery} - size of font + optional adjustment + optional line height
 * @param [breakpoint]    - if this should only apply to ONE breakpoint
 *
 * Examples:
 *
 *    @fontsize xl;
 *    @fontsize xl(0.8)/2.1;
 *    @fontsize xl >md;
 *
 */
export default postcss.plugin('europacss-fontsize', getConfig => {
  return function (css) {
    const config = getConfig()
    const { theme } = config
    const { breakpoints, breakpointCollections } = theme

    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('fontsize', atRule => {
      let selector
      const src = atRule.source

      if (atRule.parent.type === 'root') {
        throw atRule.error(`FONTSIZE: Can only be used inside a rule, not on root.`)
      }

      if (atRule.nodes) {
        throw atRule.error(`FONTSIZE: @fontsize should not include children.`)
      }

      // clone parent, but without atRule
      let clonedRule = atRule.clone()
      let [fontSizeQuery, bpQuery] = postcss.list.space(clonedRule.params)
      let parent = atRule.parent
      let grandParent = atRule.parent.parent

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @fontsize
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }

        bpQuery = parent.params

        if (grandParent.selector) {
          selector = grandParent.selector
        }
      } else if (grandParent.name === 'responsive') {
        // check if grandparent is @responsive
        if (bpQuery) {
          throw clonedRule.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }

        bpQuery = grandParent.params

        if (parent.selector[0] === '&') {
          selector = parent.selector.replace('&', grandParent.parent.selector)
        } else {
          selector = parent.selector
        }
      }

      if (!selector && parent.selector) {
        selector = parent.selector
      }

      atRule.remove()

      if (bpQuery) {
        // We have a q, like '>=sm'. Extract all breakpoints we need media queries for
        const affectedBreakpoints = extractBreakpointKeys({ breakpoints, breakpointCollections }, bpQuery)

        _.each(affectedBreakpoints, bp => {
          let parsedFontSizeQuery = parseFontSizeQuery(clonedRule, theme, fontSizeQuery, bp)
          const fontDecls = _.keys(parsedFontSizeQuery).map(prop => buildDecl(prop, parsedFontSizeQuery[prop]))

          const mediaRule = clonedRule.clone({
            name: 'media',
            params: buildMediaQueryQ({ breakpoints, breakpointCollections }, bp)
          })

          if (selector) {
            const originalRule = postcss.rule({ selector }).append(...fontDecls)
            originalRule.source = src
            mediaRule.append(originalRule)
          } else {
            mediaRule.append(fontDecls)
          }

          finalRules.push(mediaRule)
        })
      } else {
        _.keys(breakpoints).forEach(bp => {
          let parsedFontSizeQuery = parseFontSizeQuery(clonedRule, theme, fontSizeQuery, bp)
          const fontDecls = _.keys(parsedFontSizeQuery).map(prop => buildDecl(prop, parsedFontSizeQuery[prop]))
          const mediaRule = clonedRule.clone({ name: 'media', params: buildMediaQuery(breakpoints, bp) })
          const originalRule = postcss.rule({ selector: parent.selector })
          originalRule.source = src

          originalRule.append(...fontDecls)
          mediaRule.append(originalRule)
          finalRules.push(mediaRule)
        })
      }

      // check if parent has anything
      if (parent && !parent.nodes.length) {
        parent.remove()
      }

      // check if grandparent has anything
      if (grandParent && !grandParent.nodes.length) {
        grandParent.remove()
      }

    })

    if (finalRules.length) {
      css.append(finalRules)
    }
  }
})