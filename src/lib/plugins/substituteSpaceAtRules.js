
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import parseSize from '../../util/parseSize'
import sizeNeedsBreakpoints from '../../util/sizeNeedsBreakpoints'

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
 *    @space margin-top sm xs;
 *
 */
export default postcss.plugin('europacss-space', getConfig => {
  return function (css, result) {
    const config = getConfig()
    const finalRules = []

    css.walkAtRules('space', atRule => processRule(atRule, config, finalRules, false))
    css.walkAtRules('space!', atRule => processRule(atRule, config, finalRules, true))

    if (finalRules.length) {
      css.append(finalRules)
    }
  }
})

function processRule(atRule, config, finalRules, flagAsImportant) {
  let selector

  if (atRule.parent.type === 'root') {
    throw atRule.error(`SPACING: Should only be used inside a rule, not on root.`)
  }

  if (atRule.nodes) {
    throw atRule.error(`SPACING: Spacing should not include children.`)
  }

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
    } else {
      selector = parent.selector
    }
  }

  if (!selector && parent.selector) {
    selector = parent.selector
  }

  atRule.remove()

  if (bpQuery) {
    // We have a breakpoint query, like '>=sm'. Extract all breakpoints
    // we need media queries for. Since there is a breakpoint query, we
    // HAVE to generate breakpoints even if the sizeQuery doesn't
    // call for it.
    const affectedBreakpoints = extractBreakpointKeys(config.theme.breakpoints, bpQuery)

    _.each(affectedBreakpoints, bp => {
      let parsedSize = parseSize(clonedRule, config, size, bp)
      const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)

      const mediaRule = clonedRule.clone({
        name: 'media',
        params: buildMediaQueryQ(config.theme.breakpoints, bp)
      })

      if (selector) {
        const originalRule = postcss.rule({ selector }).append(sizeDecls)
        mediaRule.append(originalRule)
      } else {
        mediaRule.append(sizeDecls)
      }

      finalRules.push(mediaRule)
    })
  } else {
    if (sizeNeedsBreakpoints(config.theme.spacing, size)) {
      _.keys(config.theme.breakpoints).forEach(bp => {
        const parsedSize = parseSize(clonedRule, config, size, bp)
        const mediaRule = clonedRule.clone({ name: 'media', params: buildMediaQuery(config.theme.breakpoints, bp) })
        const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)
        const originalRule = postcss.rule({ selector: parent.selector }).append(sizeDecls)
        mediaRule.append(originalRule)
        finalRules.push(mediaRule)
      })
    } else {
      const parsedSize = parseSize(clonedRule, config, size)
      const sizeDecls = buildDecl(prop, parsedSize, flagAsImportant)
      parent.prepend(sizeDecls)
    }
  }

  // check if parent has anything
  if (parent && !parent.nodes.length) {
    parent.remove()
  }

  // check if grandparent has anything
  if (grandParent && !grandParent.nodes.length) {
    grandParent.remove()
  }
}