
import _ from 'lodash'
import postcss from 'postcss'
import fs from 'fs'
import updateSource from '../../util/updateSource'
import buildDecl from '../../util/buildDecl'

/**
 * Aliases and shortcuts to other at-rules
 */

export default postcss.plugin('europacss-font', getConfig => {
  return function (css) {
    const { theme } = getConfig()

    css.walkAtRules('font', atRule => {
      const parent = atRule.parent
      if (parent.type === 'root') {
        throw atRule.error(`FONT: Can only be used inside a rule, not on root.`)
      }

      if (atRule.nodes) {
        throw atRule.error(`FONT: @font should not include children.`)
      }

      let [family, fsQuery, bpQuery] = postcss.list.space(atRule.params)

      const fsParams = fsQuery ? fsQuery + (bpQuery ? ' ' + bpQuery : '') : null
      const ff = theme.typography.families[family]

      if (!ff) {
        throw atRule.error(`FONT: Could not find \`${family}\` in typography.families config`)
      }

      const decls = [
        buildDecl('font-family', ff),
      ]

      if (fsParams) {
        // insert a @fontsize at rule after this
        const fsRule = postcss.atRule({ name: 'fontsize', params: fsParams })
        parent.insertBefore(atRule, fsRule)
      }

      parent.insertBefore(atRule, ...decls)
      atRule.remove()
    })
  }
})
