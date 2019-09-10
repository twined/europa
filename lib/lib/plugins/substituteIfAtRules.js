"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-if', getConfig => {
  return function (css) {
    const config = getConfig();
    css.walkAtRules('if', atRule => {
      const parent = atRule.parent;
      let root = false;

      if (parent.type === 'root') {
        root = true;
      }

      const nodes = atRule.nodes;

      if (!nodes) {
        throw atRule.error(`IF: Must include child nodes.`, {
          word: 'if'
        });
      }

      const params = atRule.params;

      if (!params) {
        throw atRule.error(`IF: Must include breakpoint selectors`, {
          word: 'if'
        });
      } // get the key


      const path = params.split('.');

      const obj = _lodash.default.get(config, path);

      if (obj === undefined) {
        throw atRule.error(`IF: not found: \`${params}\``, {
          word: params
        });
      }

      if (obj) {
        atRule.parent.append(...(0, _cloneNodes.default)(nodes));
      }

      atRule.remove();
    });
  };
});

exports.default = _default;