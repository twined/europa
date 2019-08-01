import fs from 'fs'
import _ from 'lodash'
import postcss from 'postcss'

function updateSource(nodes, source) {
  return _.tap(Array.isArray(nodes) ? postcss.root({ nodes }) : nodes, tree => {
    tree.walk(node => (node.source = source))
  })
}

export default postcss.plugin('europacss-europa', getConfig => {
  return function (css) {
    const config = getConfig()

    css.walkAtRules('europa', atRule => {
      if (atRule.params === 'base') {
        const normalizeStyles = postcss.parse(fs.readFileSync(require.resolve('normalize.css'), 'utf8'))
        const baseStyles = postcss.parse(fs.readFileSync(`${__dirname}/css/base.css`, 'utf8'))

        // atRule.before(updateSource([...normalizeStyles.nodes, ...baseStyles.nodes], atRule.source))
        // atRule.remove()
        prepend(css, updateSource([...normalizeStyles.nodes, ...baseStyles.nodes]))
        atRule.remove()
      } else if (atRule.params === 'arrows') {
        const styles = postcss.parse(fs.readFileSync(`${__dirname}/css/arrows.css`, 'utf8'))

        // atRule.before(updateSource([...styles.nodes], atRule.source))
        // atRule.remove()
        prepend(css, updateSource([...styles.nodes]))
        atRule.remove()
      }
    })
  }
})

function prepend(css, styles) {
  css.prepend(styles)
}
