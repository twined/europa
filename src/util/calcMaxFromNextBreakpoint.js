import calcMaxFromBreakpoint from './calcMaxFromBreakpoint'

export default function calcMaxFromNextBreakpoint (breakpoints, bpKey) {
  const keys = Object.keys(breakpoints)
  const idx = keys.indexOf(bpKey)
  if (idx <= keys.length - 1) {
    const nextKey = keys[idx + 1]
    return breakpoints[nextKey]
  }
  return calcMaxFromBreakpoint(breakpoints, bpKey)
}
