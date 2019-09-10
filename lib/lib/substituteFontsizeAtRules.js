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

var _parseFontSizeQuery = _interopRequireDefault(require("../util/parseFontSizeQuery"));

var _sizeNeedsBreakpoints = _interopRequireDefault(require("../util/sizeNeedsBreakpoints"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * FONTSIZE
 *
 * @param {fontSizeQuery}     - size of font + optional adjustment + optional line height
 * @param [breakpoint]    - if this should only apply to ONE breakpoint
 *
 * Examples:
 *
 *    @fontsize xl;
 *    @fontsize xl(0.8)/2.1;
 *    @fontsize xl >md;
 *
 */
function _default({
  theme
}) {
  return function (css) {
    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('fontsize', atRule => {
      let needsMediaRule = true;

      if (atRule.parent.type === 'root') {
        throw atRule.error(`FONTSIZE: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`FONTSIZE: @fontsize should not include children.`);
      } // clone parent, but without atRule


      let cp = atRule.clone();

      let [fontSizeQuery, bpQuery] = _postcss.default.list.space(cp.params);

      let parent = atRule.parent;
      atRule.remove(); // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw cp.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, {
            name: bpQuery
          });
        }

        bpQuery = parent.params;
        needsMediaRule = false;
      } // what if the parent's parent is @responsive?


      if (!['atrule', 'root'].includes(parent.type) && parent.parent.type === 'atrule' && parent.parent.name === 'responsive') {
        if (bpQuery) {
          throw cp.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, {
            name: bpQuery
          });
        }

        bpQuery = parent.parent.params;
        needsMediaRule = false;
      }

      if (bpQuery) {
        // We have a q, like '>=sm'. Extract all breakpoints we need media queries for
        const affectedBreakpoints = (0, _extractBreakpointKeys.default)(theme.breakpoints, bpQuery);

        _lodash.default.each(affectedBreakpoints, bp => {
          let parsedFontSizeQuery = (0, _parseFontSizeQuery.default)(cp, theme, fontSizeQuery, bp);

          const fontDecls = _lodash.default.keys(parsedFontSizeQuery).map(prop => (0, _buildDecl.default)(prop, parsedFontSizeQuery[prop]));

          if (needsMediaRule) {
            const originalRule = _postcss.default.rule({
              selector: parent.selector
            });

            const mediaRule = cp.clone({
              name: 'media',
              params: (0, _buildMediaQueryQ.default)(theme.breakpoints, bp)
            });
            originalRule.append(...fontDecls);
            mediaRule.append(originalRule);
            finalRules.push(mediaRule);
          } else {
            parent.append(...fontDecls);
          }
        });
      } else {
        _lodash.default.keys(theme.breakpoints).forEach(bp => {
          let parsedFontSizeQuery = (0, _parseFontSizeQuery.default)(cp, theme, fontSizeQuery, bp);

          const fontDecls = _lodash.default.keys(parsedFontSizeQuery).map(prop => (0, _buildDecl.default)(prop, parsedFontSizeQuery[prop]));

          const mediaRule = cp.clone({
            name: 'media',
            params: (0, _buildMediaQuery.default)(theme.breakpoints, bp)
          });

          const originalRule = _postcss.default.rule({
            selector: parent.selector
          });

          originalRule.append(...fontDecls);
          mediaRule.append(originalRule);
          finalRules.push(mediaRule);
        });
      } // check if parent has anything


      if (!parent.nodes.length) {
        parent.remove();
      }

      if (finalRules.length) {
        css.append(finalRules);
      }
    });
  };
}