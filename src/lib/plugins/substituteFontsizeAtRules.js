
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
 * @param {fontSizeQuery}     - size of font + optional adjustment + optional line height
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
    const { theme } = getConfig()
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('fontsize', atRule => {
      let needsMediaRule = true

      if (atRule.parent.type === 'root') {
        throw atRule.error(`FONTSIZE: Can only be used inside a rule, not on root.`)
      }

      if (atRule.nodes) {
        throw atRule.error(`FONTSIZE: @fontsize should not include children.`)
      }

      // clone parent, but without atRule
      let cp = atRule.clone()
      let [fontSizeQuery, bpQuery] = postcss.list.space(cp.params)
      let parent = atRule.parent
      atRule.remove()

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw cp.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
        bpQuery = parent.params
        needsMediaRule = false
      }

      // what if the parent's parent is @responsive?
      if (!['atrule', 'root'].includes(parent.type) && parent.parent.type === 'atrule' && parent.parent.name === 'responsive') {
        if (bpQuery) {
          throw cp.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
        bpQuery = parent.parent.params
        needsMediaRule = false
      }

      if (bpQuery) {
        // We have a q, like '>=sm'. Extract all breakpoints we need media queries for
        const affectedBreakpoints = extractBreakpointKeys(theme.breakpoints, bpQuery)
        _.each(affectedBreakpoints, bp => {
          let parsedFontSizeQuery = parseFontSizeQuery(cp, theme, fontSizeQuery, bp)
          const fontDecls = _.keys(parsedFontSizeQuery).map(prop => buildDecl(prop, parsedFontSizeQuery[prop]))

          if (needsMediaRule) {
            const originalRule = postcss.rule({ selector: parent.selector })
            const mediaRule = cp.clone({ name: 'media', params: buildMediaQueryQ(theme.breakpoints, bp) })
            originalRule.append(...fontDecls)
            mediaRule.append(originalRule)
            finalRules.push(mediaRule)
          } else {
            parent.append(...fontDecls)
          }
        })
      } else {
        _.keys(theme.breakpoints).forEach(bp => {
          let parsedFontSizeQuery = parseFontSizeQuery(cp, theme, fontSizeQuery, bp)
          const fontDecls = _.keys(parsedFontSizeQuery).map(prop => buildDecl(prop, parsedFontSizeQuery[prop]))
          const mediaRule = cp.clone({ name: 'media', params: buildMediaQuery(theme.breakpoints, bp) })
          const originalRule = postcss.rule({ selector: parent.selector })

          originalRule.append(...fontDecls)
          mediaRule.append(originalRule)
          finalRules.push(mediaRule)
        })
      }

      // check if parent has anything
      if (!parent.nodes.length) {
        parent.remove()
      }
    })

    if (finalRules.length) {
      css.append(finalRules)
    }
  }
})