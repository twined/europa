"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A simple shortcut for setting up a grid.
 * Sets column gap to gutter width across all breakpoints
 */
var _default = _postcss.default.plugin('europacss-grid', getConfig => {
  return function (css) {
    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('grid', atRule => {
      const gridDecl = (0, _buildDecl.default)('display', 'grid');
      atRule.name = 'space';
      atRule.params = 'grid-column-gap 1';
      atRule.parent.insertBefore(atRule, gridDecl);
    });
  };
});

exports.default = _default;