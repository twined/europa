"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseVWQuery;

function parseVWQuery(node, config, fontSizeQuery, lineHeight, breakpoint, onlyFontsize) {
  const renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`;

  if (onlyFontsize) {
    return renderedFontSize;
  }

  return { ...{
      'font-size': renderedFontSize
    },
    ...(lineHeight && {
      'line-height': lineHeight
    })
  };
}