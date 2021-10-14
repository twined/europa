"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _buildMediaQueryQ = _interopRequireDefault(require("../../util/buildMediaQueryQ"));

var _extractBreakpointKeys = _interopRequireDefault(require("../../util/extractBreakpointKeys"));

var _fs = _interopRequireDefault(require("fs"));

var _updateSource = _interopRequireDefault(require("../../util/updateSource"));

var _buildDecl = _interopRequireDefault(require("../../util/buildDecl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Display. Basically a shortcut for responsive order rules
 */
var _default = _postcss.default.plugin('europacss-order', getConfig => {
  const config = getConfig();
  const {
    theme: {
      breakpoints,
      breakpointCollections
    }
  } = config;
  return function (css) {
    const finalRules = [];
    css.walkAtRules('order', atRule => {
      const src = atRule.source;
      let selector;
      let wrapInResponsive = false;
      let wrapRow = 'nowrap';
      let gap = null;
      const parent = atRule.parent;
      let grandParent = atRule.parent.parent;

      if (parent.type === 'root') {
        throw atRule.error(`ORDER: Can only be used inside a rule, not on root.`);
      }

      if (atRule.nodes) {
        throw atRule.error(`ORDER: @order should not include children.`);
      }

      let [order = null, bpQuery = null] = _postcss.default.list.space(atRule.params);

      if (bpQuery) {
        wrapInResponsive = true;
      }

      let clonedRule = atRule.clone(); // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space

      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw clonedRule.error(`ORDER: When nesting @order under @responsive, we do not accept a breakpoints query.`, {
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
          throw clonedRule.error(`ORDER: When nesting @order under @responsive, we do not accept a breakpoints query.`, {
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

      const decls = [(0, _buildDecl.default)('order', order)];

      if (wrapInResponsive) {
        const responsiveRule = _postcss.default.atRule({
          name: 'responsive',
          params: bpQuery
        });

        responsiveRule.source = src;
        responsiveRule.append(...decls);
        parent.insertBefore(atRule, responsiveRule);
      } else {
        parent.prepend(...decls);
      }

      atRule.remove();
    });
  };
});

exports.default = _default;