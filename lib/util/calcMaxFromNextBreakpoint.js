"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calcMaxFromNextBreakpoint;

var _calcMaxFromBreakpoint = _interopRequireDefault(require("./calcMaxFromBreakpoint"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function calcMaxFromNextBreakpoint(breakpoints, bpKey) {
  const keys = Object.keys(breakpoints);
  const idx = keys.indexOf(bpKey);

  if (idx <= keys.length - 1) {
    const nextKey = keys[idx + 1];
    return breakpoints[nextKey];
  }

  return (0, _calcMaxFromBreakpoint.default)(breakpoints, bpKey);
}