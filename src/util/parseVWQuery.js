import splitUnit from './splitUnit'

export default function parseVWQuery (node, config, fontSizeQuery, lineHeight, breakpoint, onlyFontsize) {
  let renderedFontSize
  if (config.hasOwnProperty('setMaxForVw') && config.setMaxForVw === true) {
    const containerBps = config.theme.container.maxWidth
    const lastKey = [...Object.keys(containerBps)].pop()
    if (breakpoint === lastKey) {
      const maxSize = containerBps[lastKey]
      const [valMax, unitMax] = splitUnit(maxSize)
      if (unitMax === '%') {
        throw node.error(`SPACING: When setMaxForVw is true, the container max cannot be % based.`)
      }
      const [valVw, unitVw] = splitUnit(fontSizeQuery)
      const maxVal = valMax / 100 * valVw
      renderedFontSize = `${maxVal}${unitMax}`
    } else {
      renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`  
    }
  } else {
    renderedFontSize = `calc(${fontSizeQuery} * var(--ec-zoom))`
  }

  if (onlyFontsize) {
    return renderedFontSize
  }

  return {
    ...{ 'font-size': renderedFontSize },
    ...(lineHeight && { 'line-height': lineHeight })
  }
}
