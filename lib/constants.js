"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supportedConfigFiles = exports.defaultConfigFile = exports.cjsConfigFile = void 0;
const defaultConfigFile = './europa.config.js';
exports.defaultConfigFile = defaultConfigFile;
const cjsConfigFile = './europa.config.cjs';
exports.cjsConfigFile = cjsConfigFile;
const supportedConfigFiles = [cjsConfigFile, defaultConfigFile];
exports.supportedConfigFiles = supportedConfigFiles;