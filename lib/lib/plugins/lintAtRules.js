"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _postcss = _interopRequireDefault(require("postcss"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-lint', () => {
  return function (css, result) {
    css.walkAtRules('responsive', atRule => {
      const nodes = atRule.nodes;

      if (!nodes) {
        atRule.warn(result, `RESPONSIVE: @responsive rule is empty!`, {
          name: '@responsive',
          plugin: 'europacss'
        });
        return;
      } // if (nodes.length === 1) {
      //   /* at-rules that should not be nested under @responsive as an only child */
      //   switch (nodes[0].name) {
      //     case 'space':
      //     case 'space!':
      //     case 'column':
      //     case 'column-typography':
      //     case 'column-offset':
      //     case 'rfs':
      //     case 'fontsize':
      //     case 'container':
      //       atRule.warn(
      //         result,
      //         `RESPONSIVE: @${nodes[0].name} shouldn't be an only child under @responsive. Use the rule directly with a breakpoint query instead.`,
      //         {
      //           name: nodes[0].name,
      //           plugin: 'europacss'
      //         }
      //       )
      //       break
      //   }
      // }


      atRule.walkAtRules(childNode => {
        switch (childNode.name) {
          case 'unpack':
            atRule.warn(result, `UNPACK: @unpack should not be nested under @responsive, since it unpacks through all breakpoints`, {
              name: 'unpack',
              plugin: 'europacss'
            });
        }
      });
    });
  };
});

exports.default = _default;