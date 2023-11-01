import _ from 'lodash'
import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'

// builds with MIN AND MAX

export default function buildFullMediaQuery(breakpoints, breakpoint) {
  const min = breakpoints[breakpoint]
  const max = calcMaxFromBreakpoint(breakpoints, breakpoint)
  let screens = { min, ...(max && { max }) }

  if (!Array.isArray(screens)) {
    screens = [screens]
  }

  return _(screens)
    .map(screen => {
      return _(screen)
        .map((value, feature) => {
          feature = _.get(
            {
              min: 'min-width',
              max: 'max-width'
            },
            feature,
            feature
          )
          return `(${feature}: ${value})`
        })
        .join(' and ')
    })
    .join(', ')
}
