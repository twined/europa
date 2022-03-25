"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderCalcWithRounder;

var _reduceCssCalc = _interopRequireDefault(require("reduce-css-calc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderCalcWithRounder(val) {
  return (0, _reduceCssCalc.default)(`calc(${val})`, 150);
}