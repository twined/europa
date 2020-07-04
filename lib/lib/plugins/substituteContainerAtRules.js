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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * CONTAINER
 *
 * Examples:
 *
 *    @container;
 *
 */
var _default = _postcss.default.plugin('europacss-container', getConfig => {
  return function (css) {
    const {
      theme: {
        breakpoints,
        breakpointCollections,
        container
      }
    } = getConfig();
    const finalRules = [];
    css.walkAtRules('container', atRule => {
      let needsMediaRule = true;
      let affectedBreakpoints;
      let exact = false;
      const parent = atRule.parent;
      const src = atRule.source;

      if (atRule.parent.type === 'root') {
        throw atRule.error(`CONTAINER: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`CONTAINER: Container should not include children.`);
      } // if we have a q, like '>=sm'. Extract all breakpoints we need media queries for


      let q = atRule.params; // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (q) {
          throw atRule.error(`CONTAINER: When nesting @container under @responsive, we do not accept a breakpoints query.`, {
            name: q
          });
        }

        q = parent.params;
        needsMediaRule = false;
      } // what if the parent's parent is @responsive?


      if (!['atrule', 'root'].includes(parent.type) && parent.parent.type === 'atrule' && parent.parent.name === 'responsive') {
        if (q) {
          throw atRule.error(`CONTAINER: When nesting @container under @responsive, we do not accept a breakpoints query.`, {
            name: q
          });
        }

        q = parent.parent.params;
        needsMediaRule = false;
      }

      if (q) {
        affectedBreakpoints = (0, _extractBreakpointKeys.default)({
          breakpoints,
          breakpointCollections
        }, q);
        exact = true;
      } else {
        affectedBreakpoints = _lodash.default.keys(breakpoints);
      } // build media queries


      affectedBreakpoints.forEach(bp => {
        if (!_lodash.default.has(container.padding, bp)) {
          throw atRule.error(`CONTAINER: No \`${bp}\` breakpoint found in \`container.padding\`.`);
        }

        if (!_lodash.default.has(container.maxWidth, bp)) {
          throw atRule.error(`CONTAINER: No \`${bp}\` breakpoint found in \`container.padding\`.`);
        }

        const paddingValue = container.padding[bp];
        const containerDecl = (0, _buildDecl.default)('padding-x', paddingValue);
        const maxWidthValue = container.maxWidth[bp];
        const containerMaxWidthDecl = (0, _buildDecl.default)('max-width', maxWidthValue);
        const containerMarginDecl = (0, _buildDecl.default)('margin-x', 'auto');
        const containerWidthDecl = (0, _buildDecl.default)('width', '100%');

        if (needsMediaRule) {
          const mediaRule = _postcss.default.atRule({
            name: 'media',
            params: exact ? (0, _buildMediaQueryQ.default)({
              breakpoints,
              breakpointCollections
            }, bp) : (0, _buildMediaQuery.default)(breakpoints, bp)
          });

          const originalRule = _postcss.default.rule({
            selector: parent.selector
          });

          originalRule.source = src;
          originalRule.append(containerDecl);
          originalRule.append(containerMaxWidthDecl);
          originalRule.append(containerMarginDecl);
          originalRule.append(containerWidthDecl);
          mediaRule.append(originalRule);
          finalRules.push(mediaRule);
        } else {
          parent.append(containerDecl);
          parent.append(containerMaxWidthDecl);
          parent.append(containerMarginDecl);
          parent.append(containerWidthDecl);
        }
      });
      parent.after(finalRules);
      atRule.remove(); // check if parent has anything

      if (parent && !parent.nodes.length) {
        parent.remove();
      }
    });
  };
});

exports.default = _default;