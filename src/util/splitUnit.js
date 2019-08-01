/**
 * Split `str` into value and unit. Returns array
 * @param {string} str
 */
export default function splitUnit (str) {
  const string = String(str)
  return [parseFloat(string, 10), string.match(/[\d.\-+]*\s*(.*)/)[1] || '']
}
