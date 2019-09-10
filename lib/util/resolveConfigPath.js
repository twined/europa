"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveConfigPath;

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

var _path = _interopRequireDefault(require("path"));

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveConfigPath(filePath) {
  if (_lodash.default.isObject(filePath)) {
    return undefined;
  }

  if (!_lodash.default.isUndefined(filePath)) {
    return _path.default.resolve(filePath);
  }

  try {
    const defaultConfigPath = _path.default.resolve(_constants.defaultConfigFile);

    _fs.default.accessSync(defaultConfigPath);

    return defaultConfigPath;
  } catch (err) {
    return undefined;
  }
}