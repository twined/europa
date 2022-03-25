import splitUnit from './splitUnit'
import isLargestBreakpoint from './isLargestBreakpoint'
import getLargestContainer from './getLargestContainer'

export default function parseVWQuery (node, config, fontSizeQuery, lineHeight, breakpoint, onlyFontsize) {
  let renderedFontSize
  let renderedLineHeight

  if (config.hasOwnProperty('setMaxForVw') && config.setMaxForVw === true) {
    if (isLargestBreakpoint(config, breakpoint)) {
      const maxSize = getLargestContainer(config)
      const [valMax, unitMax] = splitUnit(maxSize)
      if (unitMax === '%') {
        throw node.error(`SPACING: When setMaxForVw is true, the container max cannot be % based.`)
      }
      const [valVw] = splitUnit(fontSizeQuery)
      renderedFontSize = `${valMax / 100 * valVw}${unitMax}`
      if (!onlyFontsize && lineHeight && lineHeight.endsWith('vw')) {
        const [lineHeightVw] = splitUnit(lineHeight)
        renderedLineHeight = `${valMax / 100 * lineHeightVw}${unitMax}`
      }
    } else {
      if (!onlyFontsize && lineHeight && lineHeight.endsWith('vw')) {
        renderedLineHeight = `calc(${lineHeight} * var(--ec-zoom))`  
      }
      renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`  
    }
  } else {
    if (!onlyFontsize && lineHeight && lineHeight.endsWith('vw')) {
      renderedLineHeight = `calc(${lineHeight} * var(--ec-zoom))`  
    }
    renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`
  }

  if (onlyFontsize) {
    return renderedFontSize
  }

  return {
    ...{ 'font-size': renderedFontSize },
    ...(renderedLineHeight && { 'line-height': renderedLineHeight })
  }
}
