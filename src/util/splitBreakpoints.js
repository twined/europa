export default function splitBreakpoints (bpQuery) {
  if (bpQuery.indexOf('/') > -1) {
    return bpQuery.split('/')
  }
  return [bpQuery]
}
