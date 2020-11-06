export default function getUnit (value) {
  const match = value.match(/px|rem|em|vw/)

  if (match) {
    return match.toString()
  }
  return null
}
