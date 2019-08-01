import _ from 'lodash'
import calcMinFromBreakpoint from './calcMinFromBreakpoint'
import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'

export default function parseRFS (node, theme, size, breakpoint) {
  // check size exists in both theme.typography.sizes and theme.typography.rfs.minimum
  if (!_.has(theme.typography.sizes, size)) {
    throw node.error(`RFS: No size \`${size}\` found in theme.typography`)
  }

  if (!_.has(theme.typography.rfs.minimum, size)) {
    throw node.error(`RFS: No size \`${size}\` found in theme.typography.rfs.minimum`)
  }

  if (!_.has(theme.typography.sizes[size], breakpoint)) {
    throw node.error(`RFS: No breakpoint \`${breakpoint}\` found in theme.typography.${size}`)
  }

  if (!_.has(theme.typography.rfs.minimum, size)) {
    throw node.error(`RFS: No size \`${size}\` found in theme.typography.rfs.minimum`)
  }

  if (!_.has(theme.typography.rfs.minimum[size], breakpoint)) {
    throw node.error(`RFS: No breakpoint \`${breakpoint}\` found in theme.typography.rfs.minimum.${size}`)
  }

  const minSize = theme.typography.rfs.minimum[size][breakpoint]
  const maxSize = theme.typography.sizes[size][breakpoint]

  const sizeUnit = getUnit(minSize)
  const maxSizeUnit = getUnit(maxSize)

  let minWidth = calcMinFromBreakpoint(theme.breakpoints, breakpoint)
  let maxWidth = calcMaxFromBreakpoint(theme.breakpoints, breakpoint)

  if (!maxWidth) {
    // no max width for this breakpoint. Add 200 to min :)
    // TODO: maybe skip for the largest size? set a flag here and return reg size?
    maxWidth = `${parseFloat(minWidth) + 200}${getUnit(minWidth)}`
  }

  const widthUnit = getUnit(minWidth)
  const maxWidthUnit = getUnit(maxWidth)
  const rootSize = theme.typography.rootSize

  if (sizeUnit === null) {
    throw node.error(`RFS: Sizes need unit values - breakpoint: ${breakpoint} - size: ${size}`)
  }

  if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
    throw node.error('RFS: min/max unit types must match')
  }

  if (sizeUnit === 'rem' && widthUnit === 'px') {
    minWidth = pxToRem(minWidth, rootSize)
    maxWidth = pxToRem(maxWidth, rootSize)
  }

  // Build the responsive type decleration
  const sizeDiff = parseFloat(maxSize) - parseFloat(minSize)
  const rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth)

  if (sizeDiff === 0) {
    // not really responsive. just return the regular max
    return maxSize
  }

  if (minWidth === '0') {
    minWidth = '320px'
  }

  return `calc(${minSize} + ${sizeDiff} * ((100vw - ${minWidth}) / ${rangeDiff}))`
}

function getUnit (value) {
  const match = value.match(/px|rem|em|vw/)

  if (match) {
    return match.toString()
  }
  return null
}

function pxToRem (px, rootSize) {
  return parseFloat(px) / parseFloat(rootSize) + 'rem'
}
