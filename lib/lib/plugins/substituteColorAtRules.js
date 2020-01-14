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

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-color', getConfig => {
  return function (css) {
    const config = getConfig();
    const finalRules = [];
    css.walkAtRules('color', atRule => {
      const parent = atRule.parent;

      if (parent.type === 'root') {
        throw atRule.error(`COLOR: Cannot run from root`, {
          word: 'color'
        });
      }

      let [target, color] = atRule.params.split(' ');

      if (!target || !color) {
        throw atRule.error(`COLOR: Must include target (fg/bg) and color property`, {
          word: 'color'
        });
      } // get the wanted object


      const theme = ['theme', 'colors'];
      const path = color.split('.');

      const resolvedColor = _lodash.default.get(config, theme.concat(path));

      if (!resolvedColor) {
        throw atRule.error(`COLOR: color not found: \`${color}\``, {
          word: color
        });
      }

      let decl;

      switch (target) {
        case 'fg':
          decl = (0, _buildDecl.default)('color', resolvedColor);
          break;

        case 'bg':
          decl = (0, _buildDecl.default)('background-color', resolvedColor);
          break;

        default:
          throw atRule.error(`COLOR: target must be fg or bg. Got \`${target}\``, {
            word: target
          });
      }

      atRule.parent.append(decl);
      atRule.remove();
    });
  };
});

exports.default = _default;