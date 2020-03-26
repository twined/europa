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

      let [family, fsQuery, bpQuery] = _postcss.default.list.space(atRule.params);

      const fsParams = fsQuery ? fsQuery + (bpQuery ? ' ' + bpQuery : '') : null;
      let ff = theme.typography.families[family];

      if (!ff) {
        throw atRule.error(`FONT: Could not find \`${family}\` in typography.families config`);
      }

      if (ff.length) {
        ff = ff.join(',');
      }

      const decls = [(0, _buildDecl.default)('font-family', ff)];

      if (fsParams) {
        // insert a @fontsize at rule after this
        const fsRule = _postcss.default.atRule({
          name: 'fontsize',
          params: fsParams
        });

        fsRule.source = atRule.source;
        parent.insertBefore(atRule, fsRule);
      }

      parent.insertBefore(atRule, ...decls);
      atRule.remove();
    });
  };
});

exports.default = _default;