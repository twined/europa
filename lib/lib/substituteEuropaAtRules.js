"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateSource(nodes, source) {
  return _lodash.default.tap(Array.isArray(nodes) ? _postcss.default.root({
    nodes
  }) : nodes, tree => {
    tree.walk(node => node.source = source);
  });
}

function _default(config) {
  return function (css) {
    css.walkAtRules('europa', atRule => {
      if (atRule.params === 'base') {
        const normalizeStyles = _postcss.default.parse(_fs.default.readFileSync(require.resolve('normalize.css'), 'utf8'));

        const baseStyles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/base.css`, 'utf8')); // atRule.before(updateSource([...normalizeStyles.nodes, ...baseStyles.nodes], atRule.source))
        // atRule.remove()


        prepend(css, updateSource([...normalizeStyles.nodes, ...baseStyles.nodes]));
        atRule.remove();
      } else if (atRule.params === 'arrows') {
        const styles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/arrows.css`, 'utf8')); // atRule.before(updateSource([...styles.nodes], atRule.source))
        // atRule.remove()


        prepend(css, updateSource([...styles.nodes]));
        atRule.remove();
      }
    });
  };
}

function prepend(css, styles) {
  css.prepend(styles);
}