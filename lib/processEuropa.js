"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssNested = _interopRequireDefault(require("postcss-nested"));

var _postcssExtendRule = _interopRequireDefault(require("postcss-extend-rule"));

var _postcssReporter = _interopRequireDefault(require("postcss-reporter"));

var _evaluateEuropaFunctions = _interopRequireDefault(require("./lib/plugins/evaluateEuropaFunctions"));

var _substituteEuropaAtRules = _interopRequireDefault(require("./lib/plugins/substituteEuropaAtRules"));

var _substituteContainerAtRules = _interopRequireDefault(require("./lib/plugins/substituteContainerAtRules"));

var _substituteSpaceAtRules = _interopRequireDefault(require("./lib/plugins/substituteSpaceAtRules"));

var _substituteFontsizeAtRules = _interopRequireDefault(require("./lib/plugins/substituteFontsizeAtRules"));

var _substituteRFSAtRules = _interopRequireDefault(require("./lib/plugins/substituteRFSAtRules"));

var _substituteColumnAtRules = _interopRequireDefault(require("./lib/plugins/substituteColumnAtRules"));

var _substituteColumnTypographyAtRules = _interopRequireDefault(require("./lib/plugins/substituteColumnTypographyAtRules"));

var _substituteResponsiveAtRules = _interopRequireDefault(require("./lib/plugins/substituteResponsiveAtRules"));

var _substituteAtruleAliases = _interopRequireDefault(require("./lib/plugins/substituteAtruleAliases"));

var _substituteIterateAtRules = _interopRequireDefault(require("./lib/plugins/substituteIterateAtRules"));

var _substituteUnpackAtRules = _interopRequireDefault(require("./lib/plugins/substituteUnpackAtRules"));

var _substituteIfAtRules = _interopRequireDefault(require("./lib/plugins/substituteIfAtRules"));

var _lintAtRules = _interopRequireDefault(require("./lib/plugins/lintAtRules"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(getConfig) {
  return function (css, result) {
    const config = getConfig();
    const pipeline = [(0, _postcssNested.default)(), (0, _lintAtRules.default)(), (0, _substituteIfAtRules.default)(config), (0, _substituteEuropaAtRules.default)(config), (0, _evaluateEuropaFunctions.default)(config), (0, _substituteIterateAtRules.default)(config), (0, _substituteUnpackAtRules.default)(config), (0, _substituteContainerAtRules.default)(config), (0, _substituteAtruleAliases.default)(config), (0, _substituteSpaceAtRules.default)(config), (0, _substituteFontsizeAtRules.default)(config), (0, _substituteRFSAtRules.default)(config), (0, _substituteColumnAtRules.default)(config), (0, _substituteColumnTypographyAtRules.default)(config), (0, _substituteResponsiveAtRules.default)(config), (0, _postcssExtendRule.default)(), (0, _postcssNested.default)()];

    if (config.reporter) {
      pipeline.push((0, _postcssReporter.default)());
    }

    return (0, _postcss.default)(pipeline).process(css, {
      from: _lodash.default.get(css, 'source.input.file')
    });
  };
}