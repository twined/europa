
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import splitUnit from '../../util/splitUnit'
import renderCalcWithRounder from '../../util/renderCalcWithRounder'

/**
 * COLUMN
 *
 * @param {sizeQuery}
 * @param [breakpointQuery]
 * @param [alignment]
 *
 * Examples:
 *
 *    @column 6/12;
 *    @column 6/12 xs;
 *    @column 6/12 xs center;
 *
 *    @column 6:1/12;
 *
 */
export default postcss.plugin('europacss-column', getConfig => {
  return function (css) {
    const { theme: { breakpoints, spacing, columns } } = getConfig()
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('column', atRule => {
      let size
      let bpQuery
      let [head, align = 'left'] = atRule.params.split(' ')
      let needsBreakpoints = false
      let flexSize
      let wantedSize
      let colCount
      let fraction
      let gutterMultiplier
      let flexDecls = []

      if (atRule.parent.type === 'root') {
        throw atRule.error(`COLUMN: Can only be used inside a rule, not on root.`)
      }

      if (head.indexOf('@')) {
        [size, bpQuery] = head.split('@')
      } else {
        size = head
      }

      const parent = atRule.parent
      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw atRule.error(`CONTAINER: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
      }

      // what if the parent's parent is @responsive?
      if (!['atrule', 'root'].includes(parent.type)
          && parent.parent.type === 'atrule'
          && parent.parent.name === 'responsive') {
        if (bpQuery) {
          throw atRule.error(`CONTAINER: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
      }

      if (!['left', 'center', 'right'].includes(align)) {
        throw atRule.error(`COLUMN: \`align\` value must be left, center or right`)
      }

      if (size.indexOf(':') !== -1) {
        // we have a gutter indicator (@column 6:1/12) -- meaning we want X times the gutter to be added
        // first split the fraction
        let splitFractions = size.split('/')
        colCount = splitFractions[1]
        let wantedSizeAndGutterMultiplier = splitFractions[0].split(':')
        fraction = wantedSizeAndGutterMultiplier[0]
        gutterMultiplier = wantedSizeAndGutterMultiplier[1]

        // since gutters are different for each breakpoint, we need to make this responsive
        if (!bpQuery) {
          needsBreakpoints = true
        }
      } else {
        flexSize = renderCalcWithRounder(size)
      }

      if (gutterMultiplier) {
        if (needsBreakpoints) {
          _.keys(breakpoints).forEach(bp => {
            let gutterSize = columns.gutters[bp]
            const [val, unit] = splitUnit(gutterSize)
            let gutterval = `${(val/2) * gutterMultiplier}${unit}`

            flexSize = renderCalcWithRounder(`${fraction}/${colCount} + ${gutterval}`)
            flexDecls = []
            createFlexDecls(flexDecls, flexSize)
            maybeAddAlign(flexDecls, align)

            const originalRule = postcss.rule({ selector: parent.selector })
            originalRule.append(...flexDecls)
            const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQuery(breakpoints, bp) })
            mediaRule.append(originalRule)
            finalRules.push(mediaRule)
          })
          atRule.remove()
        }
      } else {
        createFlexDecls(flexDecls, flexSize)
        maybeAddAlign(flexDecls, align)
        atRule.remove()

        if (bpQuery) {
          // add a media query
          const originalRule = postcss.rule({ selector: parent.selector })
          originalRule.append(...flexDecls)
          const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQueryQ(breakpoints, bpQuery) })
          mediaRule.append(originalRule)
          finalRules.push(mediaRule)
        } else {
          parent.append(...flexDecls)
        }
      }

      if (!parent.nodes.length) {
        parent.remove()
      }

      if (finalRules.length) {
        css.append(finalRules)
      }
    })
  }
})

function createFlexDecls(flexDecls, flexSize) {
  flexDecls.push(buildDecl('position', 'relative'))
  flexDecls.push(buildDecl('flex', `0 0 ${flexSize}`))
  flexDecls.push(buildDecl('max-width', flexSize))
}

function maybeAddAlign(flexDecls, align) {
  switch (align) {
    case 'center':
      flexDecls.push(buildDecl('margin-x', 'auto'))
      break
    case 'right':
      flexDecls.push(buildDecl('margin-left', 'auto'))
      flexDecls.push(buildDecl('margin-right', '0'))
      break
    default:
      break
  }
}