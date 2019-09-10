"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _fs = _interopRequireDefault(require("fs"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

var _updateSource = _interopRequireDefault(require("../../util/updateSource"));

var _reduceCssCalc = _interopRequireDefault(require("reduce-css-calc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Aliases and shortcuts to other at-rules
 */
var _default = _postcss.default.plugin('europacss-embed-responsive', getConfig => {
  return function (css) {
    css.walkAtRules('embed-responsive', atRule => {
      if (atRule.parent.type === 'root') {
        throw atRule.error(`EMBED-RESPONSIVE: Can only be used inside a rule, not on root.`);
      }

      if (!atRule.params) {
        throw atRule.error(`EMBED-RESPONSIVE: Needs aspect ratio. I.e: @embed-responsive 16/9;`);
      }

      const ratio = atRule.params.split('/');
      const decls = [(0, _buildDecl.default)('padding-top', (0, _reduceCssCalc.default)(`calc(${parseFloat(ratio[1])}/${parseFloat(ratio[0])}*100`) + '%')]; // create a :before rule

      const pseudoBefore = _postcss.default.rule({
        selector: '&::before'
      });

      atRule.parent.insertAfter(atRule, pseudoBefore.append(...decls));

      const styles = _postcss.default.parse(_fs.default.readFileSync(`${__dirname}/css/embed-responsive.css`, 'utf8'));

      atRule.parent.insertAfter(atRule, (0, _updateSource.default)([...styles.nodes]));
      atRule.remove();
      /*
      .embed-responsive-21by9:before {
          padding-top: 42.85714%
      }
       .embed-responsive-16by9:before,.v-module[data-v=video] .video-wrapper:before {
          padding-top: 56.25%
      }
       .embed-responsive-4by3:before {
          padding-top: 75%
      }
       .embed-responsive-1by1:before {
          padding-top: 100%
      }
      */
    });
  };
});

exports.default = _default;