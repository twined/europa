import _ from 'lodash'
import splitUnit from './splitUnit'

export default function parseFontSizeQuery (node, theme, fontSizeQuery, breakpoint) {
  let lineHeight
  let modifier
  let renderedFontSize

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/')
  }

  if (fontSizeQuery.indexOf('(') !== -1) {
    // we have a modifier xs(1.6) --> multiplies the size with 1.6
    modifier = fontSizeQuery.match(/\((.*)\)/)[1]
    fontSizeQuery = fontSizeQuery.split('(')[0]
  }

  const fontSize = fontSizeQuery

  if (!_.has(theme.typography.sizes, fontSize)) {
    throw node.error(`FONTSIZE: No \`${fontSize}\` size found in theme.typography.sizes.`, { name: fontSize })
  }
  if (!_.has(theme.typography.sizes[fontSize], breakpoint)) {
    throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, { name: breakpoint })
  }

  if (!modifier) {
    if (_.isObject(theme.typography.sizes[fontSize][breakpoint])) {
      const props = {}
      _.keys(theme.typography.sizes[fontSize][breakpoint]).forEach(key => {
        props[key] = theme.typography.sizes[fontSize][breakpoint][key]
      })
      return props
    } else {
      return {
        ...{ 'font-size': theme.typography.sizes[fontSize][breakpoint] },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
  } else {
    let fs
    if (_.isObject(theme.typography.sizes[fontSize][breakpoint])) {
      fs = theme.typography.sizes[fontSize][breakpoint]['font-size']
    } else {
      fs = theme.typography.sizes[fontSize][breakpoint]
    }
    const [val, unit] = splitUnit(fs)
    renderedFontSize = `${val * modifier}${unit}`

    return {
      ...{ 'font-size': renderedFontSize },
      ...(lineHeight && { 'line-height': lineHeight })
    }
  }
}
