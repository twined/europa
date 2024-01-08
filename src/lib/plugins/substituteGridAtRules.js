import _ from 'lodash'
import postcss from 'postcss'
import buildDecl from '../../util/buildDecl'

/**
 * A simple shortcut for setting up a grid.
 * Sets column gap to gutter width across all breakpoints
 */

export default postcss.plugin('europacss-grid', getConfig => {
  return function (css) {
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('grid', atRule => {
      const gridDecl = buildDecl('display', 'grid')
      const gridTplDecl = buildDecl('grid-template-columns', 'repeat(12, 1fr)')
      // grid-template-columns: repeat(12, 1fr);
      atRule.name = 'space'
      atRule.params = 'grid-column-gap 1'
      atRule.parent.insertBefore(atRule, gridDecl)
      atRule.parent.insertBefore(atRule, gridTplDecl)
    })
  }
})
