
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import splitUnit from '../../util/splitUnit'
import renderCalcWithRounder from '../../util/renderCalcWithRounder'
import advancedBreakpointQuery from '../../util/advancedBreakpointQuery'
import multipleBreakpoints from '../../util/multipleBreakpoints'
import splitBreakpoints from '../../util/splitBreakpoints'

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
  /*
  calc(100% * 1/6 - (120px - 1/6 * 120px))
  calc(100% * 2/6 - (120px - 1/6 * 240px))
  calc(100% * 3/6 - (120px - 1/6 * 360px))
  calc(100% * 4/6 - (120px - 1/6 * 480px))
  calc(100% * 5/6 - (120px - 1/6 * 600px))
  100%
  */
  return function (css) {
    const { theme: { breakpoints, spacing, columns } } = getConfig()
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('column', atRule => {
      let suppliedSize
      let suppliedBreakpoint
      let [head, align = 'left'] = atRule.params.split(' ')
      let needsBreakpoints = false
      let alreadyResponsive = false
      let flexSize
      let wantedColumns
      let totalColumns
      let fraction
      let gutterMultiplier
      let flexDecls = []

      if (atRule.parent.type === 'root') {
        throw atRule.error(`COLUMN: Can only be used inside a rule, not on root.`)
      }

      if (head.indexOf('@')) {
        [suppliedSize, suppliedBreakpoint] = head.split('@')
      } else {
        suppliedSize = head
      }

      const parent = atRule.parent
      const grandParent = atRule.parent.parent

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (suppliedBreakpoint) {
          throw atRule.error(`COLUMN: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: suppliedBreakpoint })
        }
        // try to grab the breakpoint
        if (advancedBreakpointQuery(parent.params)) {
          // parse the breakpoints
          suppliedBreakpoint = extractBreakpointKeys(breakpoints, parent.params).join('/')
          console.log(suppliedBreakpoint)
        } else {
          suppliedBreakpoint = parent.params
        }

        if (parent.params.indexOf('/')) {
          // multiple breakpoints, we can't use the breakpoints
          alreadyResponsive = false
        } else {
          alreadyResponsive = true
        }
      }

      if (!suppliedBreakpoint) {
        needsBreakpoints = true
      }

      // what if the parent's parent is @responsive?
      if (!['atrule', 'root'].includes(parent.type)
          && grandParent.type === 'atrule'
          && grandParent.name === 'responsive') {
        if (suppliedBreakpoint) {
          throw atRule.error(`COLUMN: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: suppliedBreakpoint })
        }

        suppliedBreakpoint = grandParent.params
      }

      if (suppliedBreakpoint && advancedBreakpointQuery(suppliedBreakpoint)) {
        throw atRule.error(`COLUMN: Column only accepts simple breakpoints, not advanced queries. This is due to gutter calculations`, { name: suppliedBreakpoint })
      }

      if (!['left', 'center', 'right'].includes(align)) {
        throw atRule.error(`COLUMN: \`align\` value must be left, center or right`)
      }

      [wantedColumns, totalColumns] = suppliedSize.split('/')

      if (wantedColumns.indexOf(':') !== -1) {
        // we have a gutter indicator (@column 6:1/12) -- meaning we want X times the gutter to be added
        // first split the fraction
        [wantedColumns, gutterMultiplier] = wantedColumns.split(':')
      }

      if (needsBreakpoints) {
        _.keys(breakpoints).forEach(bp => {
          let columnMath
          let gutterSize = columns.gutters[bp]
          const [gutterValue, gutterUnit] = splitUnit(gutterSize)

          if (wantedColumns / totalColumns === 1) {
            columnMath = '100%'
          } else {
            columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`
          }

          if (gutterMultiplier) {
            let gutterMultiplierValue = gutterValue * gutterMultiplier
            flexSize = renderCalcWithRounder(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`)
          } else {
            flexSize = columnMath === '100%' ? columnMath : renderCalcWithRounder(columnMath)
          }

          flexDecls = []
          createFlexDecls(flexDecls, flexSize)
          maybeAddAlign(flexDecls, align)

          const originalRule = postcss.rule({ selector: parent.selector })
          originalRule.append(...flexDecls)
          const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQuery(breakpoints, bp) })
          mediaRule.append(originalRule)
          finalRules.push(mediaRule)
        })
      } else {
        // has suppliedBreakpoint, either from a @responsive parent, or a supplied bpQuery
        if (alreadyResponsive) {
          flexDecls = []
          let columnMath
          let gutterSize = columns.gutters[suppliedBreakpoint]
          let [gutterValue, gutterUnit] = splitUnit(gutterSize)

          if (wantedColumns / totalColumns === 1) {
            columnMath = '100%'
          } else {
            columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`
          }

          if (gutterMultiplier) {
            let gutterMultiplierValue = gutterValue * gutterMultiplier
            flexSize = renderCalcWithRounder(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`)
          } else {
            flexSize = columnMath === '100%' ? columnMath : renderCalcWithRounder(columnMath)
          }

          createFlexDecls(flexDecls, flexSize)
          maybeAddAlign(flexDecls, align)

          atRule.parent.append(...flexDecls)
        } else {
          splitBreakpoints(suppliedBreakpoint).forEach(bp => {
            flexDecls = []
            let columnMath
            let gutterSize = columns.gutters[bp]

            if (!gutterSize) {
              throw atRule.error(`COLUMN: no \`columns.gutters\` found for breakpoint \`${bp}\``)
            }

            let [gutterValue, gutterUnit] = splitUnit(gutterSize)

            if (wantedColumns / totalColumns === 1) {
              columnMath = '100%'
            } else {
              columnMath = `${wantedColumns}/${totalColumns} - (${gutterValue}${gutterUnit} - 1/${totalColumns} * ${gutterValue * wantedColumns}${gutterUnit})`
            }

            if (gutterMultiplier) {
              let gutterMultiplierValue = gutterValue * gutterMultiplier
              flexSize = renderCalcWithRounder(`${columnMath} + ${gutterMultiplierValue}${gutterUnit}`)
            } else {
              flexSize = columnMath === '100%' ? columnMath : renderCalcWithRounder(columnMath)
            }

            createFlexDecls(flexDecls, flexSize)
            maybeAddAlign(flexDecls, align)

            let originalRule

            if (parent.selector) {
              originalRule = postcss.rule({ selector: parent.selector })
            } else {
              originalRule = postcss.rule({ selector: grandParent.selector })
            }
            originalRule.append(...flexDecls)

            const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQueryQ(breakpoints, bp) })
            mediaRule.append(originalRule)
            finalRules.push(mediaRule)
          })
        }
      }

      atRule.remove()

      // check if parent has anything
      if (parent && !parent.nodes.length) {
        parent.remove()
      }

      // check if grandparent has anything
      if (grandParent && !grandParent.nodes.length) {
        grandParent.remove()
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