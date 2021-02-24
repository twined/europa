import parseRFS from './parseRFS'

export default function parseRFSQuery (node, config, fontSizeQuery, lineHeight, breakpoint) {
  fontSizeQuery = fontSizeQuery.match(/between\((.*)\)/)[1]

  const fontSize = fontSizeQuery
  const renderedFontSize = parseRFS(node, config, fontSize, breakpoint)

  return {
    ...{ 'font-size': renderedFontSize },
    ...(lineHeight && { 'line-height': lineHeight })
  }
}
