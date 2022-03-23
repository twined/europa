
import _ from 'lodash'
import postcss from 'postcss'

/**
 * Aliases and shortcuts to other at-rules
 */

export default postcss.plugin('europacss-aliases', getConfig => {
  return function (css) {
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('column-offset', atRule => {
      // translates to @space margin-left params
      atRule.name = 'space'
      atRule.params = `margin-left ${atRule.params}`
    })
  }
})
