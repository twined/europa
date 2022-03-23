import _ from 'lodash'

export default function sizeNeedsBreakpoints (spacingMap, size) {
  if (!size) {
    return true
  }

  // Leave css vars as single breakpoint
  if (size.startsWith('var(--')) {
    return false
  }
  
  // Zero stays the same across all breakpoints
  if (size === 0 || size === '0') {
    return false
  }

  // Fractions should have breakpoints cause of gutters
  if (size.indexOf('/') !== -1) {
    return true
  }

  // Size is in spacing map, we need breakpoints
  if (_.has(spacingMap, size)) {
    return true
  }

  // regular numbers are treated as gutter multipliers/dividers, and
  // these differ per breakpoint.

  return true
}
