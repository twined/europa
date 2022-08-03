import _ from 'lodash'
import postcss from 'postcss'
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
      
      let decl

      switch (target) {
        case 'fg':
          decl = buildDecl('color', resolvedColor || color)
          break

        case 'bg':
          decl = buildDecl('background-color', resolvedColor || color)
          break

        case 'fill':
          decl = buildDecl('fill', resolvedColor || color)
          break

        case 'stroke':
          decl = buildDecl('stroke', resolvedColor || color)
          break

        case 'border':
          decl = buildDecl('border-color', resolvedColor || color)
          break

        case 'border-top':
          decl = buildDecl('border-top-color', resolvedColor || color)
          break

        case 'border-bottom':
          decl = buildDecl('border-bottom-color', resolvedColor || color)
          break
        
        case 'border-left':
          decl = buildDecl('border-left-color', resolvedColor || color)
          break

        case 'border-right':
          decl = buildDecl('border-right-color', resolvedColor || color)
          break

        default:
          throw atRule.error(`COLOR: target must be fg, bg, fill, stroke, border or border-[top|bottom|right|left]. Got \`${target}\``, { word: target })
      }

      atRule.parent.append(decl)
      atRule.remove()
    })
  }
})