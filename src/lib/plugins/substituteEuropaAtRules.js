import fs from 'fs'
import _ from 'lodash'
import postcss from 'postcss'
import updateSource from '../../util/updateSource'

export default postcss.plugin('europacss-europa', getConfig => {
  return function (css) {
    const config = getConfig()

    css.walkAtRules('europa', atRule => {
      if (atRule.params === 'base') {
        const normalizeStyles = postcss.parse(fs.readFileSync(require.resolve('normalize.css'), 'utf8'))
        const baseStyles = postcss.parse(fs.readFileSync(`${__dirname}/css/base.css`, 'utf8'))
        prepend(css, updateSource([...normalizeStyles.nodes, ...baseStyles.nodes], atRule.source))
        atRule.remove()
      } else if (atRule.params === 'arrows') {
        const styles = postcss.parse(fs.readFileSync(`${__dirname}/css/arrows.css`, 'utf8'))
        prepend(css, updateSource([...styles.nodes], atRule.source))
        atRule.remove()
      }
    })
  }
})

function prepend(css, styles) {
  css.prepend(styles)
}
