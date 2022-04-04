"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseFontSizeQuery;

var _lodash = _interopRequireDefault(require("lodash"));

var _splitUnit = _interopRequireDefault(require("./splitUnit"));

var _parseRFSQuery = _interopRequireDefault(require("./parseRFSQuery"));

var _parseVWQuery = _interopRequireDefault(require("./parseVWQuery"));

var _replaceWildcards = _interopRequireDefault(require("./replaceWildcards"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseFontSizeQuery(node, config, fontSizeQuery, breakpoint) {
  let lineHeight;
  let modifier;
  let renderedFontSize;

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/');
  }

  if (fontSizeQuery.indexOf('between(') === -1) {
    if (fontSizeQuery.indexOf('(') !== -1) {
      // we have a modifier xs(1.6) --> multiplies the size with 1.6
      modifier = fontSizeQuery.match(/\((.*)\)/)[1];
      fontSizeQuery = fontSizeQuery.split('(')[0];
    }
  }

  const themePath = ['theme', 'typography', 'sizes'];
  const fontSize = fontSizeQuery;
  const path = fontSize.split('.');

  let resolvedFontsize = _lodash.default.get(config, themePath.concat(path));

  if (!resolvedFontsize) {
    resolvedFontsize = fontSize;
  }

  if (!_lodash.default.isString(resolvedFontsize)) {
    resolvedFontsize = (0, _replaceWildcards.default)(resolvedFontsize, config);

    if (!_lodash.default.has(resolvedFontsize, breakpoint)) {
      throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, {
        name: breakpoint
      });
    }
  } else {
    if (resolvedFontsize.indexOf('between(') !== -1) {
      // responsive font size
      return (0, _parseRFSQuery.default)(node, config, resolvedFontsize, lineHeight, breakpoint);
    }
  }

  if (!modifier) {
    if (_lodash.default.isString(resolvedFontsize)) {
      if (resolvedFontsize.endsWith('vw')) {
        if (lineHeight && lineHeight.endsWith('vw')) {
          return (0, _parseVWQuery.default)(node, config, resolvedFontsize, lineHeight, breakpoint, false);
        } else {
          return { ...{
              'font-size': (0, _parseVWQuery.default)(node, config, resolvedFontsize, lineHeight, breakpoint, true)
            },
            ...(lineHeight && {
              'line-height': lineHeight
            })
          };
        }
      } else {
        return { ...{
            'font-size': resolvedFontsize
          },
          ...(lineHeight && {
            'line-height': lineHeight
          })
        };
      }
    }

    if (_lodash.default.isObject(resolvedFontsize[breakpoint])) {
      const props = {};

      _lodash.default.keys(resolvedFontsize[breakpoint]).forEach(key => {
        const v = resolvedFontsize[breakpoint][key];

        if (v.endsWith('vw')) {
          props[key] = (0, _parseVWQuery.default)(node, config, resolvedFontsize[breakpoint][key], lineHeight, breakpoint, true);
        } else {
          props[key] = resolvedFontsize[breakpoint][key];
        }
      });

      return props;
    } else {
      if (resolvedFontsize[breakpoint].indexOf('between(') !== -1) {
        // responsive font size
        return (0, _parseRFSQuery.default)(node, config, resolvedFontsize[breakpoint], lineHeight, breakpoint);
      }

      if (resolvedFontsize[breakpoint].endsWith('vw')) {
        return (0, _parseVWQuery.default)(node, config, resolvedFontsize[breakpoint], lineHeight, breakpoint);
      }

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