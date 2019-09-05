import _ from 'lodash'

export default function sizeNeedsBreakpoints (spacingMap, size) {
  // Zero stays the same across all breakpoints
  if (size === 0 || size === '0') {
    return false
  }

  // Fractions are the same across all breakpoints
  if (size.indexOf('/') !== -1) {
    const head = size.split('/')[0]
    if (_.has(spacingMap, head)) {
      return true
    }
    if (head.indexOf(':') !== -1) {
      return true
    }
    return false
  }

  // Size is in spacing map, we need breakpoints
  if (_.has(spacingMap, size)) {
    return true
  }

  // regular numbers are treated as gutter multipliers/dividers, and
  // these differ per breakpoint.

  return true
}
