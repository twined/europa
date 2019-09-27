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

var _splitUnit = _interopRequireDefault(require("../../util/splitUnit"));

var _renderCalcWithRounder = _interopRequireDefault(require("../../util/renderCalcWithRounder"));

var _advancedBreakpointQuery = _interopRequireDefault(require("../../util/advancedBreakpointQuery"));

var _multipleBreakpoints = _interopRequireDefault(require("../../util/multipleBreakpoints"));

var _splitBreakpoints = _interopRequireDefault(require("../../util/splitBreakpoints"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 *
 */
var _default = _postcss.default.plugin('europacss-column', getConfig => {
  /*
  calc(100% * 1/6 - (120px - 1/6 * 120px))
  calc(100% * 2/6 - (120px - 1/6 * 240px))
  calc(100% * 3/6 - (120px - 1/6 * 360px))
  calc(100% * 4/6 - (120px - 1/6 * 480px))
  calc(100% * 5/6 - (120px - 1/6 * 600px))
  100%
  */
  return function (css) {
    const {
      theme: {
        breakpoints,
        spacing,
        columns
      }
    } = getConfig();

    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules('column', atRule => {
      let [suppliedSize, suppliedBreakpoint] = atRule.params.split(' ');
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
          suppliedBreakpoint = (0, _extractBreakpointKeys.default)(breakpoints, parent.params).join('/');
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
        suppliedBreakpoint = (0, _extractBreakpointKeys.default)(breakpoints, suppliedBreakpoint).join('/');
      }

      [wantedColumns, totalColumns] = suppliedSize.split('/');

      if (wantedColumns.indexOf(':') !== -1) {
        // we have a gutter indicator (@column 6:1/12) -- meaning we want X times the gutter to be added
        // first split the fraction
        [wantedColumns, gutterMultiplier] = wantedColumns.split(':');
      }

      if (needsBreakpoints) {
        _lodash.default.keys(breakpoints).forEach(bp => {
          let columnMath;
          let gutterSize = columns.gutters[bp];
          const [gutterValue, gutterUnit] = (0, _splitUnit.default)(gutterSize);

          if (wantedColumns / totalColumns === 1) {
            columnMath = '100%';
          } else {
            columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`;
          }

          if (gutterMultiplier) {
            let gutterMultiplierValue = gutterValue * gutterMultiplier;
            flexSize = (0, _renderCalcWithRounder.default)(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`);
          } else {
            flexSize = columnMath === '100%' ? columnMath : (0, _renderCalcWithRounder.default)(columnMath);
          }

          flexDecls = [];
          createFlexDecls(flexDecls, flexSize);

          const originalRule = _postcss.default.rule({
            selector: parent.selector
          });

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
          let columnMath;
          let gutterSize = columns.gutters[suppliedBreakpoint];
          let [gutterValue, gutterUnit] = (0, _splitUnit.default)(gutterSize);

          if (wantedColumns / totalColumns === 1) {
            columnMath = '100%';
          } else {
            columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`;
          }

          if (gutterMultiplier) {
            let gutterMultiplierValue = gutterValue * gutterMultiplier;
            flexSize = (0, _renderCalcWithRounder.default)(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`);
          } else {
            flexSize = columnMath === '100%' ? columnMath : (0, _renderCalcWithRounder.default)(columnMath);
          }

          createFlexDecls(flexDecls, flexSize);
          atRule.parent.append(...flexDecls);
        } else {
          (0, _splitBreakpoints.default)(suppliedBreakpoint).forEach(bp => {
            flexDecls = [];
            let columnMath;
            let gutterSize = columns.gutters[bp];

            if (!gutterSize) {
              throw atRule.error(`COLUMN: no \`columns.gutters\` found for breakpoint \`${bp}\``);
            }

            let [gutterValue, gutterUnit] = (0, _splitUnit.default)(gutterSize);

            if (wantedColumns / totalColumns === 1) {
              columnMath = '100%';
            } else {
              columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`;
            }

            if (gutterMultiplier) {
              let gutterMultiplierValue = gutterValue * gutterMultiplier;
              flexSize = (0, _renderCalcWithRounder.default)(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`);
            } else {
              flexSize = columnMath === '100%' ? columnMath : (0, _renderCalcWithRounder.default)(columnMath);
            }

            createFlexDecls(flexDecls, flexSize);
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

            originalRule.append(...flexDecls);

            const mediaRule = _postcss.default.atRule({
              name: 'media',
              params: (0, _buildMediaQueryQ.default)(breakpoints, bp)
            });

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

      if (finalRules.length) {
        css.append(finalRules);
      }
    });
  };
});

exports.default = _default;

function createFlexDecls(flexDecls, flexSize) {
  flexDecls.push((0, _buildDecl.default)('position', 'relative'));
  flexDecls.push((0, _buildDecl.default)('flex-grow', '0'));
  flexDecls.push((0, _buildDecl.default)('flex-shrink', '0'));
  flexDecls.push((0, _buildDecl.default)('flex-basis', flexSize));
  flexDecls.push((0, _buildDecl.default)('max-width', flexSize));
}