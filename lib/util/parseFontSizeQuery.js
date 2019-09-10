"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFontSizeQuery;

var _lodash = _interopRequireDefault(require("lodash"));

var _splitUnit = _interopRequireDefault(require("./splitUnit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseFontSizeQuery(node, theme, fontSizeQuery, breakpoint) {
  let lineHeight;
  let modifier;
  let renderedFontSize;

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/');
  }

  if (fontSizeQuery.indexOf('(') !== -1) {
    // we have a modifier xs(1.6) --> multiplies the size with 1.6
    modifier = fontSizeQuery.match(/\((.*)\)/)[1];
    fontSizeQuery = fontSizeQuery.split('(')[0];
  }

  const fontSize = fontSizeQuery;

  if (!_lodash.default.has(theme.typography.sizes, fontSize)) {
    throw node.error(`FONTSIZE: No \`${fontSize}\` size found in theme.typography.sizes.`, {
      name: fontSize
    });
  }

  if (!_lodash.default.has(theme.typography.sizes[fontSize], breakpoint)) {
    throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, {
      name: breakpoint
    });
  }

  if (!modifier) {
    if (_lodash.default.isObject(theme.typography.sizes[fontSize][breakpoint])) {
      const props = {};

      _lodash.default.keys(theme.typography.sizes[fontSize][breakpoint]).forEach(key => {
        props[key] = theme.typography.sizes[fontSize][breakpoint][key];
      });

      return props;
    } else {
      return { ...{
          'font-size': theme.typography.sizes[fontSize][breakpoint]
        },
        ...(lineHeight && {
          'line-height': lineHeight
        })
      };
    }
  } else {
    let fs;

    if (_lodash.default.isObject(theme.typography.sizes[fontSize][breakpoint])) {
      fs = theme.typography.sizes[fontSize][breakpoint]['font-size'];
    } else {
      fs = theme.typography.sizes[fontSize][breakpoint];
    }

    const [val, unit] = (0, _splitUnit.default)(fs);
    renderedFontSize = `${val * modifier}${unit}`;
    return { ...{
        'font-size': renderedFontSize
      },
      ...(lineHeight && {
        'line-height': lineHeight
      })
    };
  }
}