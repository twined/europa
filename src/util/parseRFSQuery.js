import parseRFS from './parseRFS'

export default function parseRFSQuery (node, theme, fontSizeQuery, breakpoint) {
  let lineHeight

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/')
  }

  const fontSize = fontSizeQuery
  const renderedFontSize = parseRFS(node, theme, fontSize, breakpoint)

  return {
    ...{ 'font-size': renderedFontSize },
    ...(lineHeight && { 'line-height': lineHeight })
  }
}
