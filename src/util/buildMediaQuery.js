import _ from 'lodash'

// builds with MIN only. Fine for when iterating through all breakpoints
// for single breakpoints, use buildSpecificMediaQuery

export default function buildMediaQuery (breakpoints, breakpoint) {
  let screens = breakpoints[breakpoint]

  if (_.isString(screens)) {
    screens = { min: screens }
  }

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
