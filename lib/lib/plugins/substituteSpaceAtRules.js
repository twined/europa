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

var _parseSize = _interopRequireDefault(require("../../util/parseSize"));

var _sizeNeedsBreakpoints = _interopRequireDefault(require("../../util/sizeNeedsBreakpoints"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SPACE
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
var _default = _postcss.default.plugin('europacss-space', getConfig => {
  return function (css, result) {
    const config = getConfig();
    const finalRules = [];
    css.walkAtRules(/^space!?/, atRule => {
      let flagAsImportant = false;
      let selector;

      if (atRule.parent.type === 'root') {
        throw atRule.error(`SPACING: Should only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`SPACING: Spacing should not include children.`);
      }

      if (atRule.name === 'space!') {
        flagAsImportant = true;
      } // Clone rule to act upon. We remove the atRule from DOM later, but
      // we still need some data from the original.


      let clonedRule = atRule.clone();

      let [prop, size, bpQuery] = _postcss.default.list.space(clonedRule.params);

      let parent = atRule.parent;
      let grandParent = atRule.parent.parent; // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, {
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
          throw clonedRule.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, {
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
        // We have a breakpoint query, like '>=sm'. Extract all breakpoints
        // we need media queries for. Since there is a breakpoint query, we
        // HAVE to generate breakpoints even if the sizeQuery doesn't
        // call for it.
        const affectedBreakpoints = (0, _extractBreakpointKeys.default)(config.theme.breakpoints, bpQuery);

        _lodash.default.each(affectedBreakpoints, bp => {
          let parsedSize = (0, _parseSize.default)(clonedRule, config, size, bp);
          const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);
          const mediaRule = clonedRule.clone({
            name: 'media',
            params: (0, _buildMediaQueryQ.default)(config.theme.breakpoints, bp)
          });

          if (selector) {
            const originalRule = _postcss.default.rule({
              selector
            }).append(sizeDecls);

            mediaRule.append(originalRule);
          } else {
            mediaRule.append(sizeDecls);
          }

          finalRules.push(mediaRule);
        });
      } else {
        if ((0, _sizeNeedsBreakpoints.default)(config.theme.spacing, size)) {
          _lodash.default.keys(config.theme.breakpoints).forEach(bp => {
            let parsedSize = (0, _parseSize.default)(clonedRule, config, size, bp);
            const mediaRule = clonedRule.clone({
              name: 'media',
              params: (0, _buildMediaQuery.default)(config.theme.breakpoints, bp)
            });
            const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);

            const originalRule = _postcss.default.rule({
              selector: parent.selector
            }).append(sizeDecls);

            mediaRule.append(originalRule);
            finalRules.push(mediaRule);
          });
        } else {
          let parsedSize = (0, _parseSize.default)(clonedRule, config, size);
          const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);
          parent.prepend(sizeDecls);
        }
      } // check if parent has anything


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