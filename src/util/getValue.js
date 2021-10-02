/**
 * Split `str` into value and unit. Returns value
 * @param {string} str
 */
export default function getValue (str) {
  const string = String(str)
  const val = parseFloat(string, 10)

  return val
}
