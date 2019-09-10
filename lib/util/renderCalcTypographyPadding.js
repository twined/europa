"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderCalcTypographyPadding;

var _reduceCssCalc = _interopRequireDefault(require("reduce-css-calc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderCalcTypographyPadding(val, {
  typography: {
    paddingDivider
  }
}) {
  // TODO: should paddingDivider be a map of breakpoints? Different divider values per breakpoint?
  return (0, _reduceCssCalc.default)(`calc(100% * ${val} / ${paddingDivider})`, 10);
}