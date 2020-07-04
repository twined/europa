"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFontSizeQuery;

var _lodash = _interopRequireDefault(require("lodash"));

var _splitUnit = _interopRequireDefault(require("./splitUnit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseFontSizeQuery(node, config, fontSizeQuery, breakpoint) {
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

  const fontSize = fontSizeQuery; // get the wanted object

  const themePath = ['theme', 'typography', 'sizes'];
  const path = fontSize.split('.');

  let resolvedFontsize = _lodash.default.get(config, themePath.concat(path));

  if (!resolvedFontsize) {
    // throw node.error(`FONTSIZE: No \`${fontSize}\` size found in theme.typography.sizes.`, { name: fontSize })
    // treat as a hardcoded value
    resolvedFontsize = fontSize;
  }

  if (!_lodash.default.isString(resolvedFontsize)) {
    if (!_lodash.default.has(resolvedFontsize, breakpoint)) {
      throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, {
        name: breakpoint
      });
    }
  }

  if (!modifier) {
    if (_lodash.default.isString(resolvedFontsize)) {
      return { ...{
          'font-size': resolvedFontsize
        },
        ...(lineHeight && {
          'line-height': lineHeight
        })
      };
    }

    if (_lodash.default.isObject(resolvedFontsize[breakpoint])) {
      const props = {};

      _lodash.default.keys(resolvedFontsize[breakpoint]).forEach(key => {
        props[key] = resolvedFontsize[breakpoint][key];
      });

      return props;
    } else {
      return { ...{
          'font-size': resolvedFontsize[breakpoint]
        },
        ...(lineHeight && {
          'line-height': lineHeight
        })
      };
    }
  } else {
    let fs;

    if (_lodash.default.isString(resolvedFontsize)) {
      fs = resolvedFontsize;
    } else if (_lodash.default.isObject(resolvedFontsize[breakpoint])) {
      fs = resolvedFontsize[breakpoint]['font-size'];
    } else {
      fs = resolvedFontsize[breakpoint];
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