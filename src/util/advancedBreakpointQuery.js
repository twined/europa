export default function advancedBreakpointQuery (bpQuery) {
  if (bpQuery.indexOf('>') > -1) {
    return true
  }
  if (bpQuery.indexOf('<') > -1) {
    return true
  }
  if (bpQuery.indexOf('$') > -1) {
    return true
  }
  return false
}
