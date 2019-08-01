import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'

export default function calcMaxFromPreviousBreakpoint (breakpoints, bpKey) {
  const keys = Object.keys(breakpoints)
  const idx = keys.indexOf(bpKey)
  if (idx > 0) {
    return `${(parseInt(breakpoints[bpKey].replace('px', '')) - 1)}px`
  }
  return calcMaxFromBreakpoint(breakpoints, bpKey)
}
