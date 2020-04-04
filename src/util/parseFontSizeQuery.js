import _ from 'lodash'
import splitUnit from './splitUnit'

export default function parseFontSizeQuery (node, config, fontSizeQuery, breakpoint) {
  const { theme } = config
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

  // get the wanted object
  const themePath = ['theme', 'typography', 'sizes']
  const path = fontSize.split('.')
  const resolvedFontsize = _.get(config, themePath.concat(path))

  if (!resolvedFontsize) {
    throw node.error(`FONTSIZE: No \`${fontSize}\` size found in theme.typography.sizes.`, { name: fontSize })
  }

  if (!_.has(resolvedFontsize, breakpoint)) {
    throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, { name: breakpoint })
  }

  if (!modifier) {
    if (_.isObject(resolvedFontsize[breakpoint])) {
      const props = {}
      _.keys(resolvedFontsize[breakpoint]).forEach(key => {
        props[key] = resolvedFontsize[breakpoint][key]
      })
      return props
    } else {
      return {
        ...{ 'font-size': resolvedFontsize[breakpoint] },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
  } else {
    let fs
    if (_.isObject(resolvedFontsize[breakpoint])) {
      fs = resolvedFontsize[breakpoint]['font-size']
    } else {
      fs = resolvedFontsize[breakpoint]
    }
    const [val, unit] = splitUnit(fs)
    renderedFontSize = `${val * modifier}${unit}`

    return {
      ...{ 'font-size': renderedFontSize },
      ...(lineHeight && { 'line-height': lineHeight })
    }
  }
}
