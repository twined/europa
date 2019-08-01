import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'

export default postcss.plugin('europacss-if', getConfig => {
  return function (css) {
    const config = getConfig()

    css.walkAtRules('if', atRule => {
      const parent = atRule.parent

      let root = false
      if (parent.type === 'root') {
        root = true
      }

      const nodes = atRule.nodes
      if (!nodes) {
        throw atRule.error(`IF: Must include child nodes.`, { word: 'if' })
      }

      const params = atRule.params
      if (!params) {
        throw atRule.error(`IF: Must include breakpoint selectors`, { word: 'if' })
      }

      // get the key
      const path = params.split('.')

      const obj = _.get(config, path)
      if (obj === undefined) {
        throw atRule.error(`IF: not found: \`${params}\``, { word: params })
      }

      if (obj) {
        atRule.parent.append(...cloneNodes(nodes))
      }

      atRule.remove()
    })
  }
})