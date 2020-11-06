"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseRFS;

var _lodash = _interopRequireDefault(require("lodash"));

var _calcMinFromBreakpoint = _interopRequireDefault(require("./calcMinFromBreakpoint"));

var _calcMaxFromBreakpoint = _interopRequireDefault(require("./calcMaxFromBreakpoint"));

var _getUnit = _interopRequireDefault(require("./getUnit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseRFS(node, theme, size, breakpoint) {
  let minSize;
  let maxSize;

  if (size.indexOf('-') > -1) {
    // alternative syntax - `minSize-maxSize`
    [minSize, maxSize] = size.split('-');
  } else {
    // check size exists in both theme.typography.sizes and theme.typography.rfs.minimum
    if (!_lodash.default.has(theme.typography.sizes, size)) {
      throw node.error(`RFS: No size \`${size}\` found in theme.typography`);
    }

    if (!_lodash.default.has(theme.typography.rfs.minimum, size)) {
      throw node.error(`RFS: No size \`${size}\` found in theme.typography.rfs.minimum`);
    }

    if (!_lodash.default.has(theme.typography.sizes[size], breakpoint)) {
      throw node.error(`RFS: No breakpoint \`${breakpoint}\` found in theme.typography.${size}`);
    }

    if (!_lodash.default.has(theme.typography.rfs.minimum, size)) {
      throw node.error(`RFS: No size \`${size}\` found in theme.typography.rfs.minimum`);
    }

    if (!_lodash.default.has(theme.typography.rfs.minimum[size], breakpoint)) {
      throw node.error(`RFS: No breakpoint \`${breakpoint}\` found in theme.typography.rfs.minimum.${size}`);
    }

    if (_lodash.default.isObject(theme.typography.rfs.minimum[size][breakpoint])) {
      minSize = theme.typography.rfs.minimum[size][breakpoint]['font-size'];
    } else {
      minSize = theme.typography.rfs.minimum[size][breakpoint];
    }

    if (_lodash.default.isObject(theme.typography.sizes[size][breakpoint])) {
      maxSize = theme.typography.sizes[size][breakpoint]['font-size'];
    } else {
      maxSize = theme.typography.sizes[size][breakpoint];
    }
  }

  const sizeUnit = (0, _getUnit.default)(minSize);
  const maxSizeUnit = (0, _getUnit.default)(maxSize);
  let minWidth = (0, _calcMinFromBreakpoint.default)(theme.breakpoints, breakpoint);
  let maxWidth = (0, _calcMaxFromBreakpoint.default)(theme.breakpoints, breakpoint);

  if (!maxWidth) {
    // no max width for this breakpoint. Add 200 to min :)
    // TODO: maybe skip for the largest size? set a flag here and return reg size?
    maxWidth = `${parseFloat(minWidth) + 200}${(0, _getUnit.default)(minWidth)}`;
  }

  const widthUnit = (0, _getUnit.default)(minWidth);
  const maxWidthUnit = (0, _getUnit.default)(maxWidth);
  const rootSize = theme.typography.rootSize;

  if (sizeUnit === null) {
    throw node.error(`RFS: Sizes need unit values - breakpoint: ${breakpoint} - size: ${size}`);
  }

  if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
    throw node.error('RFS: min/max unit types must match');
  }

  if (sizeUnit === 'rem' && widthUnit === 'px') {
    minWidth = pxToRem(minWidth, rootSize);
    maxWidth = pxToRem(maxWidth, rootSize);
  } // Build the responsive type decleration


  const sizeDiff = parseFloat(maxSize) - parseFloat(minSize);
  const rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth);

  if (sizeDiff === 0) {
    // not really responsive. just return the regular max
    return maxSize;
  }

  if (minWidth === '0') {
    minWidth = '320px';
  }

  return `calc(${minSize} + ${sizeDiff} * ((100vw - ${minWidth}) / ${rangeDiff}))`;
}

function pxToRem(px, rootSize) {
  return parseFloat(px) / parseFloat(rootSize) + 'rem';
}