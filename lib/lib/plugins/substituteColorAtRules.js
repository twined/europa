"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-color', getConfig => {
  return function (css) {
    const config = getConfig();
    const finalRules = [];
    css.walkAtRules('color!', atRule => processRule(atRule, config, finalRules, true));
    css.walkAtRules('color', atRule => processRule(atRule, config, finalRules, false));
  };
});

exports.default = _default;

function processRule(atRule, config, finalRules, flagAsImportant) {
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

  let decl;

  switch (target) {
    case 'fg':
      decl = (0, _buildDecl.default)('color', resolvedColor || color, flagAsImportant);
      break;

    case 'bg':
      decl = (0, _buildDecl.default)('background-color', resolvedColor || color, flagAsImportant);
      break;

    case 'fill':
      decl = (0, _buildDecl.default)('fill', resolvedColor || color, flagAsImportant);
      break;

    case 'stroke':
      decl = (0, _buildDecl.default)('stroke', resolvedColor || color, flagAsImportant);
      break;

    case 'border':
      decl = (0, _buildDecl.default)('border-color', resolvedColor || color, flagAsImportant);
      break;

    case 'border-top':
      decl = (0, _buildDecl.default)('border-top-color', resolvedColor || color, flagAsImportant);
      break;

    case 'border-bottom':
      decl = (0, _buildDecl.default)('border-bottom-color', resolvedColor || color, flagAsImportant);
      break;

    case 'border-left':
      decl = (0, _buildDecl.default)('border-left-color', resolvedColor || color, flagAsImportant);
      break;

    case 'border-right':
      decl = (0, _buildDecl.default)('border-right-color', resolvedColor || color, flagAsImportant);
      break;

    default:
      throw atRule.error(`COLOR: target must be fg, bg, fill, stroke, border or border-[top|bottom|right|left]. Got \`${target}\``, {
        word: target
      });
  }

  atRule.parent.append(decl);
  atRule.remove();
}