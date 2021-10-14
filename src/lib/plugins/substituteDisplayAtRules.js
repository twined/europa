
import _ from 'lodash'
import postcss from 'postcss'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import fs from 'fs'
import updateSource from '../../util/updateSource'
import buildDecl from '../../util/buildDecl'

/**
 * Display. Basically a shortcut for responsive display rules
 */

export default postcss.plugin('europacss-display', getConfig => {
  const config = getConfig()
  const { theme: { breakpoints, breakpointCollections }} = config

  return function (css) {
    const finalRules = []

    css.walkAtRules('display', atRule => {
      const src = atRule.source
      let selector
      let wrapInResponsive = false
      let wrapRow = 'nowrap'
      let gap = null
      const parent = atRule.parent
      let grandParent = atRule.parent.parent

      if (parent.type === 'root') {
        throw atRule.error(`DISPLAY: Can only be used inside a rule, not on root.`)
      }

      if (atRule.nodes) {
        throw atRule.error(`DISPLAY: @display should not include children.`)
      }

      let [displayQ = null, bpQuery = null] = postcss.list.space(atRule.params)

      if (bpQuery) {
        wrapInResponsive = true
      }

      let clonedRule = atRule.clone()

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`DISPLAY: When nesting @display under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }

        bpQuery = parent.params

        if (grandParent.selector) {
          selector = grandParent.selector
        }
      } else if (grandParent.name === 'responsive') {
        // check if grandparent is @responsive
        if (bpQuery) {
          throw clonedRule.error(`DISPLAY: When nesting @display under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
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

      let [displayParam, flexDirection, flexWrap] = displayQ.split('/')

      const decls = [
        buildDecl('display', displayParam)
      ]

      if (flexDirection) {
        decls.push(buildDecl('flex-direction', flexDirection))
      }

      if (flexWrap) {
        decls.push(buildDecl('flex-wrap', flexWrap))
      }

      if (wrapInResponsive) {
        const responsiveRule = postcss.atRule({ name: 'responsive', params: bpQuery })
        responsiveRule.source = src
        responsiveRule.append(...decls)
        parent.insertBefore(atRule, responsiveRule)
      } else {
        parent.prepend(...decls)
      }

      atRule.remove()
    })
  }
})
