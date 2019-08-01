import _ from 'lodash'

export default function extractBreakpointKeys (breakpoints, q) {
  const bps = []
  const keys = _.keys(breakpoints)

  switch (q[0]) {
    case '=':
      throw (new Error('parseQ: Mediaqueries should never start with ='))

    case '<':
      if (q[1] === '=') {
        const key = q.substring(2)
        const idx = keys.indexOf(key)

        for (let i = idx; i >= 0; i--) {
          bps.unshift(keys[i])
        }
      } else {
        const key = q.substring(1)
        const idx = keys.indexOf(key)

        for (let i = idx - 1; i >= 0; i--) {
          bps.unshift(keys[i])
        }
      }
      break

    case '>':
      if (q[1] === '=') {
        const key = q.substring(2)
        const idx = keys.indexOf(key)

        for (let i = idx; i < keys.length; i++) {
          bps.push(keys[i])
        }
      } else {
        const key = q.substring(1)
        const idx = keys.indexOf(key)

        for (let i = idx + 1; i < keys.length; i++) {
          bps.push(keys[i])
        }
      }
      break
    default:
      return q.split('/')
  }
  return bps
}
