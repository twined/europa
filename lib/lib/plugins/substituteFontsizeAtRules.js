"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _buildMediaQuery = _interopRequireDefault(require("../../util/buildMediaQuery"));

var _buildMediaQueryQ = _interopRequireDefault(require("../../util/buildMediaQueryQ"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

var _postcss = _interopRequireDefault(require("postcss"));

var _extractBreakpointKeys = _interopRequireDefault(require("../../util/extractBreakpointKeys"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

var _parseFontSizeQuery = _interopRequireDefault(require("../../util/parseFontSizeQuery"));

var _sizeNeedsBreakpoints = _interopRequireDefault(require("../../util/sizeNeedsBreakpoints"));

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
var _default = _postcss.default.plugin('europacss-fontsize', getConfig => {
  return function (css) {
    const config = getConfig();
    const {
      theme
    } = config;
    const {
      breakpoints,
      breakpointCollections
    } = theme;

    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('fontsize', atRule => {
      let selector;

      if (atRule.parent.type === 'root') {
        throw atRule.error(`FONTSIZE: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`FONTSIZE: @fontsize should not include children.`);
      } // clone parent, but without atRule


      let clonedRule = atRule.clone();

      let [fontSizeQuery, bpQuery] = _postcss.default.list.space(clonedRule.params);

      let parent = atRule.parent;
      let grandParent = atRule.parent.parent; // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @fontsize

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, {
            name: bpQuery
          });
        }

        bpQuery = parent.params;

        if (grandParent.selector) {
          selector = grandParent.selector;
        }
      } else if (grandParent.name === 'responsive') {
        // check if grandparent is @responsive
        if (bpQuery) {
          throw clonedRule.error(`FONTSIZE: When nesting @fontsize under @responsive, we do not accept a breakpoints query.`, {
            name: bpQuery
          });
        }

        bpQuery = grandParent.params;

        if (parent.selector[0] === '&') {
          selector = parent.selector.replace('&', grandParent.parent.selector);
        } else {
          selector = parent.selector;
        }
      }

      if (!selector && parent.selector) {
        selector = parent.selector;
      }

      atRule.remove();

      if (bpQuery) {
        // We have a q, like '>=sm'. Extract all breakpoints we need media queries for
        const affectedBreakpoints = (0, _extractBreakpointKeys.default)({
          breakpoints,
          breakpointCollections
        }, bpQuery);

        _lodash.default.each(affectedBreakpoints, bp => {
          let parsedFontSizeQuery = (0, _parseFontSizeQuery.default)(clonedRule, theme, fontSizeQuery, bp);

          const fontDecls = _lodash.default.keys(parsedFontSizeQuery).map(prop => (0, _buildDecl.default)(prop, parsedFontSizeQuery[prop]));

          const mediaRule = clonedRule.clone({
            name: 'media',
            params: (0, _buildMediaQueryQ.default)({
              breakpoints,
              breakpointCollections
            }, bp)
          });

          if (selector) {
            const originalRule = _postcss.default.rule({
              selector
            }).append(...fontDecls);

            mediaRule.append(originalRule);
          } else {
            mediaRule.append(fontDecls);
          }

          finalRules.push(mediaRule);
        });
      } else {
        _lodash.default.keys(breakpoints).forEach(bp => {
          let parsedFontSizeQuery = (0, _parseFontSizeQuery.default)(clonedRule, theme, fontSizeQuery, bp);

          const fontDecls = _lodash.default.keys(parsedFontSizeQuery).map(prop => (0, _buildDecl.default)(prop, parsedFontSizeQuery[prop]));

          const mediaRule = clonedRule.clone({
            name: 'media',
            params: (0, _buildMediaQuery.default)(breakpoints, bp)
          });

          const originalRule = _postcss.default.rule({
            selector: parent.selector
          });

          originalRule.append(...fontDecls);
          mediaRule.append(originalRule);
          finalRules.push(mediaRule);
        });
      } // check if parent has anything


      if (parent && !parent.nodes.length) {
        parent.remove();
      } // check if grandparent has anything


      if (grandParent && !grandParent.nodes.length) {
        grandParent.remove();
      }
    });

    if (finalRules.length) {
      css.append(finalRules);
    }
  };
});

exports.default = _default;