"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = extractBreakpointKeys;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractBreakpointKeys(breakpoints, q) {
  const bps = [];

  const keys = _lodash.default.keys(breakpoints);

  switch (q[0]) {
    case '=':
      throw new Error('parseQ: Mediaqueries should never start with =');

    case '<':
      if (q[1] === '=') {
        const key = q.substring(2);
        const idx = keys.indexOf(key);

        for (let i = idx; i >= 0; i--) {
          bps.unshift(keys[i]);
        }
      } else {
        const key = q.substring(1);
        const idx = keys.indexOf(key);

        for (let i = idx - 1; i >= 0; i--) {
          bps.unshift(keys[i]);
        }
      }

      break;

    case '>':
      if (q[1] === '=') {
        const key = q.substring(2);
        const idx = keys.indexOf(key);

        for (let i = idx; i < keys.length; i++) {
          bps.push(keys[i]);
        }
      } else {
        const key = q.substring(1);
        const idx = keys.indexOf(key);

        for (let i = idx + 1; i < keys.length; i++) {
          bps.push(keys[i]);
        }
      }

      break;

    default:
      return q.split('/');
  }

  return bps;
}