import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildDecl from '../../util/buildDecl';

module.exports = getConfig => {
  const config = getConfig()
  const finalRules = []

  return {
    postcssPlugin: 'europacss-color',
    prepare(result) {
      return {
        AtRule: {
          'color': atRule => {
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

              case 'border-bottom':
                decl = buildDecl('border-bottom-color', resolvedColor)
                break

              case 'border-top':
                decl = buildDecl('border-top-color', resolvedColor)
                break

              case 'border-left':
                decl = buildDecl('border-left-color', resolvedColor)
                break

              case 'border-right':
                decl = buildDecl('border-right-color', resolvedColor)
                break

              case 'border':
                decl = buildDecl('border-color', resolvedColor)
                break

              default:
                throw atRule.error(`COLOR: target must be fg or bg. Got \`${target}\``, { word: target })

            }

            atRule.parent.append(decl)
            atRule.remove()
          }
        }
      }
    }
  }
}

module.exports.postcss = true
