import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildMediaQuery from '../../util/buildMediaQuery'
import extractBreakpointKeys from '../../util/extractBreakpointKeys';
import buildMediaQueryQ from '../../util/buildMediaQueryQ';

export default postcss.plugin('europacss-iterate', getConfig => {
  return function (css) {
    const config = getConfig()
    const finalRules = []

    css.walkAtRules('iterate', atRule => {
      const parent = atRule.parent

      if (parent.type === 'root') {
        throw atRule.error(`ITERATE: Cannot run from root`, { word: 'iterate' })
      }

      const nodes = atRule.nodes
      if (!nodes) {
        throw atRule.error(`ITERATE: Must include child nodes.`, { word: 'iterate' })
      }

      const params = atRule.params
      if (!params) {
        throw atRule.error(`ITERATE: Must include iterable parameter`, { word: 'iterate' })
      }

      if (params.indexOf('.') === -1) {
        throw atRule.error(`ITERATE: Can't iterate theme object. Supply a path: \`spacing.md\``, { word: 'iterate' })
      }

      // get the wanted object
      const path = params.split('.')
      const obj = _.get(config, path)
      if (!obj) {
        throw atRule.error(`ITERATE: iterable not found: \`${params}\``, { word: params })
      }

      // iterate through the params object
      _.keys(obj).forEach(key => {
        let value = obj[key]
        // we clone the nodes for every key
        let clone = atRule.clone()

        clone.walkAtRules(r => {
          r.params = r.params.replace('$key', key)
          r.params = r.params.replace('$value', value)

          r.walkDecls(d => {
            d.value = d.value.replace('$value', value)
          })
        })

        clone.walkDecls(d => {
          d.prop = d.prop.replace('$key', key)
          d.value = d.value.replace('$key', key)
          d.value = d.value.replace('$value', value)
        })

        finalRules.push(clone.nodes)
      })

      atRule.parent.append(...finalRules)
      atRule.remove()
    })
  }
})