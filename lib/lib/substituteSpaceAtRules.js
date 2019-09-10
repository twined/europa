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

var _parseSize = _interopRequireDefault(require("../util/parseSize"));

var _sizeNeedsBreakpoints = _interopRequireDefault(require("../util/sizeNeedsBreakpoints"));

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
function _default(config) {
  return function (css, result) {
    const responsiveRules = _postcss.default.root();

    const finalRules = [];
    css.walkAtRules(/^space!?/, atRule => {
      let responsiveParent = false;
      let flagAsImportant = false;

      if (atRule.parent.type === 'root') {
        throw atRule.error(`SPACING: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`SPACING: Spacing should not include children.`);
      }

      if (atRule.name === 'space!') {
        flagAsImportant = true;
      } // clone parent, but without atRule


      let cp = atRule.clone();

      let [prop, size, q] = _postcss.default.list.space(cp.params);

      let parent = atRule.parent; // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (q) {
          throw cp.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, {
            name: q
          });
        }

        q = parent.params;
        responsiveParent = true;
      } // what if the parent's parent is @responsive?


      if (!['atrule', 'root'].includes(parent.type) && parent.parent.type === 'atrule' && parent.parent.name === 'responsive') {
        if (q) {
          throw cp.error(`SPACING: When nesting @space under @responsive, we do not accept a breakpoints query.`, {
            name: q
          });
        }

        q = parent.parent.params;
      }

      atRule.remove();

      if (q) {
        // We have a q, like '>=sm'. Extract all breakpoints we need media queries for.
        // Since there is a Q, we HAVE to generate breakpoints even if the sizeQuery
        // doesn't call for it.
        const affectedBreakpoints = (0, _extractBreakpointKeys.default)(config.theme.breakpoints, q);

        _lodash.default.each(affectedBreakpoints, bp => {
          let parsedSize = (0, _parseSize.default)(cp, config, size, bp);
          const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);
          const mediaRule = cp.clone({
            name: 'media',
            params: (0, _buildMediaQueryQ.default)(config.theme.breakpoints, bp)
          });

          if (responsiveParent) {
            // try to find a selector
            if (parent.parent.selector) {
              const originalRule = _postcss.default.rule({
                selector: parent.parent.selector
              });

              originalRule.append(sizeDecls);
              mediaRule.append(originalRule);
            } else {
              mediaRule.append(sizeDecls);
            }
          } else {
            const originalRule = _postcss.default.rule({
              selector: parent.selector
            });

            originalRule.append(sizeDecls);
            mediaRule.append(originalRule);
          }

          finalRules.push(mediaRule);
        });
      } else {
        if ((0, _sizeNeedsBreakpoints.default)(config.theme.spacing, size)) {
          _lodash.default.keys(config.theme.breakpoints).forEach(bp => {
            let parsedSize = (0, _parseSize.default)(cp, config, size, bp);
            const mediaRule = cp.clone({
              name: 'media',
              params: (0, _buildMediaQuery.default)(config.theme.breakpoints, bp)
            });
            const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);

            const originalRule = _postcss.default.rule({
              selector: parent.selector
            });

            originalRule.append(sizeDecls);
            mediaRule.append(originalRule);
            finalRules.push(mediaRule);
          });
        } else {
          let parsedSize = (0, _parseSize.default)(cp, config, size);
          const sizeDecls = (0, _buildDecl.default)(prop, parsedSize, flagAsImportant);
          parent.prepend(sizeDecls);
        }
      }

      const grandparent = parent.parent; // check if parent has anything

      if (!parent.nodes.length) {
        parent.remove();
      }

      if (grandparent && !grandparent.nodes.length) {
        grandparent.remove();
      }

      if (finalRules.length) {
        css.append(finalRules);
      }
    });
  };
}