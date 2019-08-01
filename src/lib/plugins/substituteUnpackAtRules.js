import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildMediaQuery from '../../util/buildMediaQuery'
import extractBreakpointKeys from '../../util/extractBreakpointKeys';
import buildMediaQueryQ from '../../util/buildMediaQueryQ';
import buildDecl from '../../util/buildDecl';

export default postcss.plugin('europacss-unpack', getConfig => {
  return function (css) {
    const config = getConfig()
    const finalRules = []

    css.walkAtRules('unpack', atRule => {
      const parent = atRule.parent

      if (parent.type === 'root') {
        throw atRule.error(`UNPACK: Cannot run from root`, { word: 'unpack' })
      }

      const params = atRule.params
      if (!params) {
        throw atRule.error(`UNPACK: Must include iterable parameter`, { word: 'unpack' })
      }

      if (params.indexOf('.') === -1) {
        throw atRule.error(`UNPACK: Can't unpack theme object. Supply a path: \`spacing.md\``, { word: 'unpack' })
      }

      // get the wanted object
      const path = params.split('.')
      const obj = _.get(config, path)
      if (!obj) {
        throw atRule.error(`UNPACK: iterable not found: \`${params}\``, { word: params })
      }

      if (typeof obj !== 'object') {
        throw atRule.error(`UNPACK: iterable must be an object of breakpoints \`${params}\``, { word: params })
      }

      // iterate through breakpoints
      _.keys(obj).forEach(breakpoint => {
        let values = obj[breakpoint]

        // build decls for each k/v
        const decls = []

        _.keys(values).forEach(prop => {
          decls.push(buildDecl(prop, values[prop]))
        })

        // build a responsive rule with these decls
        const responsiveRule = postcss.atRule({ name: 'responsive', params: `>=${breakpoint}` })
        responsiveRule.append(...decls)
        atRule.parent.append(responsiveRule)
      })
      atRule.remove()
    })
  }
})