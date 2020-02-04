import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'
import calcMaxFromPreviousBreakpoint from './calcMaxFromPreviousBreakpoint'
import calcMaxFromNextBreakpoint from './calcMaxFromNextBreakpoint'

export default function parseQ ({ breakpoints, breakpointCollections }, q) {
  if (!Array.isArray(q)) {
    // could be a split query xs/sm/xl
    q = q.split('/')
  }

  return q.map(query => processQ({ breakpoints, breakpointCollections }, query)).flat()
}

function processQ ({ breakpoints, breakpointCollections }, q) {
  switch (q[0]) {
    case '=':
      throw (new Error('parseQ: Mediaqueries should not start with ='))
    case '$': {
      const key = q
      if (!breakpointCollections) {
        throw (new Error(`parseQ: No \`breakpointCollection\` set in config, but \`${key}\` was referenced`))
      }
      const resolvedBreakpointQ = breakpointCollections[key]
      if (!resolvedBreakpointQ) {
        throw (new Error(`parseQ: Breakpoint collection \`${key}\` not found!`))
      }
      return parseQ({ breakpoints, breakpointCollections }, resolvedBreakpointQ)
    }
    case '<':
      if (q[1] === '=') {
        const key = q.substring(2)
        const min = '0'
        const max = calcMaxFromBreakpoint(breakpoints, key)
        return { min, ...(max && { max }) }
      } else {
        const key = q.substring(1)
        const min = '0'
        const max = calcMaxFromPreviousBreakpoint(breakpoints, key)
        return { min, ...(max && { max }) }
      }
    case '>':
      if (q[1] === '=') {
        const key = q.substring(2)
        return { min: breakpoints[key] }
      } else {
        const key = q.substring(1)
        return {
          min: calcMaxFromNextBreakpoint(breakpoints, key)
        }
      }
    default: {
      const key = q
      const min = breakpoints[key]
      const max = calcMaxFromBreakpoint(breakpoints, key)
      return { min, ...(max && { max }) }
    }
  }
}
