import _ from 'lodash'
import splitUnit from './splitUnit'
import parseRFSQuery from './parseRFSQuery'
import parseVWQuery from './parseVWQuery'

export default function parseFontSizeQuery (node, config, fontSizeQuery, breakpoint) {
  let lineHeight
  let modifier
  let renderedFontSize

  if (fontSizeQuery.indexOf('/') !== -1) {
    // we have a line-height parameter
    [fontSizeQuery, lineHeight] = fontSizeQuery.split('/')
  }

  if (fontSizeQuery.indexOf('between(') === -1) {
    if (fontSizeQuery.indexOf('(') !== -1) {
      // we have a modifier xs(1.6) --> multiplies the size with 1.6
      modifier = fontSizeQuery.match(/\((.*)\)/)[1]
      fontSizeQuery = fontSizeQuery.split('(')[0]
    }
  }

  const themePath = ['theme', 'typography', 'sizes']
  const fontSize = fontSizeQuery
  const path = fontSize.split('.')

  let resolvedFontsize = _.get(config, themePath.concat(path))
  if (!resolvedFontsize) {
    resolvedFontsize = fontSize
  }

  if (!_.isString(resolvedFontsize)) {
    if (!_.has(resolvedFontsize, breakpoint)) {
      throw node.error(`FONTSIZE: No breakpoint \`${breakpoint}\` found in theme.typography.sizes.${fontSize}`, { name: breakpoint })
    }
  } else {
    if (resolvedFontsize.indexOf('between(') !== -1) {
      // responsive font size
      return parseRFSQuery(node, config, resolvedFontsize, lineHeight, breakpoint)
    }
  }

  if (!modifier) {
    if (_.isString(resolvedFontsize)) {
      return {
        ...{ 'font-size': resolvedFontsize },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
    if (_.isObject(resolvedFontsize[breakpoint])) {
      const props = {}
      _.keys(resolvedFontsize[breakpoint]).forEach(key => {
        const v = resolvedFontsize[breakpoint][key]
        if (v.endsWith('vw')) {
          props[key] = parseVWQuery(node, config, resolvedFontsize[breakpoint][key], lineHeight, breakpoint, true)
        } else {
          props[key] = resolvedFontsize[breakpoint][key]
        }
      })
      return props
    } else {
      if (resolvedFontsize[breakpoint].indexOf('between(') !== -1) {
        // responsive font size
        return parseRFSQuery(node, config, resolvedFontsize[breakpoint], lineHeight, breakpoint)
      }

      if (resolvedFontsize[breakpoint].endsWith('vw')) {
        return parseVWQuery(node, config, resolvedFontsize[breakpoint], lineHeight, breakpoint)
      }

      return {
        ...{ 'font-size': resolvedFontsize[breakpoint] },
        ...(lineHeight && { 'line-height': lineHeight })
      }
    }
  } else {
    let fs
    if (_.isString(resolvedFontsize)) {
      fs = resolvedFontsize
    } else if (_.isObject(resolvedFontsize[breakpoint])) {
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
