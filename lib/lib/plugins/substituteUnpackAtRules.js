"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-unpack', getConfig => {
  return function (css) {
    const config = getConfig();
    const finalRules = [];
    css.walkAtRules('unpack', atRule => {
      const src = atRule.source;
      const parent = atRule.parent;

      if (parent.type === 'root') {
        throw atRule.error(`UNPACK: Cannot run from root`, {
          word: 'unpack'
        });
      }

      const params = atRule.params;

      if (!params) {
        throw atRule.error(`UNPACK: Must include iterable parameter`, {
          word: 'unpack'
        });
      }

      if (params.indexOf('.') === -1) {
        throw atRule.error(`UNPACK: Can't unpack theme object. Supply a path: \`spacing.md\``, {
          word: 'unpack'
        });
      } // get the wanted object


      const path = params.split('.');

      const obj = _lodash.default.get(config, path);

      if (!obj) {
        throw atRule.error(`UNPACK: iterable not found: \`${params}\``, {
          word: params
        });
      }

      if (typeof obj !== 'object') {
        throw atRule.error(`UNPACK: iterable must be an object of breakpoints \`${params}\``, {
          word: params
        });
      } // iterate through breakpoints


      _lodash.default.keys(obj).forEach(breakpoint => {
        let values = obj[breakpoint]; // build decls for each k/v

        const decls = [];

        _lodash.default.keys(values).forEach(prop => {
          decls.push((0, _buildDecl.default)(prop, values[prop]));
        }); // build a responsive rule with these decls


        const responsiveRule = _postcss.default.atRule({
          name: 'responsive',
          params: `>=${breakpoint}`
        });

        responsiveRule.source = src;
        responsiveRule.append(...decls);
        atRule.parent.append(responsiveRule);
      });

      atRule.remove();
    });
  };
});

exports.default = _default;