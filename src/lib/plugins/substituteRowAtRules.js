
import _ from 'lodash'
import postcss from 'postcss'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import fs from 'fs'
import updateSource from '../../util/updateSource'
import buildDecl from '../../util/buildDecl'

/**
 * ROW
 *
 * Examples:
 *
 *    @row 2/wrap xl;
 *
 */
module.exports = getConfig => {
  const config = getConfig()
  const finalRules = []

  return {
    postcssPlugin: 'europacss-row',
    AtRule: {
      'row': atRule => processRule(atRule, config, finalRules),
    }
  }
}

module.exports.postcss = true

function processRule(atRule, config, finalRules) {
  const { theme: { breakpoints, breakpointCollections }} = config
  const src = atRule.source
  let selector
  let wrapInResponsive = false
  let wrapRow = 'nowrap'
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

  if (bpQuery) {
    wrapInResponsive = true
  }

  if (atRule.params) {
    childSpec = `${parseInt(rowCount)}n+1`

    if (rowCount && rowCount.indexOf('/') > -1) {
      [rowCount, wrapRow] = rowCount.split('/')
    }
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
    buildDecl('flex-wrap', wrapRow)
  ]

  const spaceParams = 'margin-left 1'
  const spaceRule = postcss.atRule({ name: 'space', params: spaceParams})

  const decendentChildren = postcss.rule({ selector: '> *' })
  const nthChild = postcss.rule({ selector: `&:nth-child(${childSpec})` })
  nthChild.append(buildDecl('margin-left', '0'))

  decendentChildren.append(spaceRule)
  decendentChildren.append(nthChild)

  if (wrapInResponsive) {
    const responsiveRule = postcss.atRule({ name: 'responsive', params: bpQuery })
    responsiveRule.source = src
    responsiveRule.append(...decls)
    responsiveRule.append(decendentChildren)
    parent.insertBefore(atRule, responsiveRule)
  } else {
    // parent.insertBefore(atRule, ...decls)
    parent.prepend(...decls)
    parent.insertAfter(atRule, decendentChildren)
  }

  atRule.remove()
}
