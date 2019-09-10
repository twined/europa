"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Gives us reloading when editing config file!
 *
 * @param {*} configFile
 */
function _default(configFile) {
  if (!_fs.default.existsSync(configFile)) {
    throw new Error(`Specified EUROPA configuration file "${configFile}" doesn't exist.`);
  }

  return function (css, opts) {
    opts.messages.push({
      type: 'dependency',
      file: configFile,
      parent: css.source.input.file
    });
  };
}