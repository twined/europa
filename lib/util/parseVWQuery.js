"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseVWQuery;

var _splitUnit = _interopRequireDefault(require("./splitUnit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseVWQuery(node, config, fontSizeQuery, lineHeight, breakpoint, onlyFontsize) {
  let renderedFontSize;

  if (config.hasOwnProperty('setMaxForVw') && config.setMaxForVw === true) {
    const containerBps = config.theme.container.maxWidth;
    const lastKey = [...Object.keys(containerBps)].pop();

    if (breakpoint === lastKey) {
      const maxSize = containerBps[lastKey];
      const [valMax, unitMax] = (0, _splitUnit.default)(maxSize);

      if (unitMax === '%') {
        throw node.error(`SPACING: When setMaxForVw is true, the container max cannot be % based.`);
      }

      const [valVw, unitVw] = (0, _splitUnit.default)(fontSizeQuery);
      const maxVal = valMax / 100 * valVw;
      renderedFontSize = `${maxVal}${unitMax}`;
    } else {
      renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`;
    }
  } else {
    renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`;
  }

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