export default function multipleBreakpoints (bpQuery) {
  if (bpQuery.indexOf('/') > -1) {
    return true
  }
  if (bpQuery.indexOf('$') > -1) {
    return true
  }
  return false
}
