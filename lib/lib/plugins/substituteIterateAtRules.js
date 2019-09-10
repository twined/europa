"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

var _buildMediaQuery = _interopRequireDefault(require("../../util/buildMediaQuery"));

var _extractBreakpointKeys = _interopRequireDefault(require("../../util/extractBreakpointKeys"));

var _buildMediaQueryQ = _interopRequireDefault(require("../../util/buildMediaQueryQ"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-iterate', getConfig => {
  return function (css) {
    const config = getConfig();
    const finalRules = [];
    css.walkAtRules('iterate', atRule => {
      const parent = atRule.parent;

      if (parent.type === 'root') {
        throw atRule.error(`ITERATE: Cannot run from root`, {
          word: 'iterate'
        });
      }

      const nodes = atRule.nodes;

      if (!nodes) {
        throw atRule.error(`ITERATE: Must include child nodes.`, {
          word: 'iterate'
        });
      }

      const params = atRule.params;

      if (!params) {
        throw atRule.error(`ITERATE: Must include iterable parameter`, {
          word: 'iterate'
        });
      }

      if (params.indexOf('.') === -1) {
        throw atRule.error(`ITERATE: Can't iterate theme object. Supply a path: \`spacing.md\``, {
          word: 'iterate'
        });
      } // get the wanted object


      const path = params.split('.');

      const obj = _lodash.default.get(config, path);

      if (!obj) {
        throw atRule.error(`ITERATE: iterable not found: \`${params}\``, {
          word: params
        });
      } // iterate through the params object


      _lodash.default.keys(obj).forEach(key => {
        let value = obj[key]; // we clone the nodes for every key

        let clone = atRule.clone();
        clone.walkAtRules(r => {
          r.params = r.params.replace('$key', key);
          r.params = r.params.replace('$value', value);
          r.walkDecls(d => {
            d.value = d.value.replace('$value', value);
          });
        });
        clone.walkDecls(d => {
          d.prop = d.prop.replace('$key', key);
          d.value = d.value.replace('$key', key);
          d.value = d.value.replace('$value', value);
        });
        finalRules.push(clone.nodes);
      });

      atRule.parent.append(...finalRules);
      atRule.remove();
    });
  };
});

exports.default = _default;