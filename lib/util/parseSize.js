"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseSize;

var _lodash = _interopRequireDefault(require("lodash"));

var _renderCalcWithRounder = _interopRequireDefault(require("./renderCalcWithRounder"));

var _splitUnit = _interopRequireDefault(require("./splitUnit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseSize(node, config, size, bp) {
  if (size === '0') {
    return '0';
  }

  if (size === 'container') {
    // get size from container.padding
    if (!_lodash.default.has(config.theme.container.padding, bp)) {
      throw node.error(`SPACING: No \`${bp}\` breakpoint found in \`theme.container.padding\`.`, {
        name: bp
      });
    }

    return config.theme.container.padding[bp];
  }

  if (!_lodash.default.has(config.theme.spacing, size)) {
    // size is not found in spacingMap, treat it as a value
    if (size.indexOf('/') !== -1) {
      // it's a fraction, check if the first part is a spacing key
      const [head, tail] = size.split('/');

      if (!_lodash.default.has(config.theme.spacing, head)) {
        if (!bp) {
          throw node.error('SPACING: Fractions need a breakpoint due to gutter calculations', {
            name: bp
          });
        }

        let gutterMultiplier;
        let sizeMath;
        let [wantedColumns, totalColumns] = size.split('/');

        if (wantedColumns.indexOf(':') !== -1) {
          // we have a gutter indicator (@column 6:1/12) -- meaning we want X times the gutter to be added
          // first split the fraction
          [wantedColumns, gutterMultiplier] = wantedColumns.split(':');
        }

        const gutterSize = config.theme.columns.gutters[bp];
        const [gutterValue, gutterUnit] = (0, _splitUnit.default)(gutterSize);

        if (wantedColumns / totalColumns === 1) {
          sizeMath = '100%';
        } else {
          sizeMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`;
        }

        if (gutterMultiplier) {
          const gutterMultiplierValue = gutterValue * gutterMultiplier;
          return (0, _renderCalcWithRounder.default)(`${sizeMath} + ${gutterMultiplierValue}${gutterUnit}`);
        } else {
          return sizeMath === '100%' ? sizeMath : (0, _renderCalcWithRounder.default)(sizeMath);
        }
      }

      if (!_lodash.default.has(config.theme.spacing[head], bp)) {
        throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${head}\`.`);
      }

      return `calc(${config.theme.spacing[head][bp]}/${tail})`;
    }

    if (size.indexOf('*') !== -1) {
      // it's *, check if the first part is a spacing key
      const [head, tail] = size.split('*');

      if (!_lodash.default.has(config.theme.spacing, head)) {
        return (0, _renderCalcWithRounder.default)(size);
      }

      if (!_lodash.default.has(config.theme.spacing[head], bp)) {
        throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${head}\`.`);
      }

      return `calc(${config.theme.spacing[head][bp]}*${tail})`;
    }

    if (size.indexOf('vertical-rhythm(') !== -1) {
      const params = size.match(/vertical-rhythm\((.*)\)/)[1];
      const [key, lineHeight = config.theme.typography.lineHeight[bp]] = params.split(',').map(p => p.trim());

      const obj = _lodash.default.get(config, key.split('.')); // does it exist?


      if (!obj) {
        throw node.error(`SPACING: No \`${key}\` size key theme object.`);
      }

      const fs = _lodash.default.isObject(obj[bp]) ? obj[bp]['font-size'] : obj[bp];
      return `calc(${fs} * ${lineHeight})`;
    } // it's a number. we treat regular numbers as a multiplier of col gutter.


    return renderColGutterMultiplier(node, size, bp, config);
  }

  if (!_lodash.default.has(config.theme.spacing[size], bp)) {
    throw node.error(`SPACING: No \`${bp}\` breakpoint found in spacing map for \`${size}\`.`);
  }

  return config.theme.spacing[size][bp];
}

function renderColGutterMultiplier(node, multiplier, bp, {
  theme
}) {
  // grab gutter for this breakpoint
  if (!_lodash.default.has(theme.columns.gutters, bp)) {
    throw node.error(`parseSize: No \`${bp}\` breakpoint found in gutter map.`, {
      name: bp
    });
  }

  const gutter = theme.columns.gutters[bp];
  const [val, unit] = (0, _splitUnit.default)(gutter);
  return `${val * multiplier}${unit}`;
}