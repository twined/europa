"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _buildMediaQuery = _interopRequireDefault(require("../../util/buildMediaQuery"));

var _buildMediaQueryQ = _interopRequireDefault(require("../../util/buildMediaQueryQ"));

var _postcss = _interopRequireDefault(require("postcss"));

var _extractBreakpointKeys = _interopRequireDefault(require("../../util/extractBreakpointKeys"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

var _parseSize = _interopRequireDefault(require("../../util/parseSize"));

var _advancedBreakpointQuery = _interopRequireDefault(require("../../util/advancedBreakpointQuery"));

var _splitBreakpoints = _interopRequireDefault(require("../../util/splitBreakpoints"));

var _reduceCssCalc = _interopRequireDefault(require("reduce-css-calc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * For some reason, Firefox is not consistent with how it calculates vw widths.
 * This manifests through our `@column` helper when wrapping. Sometimes when
 * resizing, it will flicker the element down to the next row and up again, as
 * if there is not enough room for the specified number of items to flex before
 * wrap. We try to circumvent this by setting the element's `max-width` 0.002vw
 * wider than the flex-basis.
 */
const FIX_FIREFOX_FLEX_VW_BUG = true;
/**
 * COLUMN
 *
 * @param {sizeQuery}
 * @param [breakpointQuery]
 * @param [alignment]
 *
 * Examples:
 *
 *    @column 6/12;
 *    @column 6/12 xs;
 *    @column 6/12 xs center;
 *
 *    @column 6:1/12;
 *    @column calc(var[6/12]);
 *
 */

var _default = _postcss.default.plugin('europacss-column', getConfig => {
  return function (css) {
    const config = getConfig();
    const {
      theme: {
        breakpoints,
        breakpointCollections,
        spacing,
        columns
      }
    } = config;

    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('column', atRule => {
      const src = atRule.source;

      let [suppliedSize, suppliedBreakpoint] = _postcss.default.list.space(atRule.params);

      let needsBreakpoints = false;
      let alreadyResponsive = false;
      let flexSize;
      let wantedColumns;
      let totalColumns;
      let fraction;
      let gutterMultiplier;
      let flexDecls = [];

      if (atRule.parent.type === 'root') {
        throw atRule.error(`COLUMN: Can only be used inside a rule, not on root.`);
      }

      if (suppliedSize.indexOf('@') > -1) {
        throw atRule.error(`COLUMN: Old size@breakpoint syntax is removed. Use a space instead`);
      }

      const parent = atRule.parent;
      const grandParent = atRule.parent.parent; // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (suppliedBreakpoint) {
          throw atRule.error(`COLUMN: When nesting @column under @responsive, we do not accept a breakpoints query.`, {
            name: suppliedBreakpoint
          });
        } // try to grab the breakpoint


        if ((0, _advancedBreakpointQuery.default)(parent.params)) {
          // parse the breakpoints
          suppliedBreakpoint = (0, _extractBreakpointKeys.default)({
            breakpoints,
            breakpointCollections
          }, parent.params).join('/');
        } else {
          suppliedBreakpoint = parent.params;
        }

        if (parent.params.indexOf('/')) {
          // multiple breakpoints, we can't use the breakpoints
          alreadyResponsive = false;
        } else {
          alreadyResponsive = true;
        }
      }

      if (!suppliedBreakpoint) {
        needsBreakpoints = true;
      } // what if the parent's parent is @responsive?


      if (!['atrule', 'root'].includes(parent.type) && grandParent.type === 'atrule' && grandParent.name === 'responsive') {
        if (suppliedBreakpoint) {
          throw atRule.error(`COLUMN: When nesting @column under  responsive, we do not accept a breakpoints query.`, {
            name: suppliedBreakpoint
          });
        }

        suppliedBreakpoint = grandParent.params;
      }

      if (suppliedBreakpoint && (0, _advancedBreakpointQuery.default)(suppliedBreakpoint)) {
        suppliedBreakpoint = (0, _extractBreakpointKeys.default)({
          breakpoints,
          breakpointCollections
        }, suppliedBreakpoint).join('/');
      }

      if (needsBreakpoints) {
        _lodash.default.keys(breakpoints).forEach(bp => {
          let parsedSize = (0, _parseSize.default)(atRule, config, suppliedSize, bp);
          flexDecls = [];
          createFlexDecls(flexDecls, parsedSize);

          const originalRule = _postcss.default.rule({
            selector: parent.selector
          });

          originalRule.source = src;
          originalRule.append(...flexDecls);

          const mediaRule = _postcss.default.atRule({
            name: 'media',
            params: (0, _buildMediaQuery.default)(breakpoints, bp)
          });

          mediaRule.append(originalRule);
          finalRules.push(mediaRule);
        });
      } else {
        // has suppliedBreakpoint, either from a @responsive parent, or a supplied bpQuery
        if (alreadyResponsive) {
          flexDecls = [];
          let parsedSize = (0, _parseSize.default)(atRule, config, suppliedSize, suppliedBreakpoint);
          createFlexDecls(flexDecls, parsedSize);
          atRule.parent.append(...flexDecls);
        } else {
          (0, _splitBreakpoints.default)(suppliedBreakpoint).forEach(bp => {
            flexDecls = [];
            let parsedSize = (0, _parseSize.default)(atRule, config, suppliedSize, bp);
            createFlexDecls(flexDecls, parsedSize);
            let originalRule;

            if (parent.selector) {
              originalRule = _postcss.default.rule({
                selector: parent.selector
              });
            } else {
              originalRule = _postcss.default.rule({
                selector: grandParent.selector
              });
            }

            originalRule.source = src;
            originalRule.append(...flexDecls);

            const mediaRule = _postcss.default.atRule({
              name: 'media',
              params: (0, _buildMediaQueryQ.default)({
                breakpoints,
                breakpointCollections
              }, bp)
            });

            mediaRule.source = src;
            mediaRule.append(originalRule);
            finalRules.push(mediaRule);
          });
        }
      }

      atRule.remove(); // check if parent has anything

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

function createFlexDecls(flexDecls, flexSize) {
  let maxWidth;

  if (FIX_FIREFOX_FLEX_VW_BUG) {
    maxWidth = (0, _reduceCssCalc.default)(`calc(${flexSize} - 0.002vw)`, 150);
  } else {
    maxWidth = flexSize;
  }

  flexDecls.push((0, _buildDecl.default)('position', 'relative'));
  flexDecls.push((0, _buildDecl.default)('flex-grow', '0'));
  flexDecls.push((0, _buildDecl.default)('flex-shrink', '0'));
  flexDecls.push((0, _buildDecl.default)('flex-basis', flexSize));
  flexDecls.push((0, _buildDecl.default)('max-width', maxWidth));
}