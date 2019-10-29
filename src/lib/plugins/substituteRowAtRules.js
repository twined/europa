
import _ from 'lodash'
import postcss from 'postcss'
import fs from 'fs'
import updateSource from '../../util/updateSource'
import buildDecl from '../../util/buildDecl'

/**
 * Aliases and shortcuts to other at-rules
 */

export default postcss.plugin('europacss-row', getConfig => {
  return function (css) {
    css.walkAtRules('row', atRule => {
      const parent = atRule.parent
      if (parent.type === 'root') {
        throw atRule.error(`ROW: Can only be used inside a rule, not on root.`)
      }

      const decls = [
        buildDecl('display', 'flex'),
        buildDecl('flex-wrap', 'nowrap')
      ]

      parent.insertBefore(atRule, ...decls)

      const spaceRule = postcss.atRule({ name: 'space', params: 'margin-left 1'})
      const decendentChildren = postcss.rule({ selector: '> *' })
      const firstOfType = postcss.rule({ selector: '&:first-child' })
      firstOfType.append(buildDecl('margin-left', '0'))

      decendentChildren.append(spaceRule)
      decendentChildren.append(firstOfType)

      parent.insertAfter(atRule, decendentChildren)

      atRule.remove()
    })
  }
})
