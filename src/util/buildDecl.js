import postcss from 'postcss'

export default function buildDecl (p, value, important = false, config, bp) {
  const props = []

  switch (p) {
    case 'margin-x':
      props.push({ prop: 'margin-left', value: value })
      props.push({ prop: 'margin-right', value: value })
      break

    case 'margin-y':
      props.push({ prop: 'margin-top', value: value })
      props.push({ prop: 'margin-bottom', value: value })
      break

    case 'margin':
      props.push({ prop: 'margin', value: value })
      break

    case 'padding-x':
      props.push({ prop: 'padding-left', value: value })
      props.push({ prop: 'padding-right', value: value })
      break

    case 'padding-y':
      props.push({ prop: 'padding-top', value: value })
      props.push({ prop: 'padding-bottom', value: value })
      break

    case 'padding':
      props.push({ prop: 'padding', value: value })
      break

    case 'translateX':
      props.push({ prop: 'transform', value: `translateX(${value})` })
      break

    case 'translateY':
      props.push({ prop: 'transform', value: `translateY(${value})` })
      break

    case 'translateZ':
      props.push({ prop: 'transform', value: `translateZ(${value})` })
      break

    case 'scale':
      props.push({ prop: 'transform', value: `scale(${value})` })
      break

    case 'container':
      const paddingValue = config.theme.container.padding[bp]
      const maxWidth = config.theme.container.maxWidth[bp]

      props.push({ prop: 'padding-left', value: paddingValue })
      props.push({ prop: 'padding-right', value: paddingValue })
      props.push({ prop: 'max-width', value: maxWidth })
      props.push({ prop: 'margin-left', value: 'auto' })
      props.push({ prop: 'margin-right', value: 'auto' })
      props.push({ prop: 'width', value: '100%' })
      break

    default:
      props.push({ prop: p, value: value })
  }

  return props.map(({ prop, value }) => postcss.decl({ prop, value, important}))
}
