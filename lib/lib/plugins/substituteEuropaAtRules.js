"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _updateSource = _interopRequireDefault(require("../../util/updateSource"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-europa', getConfig => {
  return function (css) {
    const config = getConfig();
    css.walkAtRules('europa', atRule => {
      if (atRule.params === 'base') {
        const normalizeStyles = _postcss.default.parse(_fs.default.readFileSync(require.resolve('normalize.css'), 'utf8'));

        const baseStyles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/base.css`, 'utf8'));

        prepend(css, (0, _updateSource.default)([...normalizeStyles.nodes, ...baseStyles.nodes]));
        atRule.remove();
      } else if (atRule.params === 'arrows') {
        const styles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/arrows.css`, 'utf8'));

        prepend(css, (0, _updateSource.default)([...styles.nodes]));
        atRule.remove();
      }
    });
  };
});

exports.default = _default;

function prepend(css, styles) {
  css.prepend(styles);
}