import calcMinFromBreakpoint from './calcMinFromBreakpoint'
import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'
import getUnit from './getUnit'

export default function parseRFS (node, config, size, breakpoint) {
  const [minSize, maxSize] = size.split('-')

  const sizeUnit = getUnit(minSize)
  const maxSizeUnit = getUnit(maxSize)

  let minWidth = calcMinFromBreakpoint(config.theme.breakpoints, breakpoint)
  let maxWidth = calcMaxFromBreakpoint(config.theme.breakpoints, breakpoint)

  if (!maxWidth) {
    // no max width for this breakpoint. Add 200 to min :)
    // TODO: maybe skip for the largest size? set a flag here and return reg size?
    maxWidth = `${parseFloat(minWidth) + 200}${getUnit(minWidth)}`
  }

  const widthUnit = getUnit(minWidth)
  const maxWidthUnit = getUnit(maxWidth)
  const rootSize = config.theme.typography.rootSize || '18px'

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

function pxToRem (px, rootSize) {
  return parseFloat(px) / parseFloat(rootSize) + 'rem'
}
