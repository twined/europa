
import _ from 'lodash'
import postcss from 'postcss'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import fs from 'fs'
import updateSource from '../../util/updateSource'
import buildDecl from '../../util/buildDecl'

/**
 * Aliases and shortcuts to other at-rules
 */

export default postcss.plugin('europacss-row', getConfig => {
  const config = getConfig()
  const { theme: { breakpoints, breakpointCollections }} = config

  return function (css) {
    const finalRules = []

    css.walkAtRules('row', atRule => {
      let selector
      const parent = atRule.parent
      let grandParent = atRule.parent.parent

      if (parent.type === 'root') {
        throw atRule.error(`ROW: Can only be used inside a rule, not on root.`)
      }

      if (atRule.nodes) {
        throw atRule.error(`ROW: Row should not include children.`)
      }

      let childSpec = '1'
      let [rowCount = null, bpQuery = null] = postcss.list.space(atRule.params)
      if (atRule.params) {
        childSpec = `${parseInt(rowCount)}n+1`
      }

      let clonedRule = atRule.clone()

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`ROW: When nesting @row under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }

        bpQuery = parent.params

        if (grandParent.selector) {
          selector = grandParent.selector
        }
      } else if (grandParent.name === 'responsive') {
        // check if grandparent is @responsive
        if (bpQuery) {
          throw clonedRule.error(`ROW: When nesting @row under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
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

      const decls = [
        buildDecl('display', 'flex'),
        buildDecl('flex-wrap', 'nowrap')
      ]

      const spaceParams = 'margin-left 1'
      const spaceRule = postcss.atRule({ name: 'space', params: spaceParams})

      const decendentChildren = postcss.rule({ selector: '> *' })
      const nthChild = postcss.rule({ selector: `&:nth-child(${childSpec})` })
      nthChild.append(buildDecl('margin-left', '0'))

      decendentChildren.append(spaceRule)
      decendentChildren.append(nthChild)

      parent.insertBefore(atRule, ...decls)
      parent.insertAfter(atRule, decendentChildren)

      atRule.remove()
    })
  }
})
