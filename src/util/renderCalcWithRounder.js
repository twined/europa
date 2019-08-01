import reduceCSSCalc from 'reduce-css-calc'

export default function renderCalcWithRounder (val) {
  return reduceCSSCalc(`calc(100% * ${val})`, 10)
}
