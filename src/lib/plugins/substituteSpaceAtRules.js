
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import parseSize from '../../util/parseSize'
import sizeNeedsBreakpoints from '../../util/sizeNeedsBreakpoints'
import updateSource from '../../util/updateSource'

/**
 * SPACE
 *
 * @param prop          - prop to modify
 * @param size          - size of spacing
 * @param breakpoint    - if this should only apply to ONE breakpoint
 *
 * Examples:
 *
 *    @space margin-top xl;
 *    @space margin-top 25px xs;
 *
 */
module.exports = getConfig => {
  const config = getConfig()
  const finalRules = []

  return {
    postcssPlugin: 'europacss-space',
    prepare({ root }) {
      return {
        AtRule: {
          'space': atRule => processRule(atRule, config, finalRules, false),
          'space!': atRule => processRule(atRule, config, finalRules, true)
        },

        OnceExit() {
          if (finalRules.length) {
            root.append(finalRules)
          }
        }
      }
    }
  }
}

module.exports.postcss = true


function processRule(atRule, config, finalRules, flagAsImportant) {
  let selector

  if (atRule.parent.type === 'root') {
    throw atRule.error(`SPACING: Should only be used inside a rule, not on root.`)
  }

  if (atRule.nodes) {
    throw atRule.error(`SPACING: Spacing should not include children.`)
  }

  const { theme: { breakpoints, breakpointCollections, spacing } } = config

  // Clone rule to act upon. We remove the atRule from DOM later, but
  // we still need some data from the original.
  let clonedRule = atRule.clone()
  let [prop, size, bpQuery] = postcss.list.space(clonedRule.params)
  let parent = atRule.parent
  let grandParent = atRule.parent.parent

  // Check if we're nested under a @responsive rule.
  // If so, we don't create a media query, and we also won't
  // accept a query param for @space
  if (parent.type === 'atrule' && parent.name === 'responsive') {
    if (bpQuery) {
      throw clonedRule.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
    }

    bpQuery = parent.params

    if (grandParent.selector) {
      selector = grandParent.selector
    }
  } else if (grandParent.name === 'responsive') {
    // check if grandparent is @responsive
    if (bpQuery) {
      throw clonedRule.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
    }

    bpQuery = grandParent.params

    if (parent.selector[0] === '&') {
      selector = parent.selector.replace('&', grandParent.parent.selector)
    } else if (parent.selector === '> *') {
      selector = grandParent.parent.selector + ' ' + parent.selector
    } else {
      selector = parent.selector
    }
  }

  if (!selector && parent.selector) {
    selector = parent.selector
  }

  const src = atRule.source

  atRule.remove()

  if (bpQuery) {
    // We have a breakpoint query, like '>=sm'. Extract all breakpoints
    // we need media queries for. Since there is a breakpoint query, we
    // HAVE to generate breakpoints even if the sizeQuery doesn't
    // call for it.
    const affectedBreakpoints = extractBreakpointKeys({ breakpoints, breakpointCollections }, bpQuery)

    _.each(affectedBreakpoints, bp => {
      let parsedSize = parseSize(clonedRule, config, size, bp)
      const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)

      const mediaRule = clonedRule.clone({
        name: 'media',
        params: buildMediaQueryQ({ breakpoints, breakpointCollections }, bp)
      })

      if (selector) {
        const originalRule = postcss.rule({ selector }).append(sizeDecls)
        originalRule.source = src
        mediaRule.append(originalRule)
      } else {
        mediaRule.append(sizeDecls)
        mediaRule.source = src
      }

      finalRules.push(mediaRule)
    })
  } else {
    if (sizeNeedsBreakpoints(spacing, size)) {
      _.keys(breakpoints).forEach(bp => {
        const parsedSize = parseSize(clonedRule, config, size, bp)
        const mediaRule = clonedRule.clone({ name: 'media', params: buildMediaQuery(breakpoints, bp) })
        const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)
        const originalRule = postcss.rule({ selector: parent.selector }).append(sizeDecls)
        originalRule.source = src
        mediaRule.append(originalRule)
        finalRules.push(mediaRule)
      })
    } else {
      const parsedSize = parseSize(clonedRule, config, size)
      const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)
      parent.prepend(sizeDecls)
    }
  }

  // remove parent if empty
  if (parent && !parent.nodes.length) {
    parent.remove()
  }

  // remove grandparent if empty
  if (grandParent && !grandParent.nodes.length) {
    grandParent.remove()
  }
}