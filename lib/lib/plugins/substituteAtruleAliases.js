"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

var _postcss = _interopRequireDefault(require("postcss"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Aliases and shortcuts to other at-rules
 */
var _default = _postcss.default.plugin('europacss-aliases', getConfig => {
  return function (css) {
    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('column-offset', atRule => {
      // translates to @space margin-left params
      atRule.name = 'space';
      atRule.params = `margin-left ${atRule.params}`;
    });
  };
});

exports.default = _default;