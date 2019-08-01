import _ from 'lodash'
import parseQ from './parseQ'

// for single breakpoints, use buildSpecificMediaQuery

export default function buildMediaQueryQ (breakpoints, q) {
  const queryStrings = parseQ(breakpoints, q)

  return _(queryStrings)
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
