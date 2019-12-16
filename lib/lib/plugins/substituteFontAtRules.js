"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _fs = _interopRequireDefault(require("fs"));

var _updateSource = _interopRequireDefault(require("../../util/updateSource"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Aliases and shortcuts to other at-rules
 */
var _default = _postcss.default.plugin('europacss-font', getConfig => {
  return function (css) {
    const {
      theme
    } = getConfig();
    css.walkAtRules('font', atRule => {
      const parent = atRule.parent;

      if (parent.type === 'root') {
        throw atRule.error(`FONT: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`FONT: @font should not include children.`);
      }

      let [family, fsQuery] = _postcss.default.list.space(atRule.params);

      const ff = theme.typography.families[family];

      if (!ff) {
        throw atRule.error(`FONT: Could not find \`${family}\` in typography.families config`);
      }

      const decls = [(0, _buildDecl.default)('font-family', ff)];

      if (fsQuery) {
        // insert a @fontsize at rule after this
        const fsRule = _postcss.default.atRule({
          name: 'fontsize',
          params: fsQuery
        });

        parent.insertBefore(atRule, fsRule);
      }

      parent.insertBefore(atRule, ...decls);
      atRule.remove();
    });
  };
});

exports.default = _default;