import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildMediaQuery from '../../util/buildMediaQuery'
import extractBreakpointKeys from '../../util/extractBreakpointKeys';
import buildMediaQueryQ from '../../util/buildMediaQueryQ';
import buildDecl from '../../util/buildDecl';

export default postcss.plugin('europacss-color', getConfig => {
  return function (css) {
    const config = getConfig()
    const finalRules = []

    css.walkAtRules('color', atRule => {
      const parent = atRule.parent

      if (parent.type === 'root') {
        throw atRule.error(`COLOR: Cannot run from root`, { word: 'color' })
      }

      let [target, color] = atRule.params.split(' ')

      if (!target || !color) {
        throw atRule.error(`COLOR: Must include target (fg/bg) and color property`, { word: 'color' })
      }

      // get the wanted object
      const theme = ['theme', 'colors']
      const path = color.split('.')

      const resolvedColor = _.get(config, theme.concat(path))

      if (!resolvedColor) {
        throw atRule.error(`COLOR: color not found: \`${color}\``, { word: color })
      }

      let decl

      switch (target) {
        case 'fg':
          decl = buildDecl('color', resolvedColor)
          break

        case 'bg':
          decl = buildDecl('background-color', resolvedColor)
          break

        default:
          throw atRule.error(`COLOR: target must be fg or bg. Got \`${target}\``, { word: target })

      }

      atRule.parent.append(decl)
      atRule.remove()
    })
  }
})