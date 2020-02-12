"use strict";

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssNested = _interopRequireDefault(require("postcss-nested"));

var _postcssExtendRule = _interopRequireDefault(require("postcss-extend-rule"));

var _defaultConfig = _interopRequireDefault(require("../stubs/defaultConfig"));

var _resolveConfig = _interopRequireDefault(require("./util/resolveConfig"));

var _registerConfigAsDependency = _interopRequireDefault(require("./lib/registerConfigAsDependency"));

var _formatCSS = _interopRequireDefault(require("./lib/formatCSS"));

var _resolveConfigPath = _interopRequireDefault(require("./util/resolveConfigPath"));

var _plugins = _interopRequireDefault(require("./lib/plugins"));

var _substituteRowAtRules = _interopRequireDefault(require("./lib/plugins/substituteRowAtRules"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getConfigFunction = config => () => {
  if (_lodash.default.isUndefined(config) && !_lodash.default.isObject(config)) {
    return (0, _resolveConfig.default)([_defaultConfig.default]);
  }

  if (!_lodash.default.isObject(config)) {
    delete require.cache[require.resolve(config)];
  }

  return (0, _resolveConfig.default)([_lodash.default.isObject(config) ? config : require(config), _defaultConfig.default]);
};

const plugin = _postcss.default.plugin('europacss', config => {
  const resolvedConfigPath = (0, _resolveConfigPath.default)(config);
  const cfgFunction = getConfigFunction(resolvedConfigPath || config);
  const preludium = [(0, _substituteRowAtRules.default)(cfgFunction), (0, _postcssNested.default)(), (0, _postcssExtendRule.default)()];
  const postludium = [(0, _postcssNested.default)(), _formatCSS.default];

  const configuredEuropaPlugins = _plugins.default.map(plug => plug(cfgFunction));

  const pipeline = [...preludium, ...configuredEuropaPlugins, ...postludium];

  if (!_lodash.default.isUndefined(resolvedConfigPath)) {
    pipeline.push((0, _registerConfigAsDependency.default)(resolvedConfigPath));
  }

  return (root, result) => pipeline.reduce((promise, plugin) => promise.then(() => plugin(result.root, result)), Promise.resolve());
});

module.exports = plugin;