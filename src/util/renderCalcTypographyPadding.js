import reduceCSSCalc from 'reduce-css-calc'

export default function renderCalcTypographyPadding (val, { typography: { paddingDivider } }) {
  // TODO: should paddingDivider be a map of breakpoints? Different divider values per breakpoint?
  return reduceCSSCalc(`calc(100% * ${val} / ${paddingDivider})`, 10)
}
