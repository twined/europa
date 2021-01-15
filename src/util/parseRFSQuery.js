import parseRFS from './parseRFS'

export default function parseRFSQuery (node, config, fontSizeQuery, breakpoint) {
  let lineHeight

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/')
  }

  fontSizeQuery = fontSizeQuery.match(/between\((.*)\)/)[1]

  const fontSize = fontSizeQuery
  const renderedFontSize = parseRFS(node, config, fontSize, breakpoint)

  return {
    ...{ 'font-size': renderedFontSize },
    ...(lineHeight && { 'line-height': lineHeight })
  }
}
