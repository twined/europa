import _ from 'lodash'

import postcss from 'postcss'
import postcssNested from 'postcss-nested'
import postcssExtend from 'postcss-extend-rule'

import defaultConfig from '../stubs/defaultConfig'
import resolveConfig from './util/resolveConfig'
import registerConfigAsDependency from './lib/registerConfigAsDependency'
import formatCSS from './lib/formatCSS'
import resolveConfigPath from './util/resolveConfigPath'
import plugins from './lib/plugins'

const getConfigFunction = config => () => {
  if (_.isUndefined(config) && !_.isObject(config)) {
    return resolveConfig([defaultConfig])
  }

  if (!_.isObject(config)) {
    delete require.cache[require.resolve(config)]
  }

  return resolveConfig([_.isObject(config) ? config : require(config), defaultConfig])
}

const plugin = postcss.plugin('europacss', config => {
  const preEuropaPlugins = [
    postcssNested(),
    postcssExtend()
  ]

  const afterEuropaPlugins = [
    postcssNested(),
    formatCSS
  ]

  const resolvedConfigPath = resolveConfigPath(config)
  const cfgFunction = getConfigFunction(resolvedConfigPath || config)
  const europaPlugins = plugins.map(plug => plug(cfgFunction))

  const pipeline = [
    ...preEuropaPlugins,
    ...europaPlugins,
    ...afterEuropaPlugins
  ]

  if (!_.isUndefined(resolvedConfigPath)) {
    pipeline.push(registerConfigAsDependency(resolvedConfigPath))
  }

  return (root, result) => pipeline.reduce(
    (promise, plugin) => promise.then(
      () => plugin(result.root, result)
    ), Promise.resolve())
})

module.exports = plugin
