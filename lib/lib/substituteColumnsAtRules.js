"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash"));

var _buildMediaQuery = _interopRequireDefault(require("../util/buildMediaQuery"));

var _buildMediaQueryQ = _interopRequireDefault(require("../util/buildMediaQueryQ"));

var _cloneNodes = _interopRequireDefault(require("../util/cloneNodes"));

var _postcss = _interopRequireDefault(require("postcss"));

var _extractBreakpointKeys = _interopRequireDefault(require("../util/extractBreakpointKeys"));

var _buildDecl = _interopRequireDefault(require("../util/buildDecl"));

var _renderCalcWithRounder = _interopRequireDefault(require("../util/renderCalcWithRounder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * COLUMNS
 *
 * @param prop          - prop to modify
 * @param size          - size of spacing
 * @param breakpoint    - if this should only apply to ONE breakpoint
 *
 * Examples:
 *
 *    @space margin-top xl;
 *    @space margin-top sm xs;
 *
 */
function _default({
  theme: {
    breakpoints,
    spacing
  }
}) {
  return function (css) {
    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('columns', atRule => {
      let size;
      let bpQuery;
      let [head, align = 'left'] = atRule.params.split(' ');

      if (head.indexOf('@')) {
        [size, bpQuery] = head.split('@');
      } else {
        size = head;
      }

      const parent = atRule.parent;
      const flexSize = (0, _renderCalcWithRounder.default)(size);
      const flexDecls = [(0, _buildDecl.default)('position', 'relative'), (0, _buildDecl.default)('flex', `0 0 ${flexSize}`), (0, _buildDecl.default)('max-width', flexSize)];

      switch (align) {
        case 'center':
          flexDecls.push((0, _buildDecl.default)('margin-x', 'auto'));
          break;

        case 'right':
          flexDecls.push((0, _buildDecl.default)('margin-left', 'auto'));
          flexDecls.push((0, _buildDecl.default)('margin-right', '0'));
          break;

        default:
          break;
      }

      atRule.remove();

      if (bpQuery) {
        // add a media query
        const originalRule = _postcss.default.rule({
          selector: parent.selector
        });

        originalRule.append(...flexDecls);

        const mediaRule = _postcss.default.atRule({
          name: 'media',
          params: (0, _buildMediaQueryQ.default)(breakpoints, bpQuery)
        });

        mediaRule.append(originalRule);
        finalRules.push(mediaRule);
      } else {
        parent.append(...flexDecls);
      }

      if (!parent.nodes.length) {
        parent.remove();
      }

      if (finalRules.length) {
        css.append(finalRules);
      }
    });
  };
}