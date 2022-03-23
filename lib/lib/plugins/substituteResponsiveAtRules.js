"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _postcss = _interopRequireDefault(require("postcss"));

var _cloneNodes = _interopRequireDefault(require("../../util/cloneNodes"));

var _buildMediaQueryQ = _interopRequireDefault(require("../../util/buildMediaQueryQ"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _postcss.default.plugin('europacss-responsive', getConfig => {
  return function (css) {
    const config = getConfig();
    const {
      theme: {
        breakpoints,
        breakpointCollections
      }
    } = config;
    const finalRules = [];
    css.walkAtRules('responsive', atRule => {
      const parent = atRule.parent;
      let root = false;

      if (parent.type === 'root') {
        root = true;
      }

      const nodes = atRule.nodes;

      if (!nodes) {
        throw atRule.error(`RESPONSIVE: Must include child nodes.`, {
          word: 'responsive'
        });
      }

      const params = atRule.params;

      if (!params) {
        throw atRule.error(`RESPONSIVE: Must include breakpoint selectors`, {
          word: 'responsive'
        });
      } // clone parent, but without atRule


      let cp = atRule.clone();
      const src = atRule.source;
      atRule.remove(); // convert to query string

      const mediaQuery = (0, _buildMediaQueryQ.default)({
        breakpoints,
        breakpointCollections
      }, params); // create a media query

      const mediaRule = _postcss.default.atRule({
        name: 'media',
        params: mediaQuery
      });

      if (root) {
        // originalRule is not used
        // check if nodes. if not we toss out
        if (nodes.length) {
          mediaRule.append(...(0, _cloneNodes.default)(nodes));
        }
      } else {
        const originalRule = _postcss.default.rule({
          selector: parent.selector
        });

        originalRule.source = src;
        originalRule.append(...(0, _cloneNodes.default)(nodes));
        mediaRule.append(originalRule);
      } // check if parent has anything


      if (!parent.nodes.length) {
        parent.remove();
      } // add to finalRules if we have nodes


      if (mediaRule.nodes && mediaRule.nodes.length) {
        finalRules.push(mediaRule);
      }
    });

    if (finalRules.length) {
      css.append(finalRules);
    }
  };
});

exports.default = _default;