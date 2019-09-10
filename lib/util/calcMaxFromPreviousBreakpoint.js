"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calcMaxFromPreviousBreakpoint;

var _calcMaxFromBreakpoint = _interopRequireDefault(require("./calcMaxFromBreakpoint"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function calcMaxFromPreviousBreakpoint(breakpoints, bpKey) {
  const keys = Object.keys(breakpoints);
  const idx = keys.indexOf(bpKey);

  if (idx > 0) {
    return `${parseInt(breakpoints[bpKey].replace('px', '')) - 1}px`;
  }

  return (0, _calcMaxFromBreakpoint.default)(breakpoints, bpKey);
}