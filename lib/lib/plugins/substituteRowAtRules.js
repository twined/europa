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
var _default = _postcss.default.plugin('europacss-row', getConfig => {
  return function (css) {
    css.walkAtRules('row', atRule => {
      const parent = atRule.parent;

      if (parent.type === 'root') {
        throw atRule.error(`ROW: Can only be used inside a rule, not on root.`);
      }

      const decls = [(0, _buildDecl.default)('display', 'flex'), (0, _buildDecl.default)('flex-wrap', 'nowrap')];
      parent.insertBefore(atRule, ...decls);

      const spaceRule = _postcss.default.atRule({
        name: 'space',
        params: 'margin-left 1'
      });

      const decendentChildren = _postcss.default.rule({
        selector: '> *'
      });

      const firstOfType = _postcss.default.rule({
        selector: '&:first-child'
      });

      firstOfType.append((0, _buildDecl.default)('margin-left', '0'));
      decendentChildren.append(spaceRule);
      decendentChildren.append(firstOfType);
      parent.insertAfter(atRule, decendentChildren);
      atRule.remove();
    });
  };
});

exports.default = _default;