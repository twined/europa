
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
import splitUnit from '../../util/splitUnit'
import parseSize from '../../util/parseSize'
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
 *    @column calc(var[6/12]);
 *
 */
export default postcss.plugin('europacss-column', getConfig => {
  return function (css) {
    const config = getConfig()
    const { theme: { breakpoints, breakpointCollections, spacing, columns } } = config
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('column', atRule => {
      const src = atRule.source
      let [suppliedSize, suppliedBreakpoint] = postcss.list.space(atRule.params)
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

      if (suppliedSize.indexOf('@') > -1) {
        throw atRule.error(`COLUMN: Old size@breakpoint syntax is removed. Use a space instead`)
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
          suppliedBreakpoint = extractBreakpointKeys({ breakpoints, breakpointCollections }, parent.params).join('/')
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
          throw atRule.error(`COLUMN: When nesting @column under  responsive, we do not accept a breakpoints query.`, { name: suppliedBreakpoint })
        }

        suppliedBreakpoint = grandParent.params
      }

      if (suppliedBreakpoint && advancedBreakpointQuery(suppliedBreakpoint)) {
        suppliedBreakpoint = extractBreakpointKeys({ breakpoints, breakpointCollections }, suppliedBreakpoint).join('/')
      }

      if (needsBreakpoints) {
        _.keys(breakpoints).forEach(bp => {
          let parsedSize = parseSize(atRule, config, suppliedSize, bp)

          flexDecls = []
          createFlexDecls(flexDecls, parsedSize)

          const originalRule = postcss.rule({ selector: parent.selector })
          originalRule.source = src
          originalRule.append(...flexDecls)
          const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQuery(breakpoints, bp) })
          mediaRule.append(originalRule)
          finalRules.push(mediaRule)
        })
      } else {
        // has suppliedBreakpoint, either from a @responsive parent, or a supplied bpQuery
        if (alreadyResponsive) {
          flexDecls = []
          let parsedSize = parseSize(atRule, config, suppliedSize, suppliedBreakpoint)
          createFlexDecls(flexDecls, parsedSize)

          atRule.parent.append(...flexDecls)
        } else {
          splitBreakpoints(suppliedBreakpoint).forEach(bp => {
            flexDecls = []
            let parsedSize = parseSize(atRule, config, suppliedSize, bp)

            createFlexDecls(flexDecls, parsedSize)

            let originalRule

            if (parent.selector) {
              originalRule = postcss.rule({ selector: parent.selector })
            } else {
              originalRule = postcss.rule({ selector: grandParent.selector })
            }
            originalRule.source = src
            originalRule.append(...flexDecls)

            const mediaRule = postcss.atRule({ name: 'media', params: buildMediaQueryQ({ breakpoints, breakpointCollections }, bp) })
            mediaRule.source = src
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
    })

    if (finalRules.length) {
      css.append(finalRules)
    }
  }
})

function createFlexDecls(flexDecls, flexSize) {
  flexDecls.push(buildDecl('position', 'relative'))
  flexDecls.push(buildDecl('flex-grow', '0'))
  flexDecls.push(buildDecl('flex-shrink', '0'))
  flexDecls.push(buildDecl('flex-basis', flexSize))
  flexDecls.push(buildDecl('max-width', flexSize))
}
