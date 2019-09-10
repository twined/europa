"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildSpecificMediaQuery;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// for single breakpoints, use buildSpecificMediaQuery
function calcMax(breakpoints, bpKey) {
  const keys = Object.keys(breakpoints);
  const idx = keys.indexOf(bpKey);

  if (idx < keys.length - 1) {
    const nextKey = keys[idx + 1];
    return `${parseInt(breakpoints[nextKey].replace('px', '')) - 1}px`;
  }

  return null;
}

function buildSpecificMediaQuery(breakpoints, bpKey) {
  let screens;
  const min = breakpoints[bpKey];
  const max = calcMax(breakpoints, bpKey);

  if (max) {
    screens = {
      min,
      max
    };
  } else {
    screens = {
      min
    };
  }

  if (_lodash.default.isString(screens)) {
    screens = {
      min: screens
    };
  }

  if (!Array.isArray(screens)) {
    screens = [screens];
  }

  return (0, _lodash.default)(screens).map(screen => {
    return (0, _lodash.default)(screen).map((value, feature) => {
      feature = _lodash.default.get({
        min: 'min-width',
        max: 'max-width'
      }, feature, feature);
      return `(${feature}: ${value})`;
    }).join(' and ');
  }).join(', ');
}