
import _ from 'lodash'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ'
import cloneNodes from '../../util/cloneNodes'
import postcss from 'postcss'
import extractBreakpointKeys from '../../util/extractBreakpointKeys'
import buildDecl from '../../util/buildDecl'
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
 */
export default postcss.plugin('europacss-column', getConfig => {
  return function (css) {
    const { theme: { breakpoints, spacing } } = getConfig()
    const responsiveRules = postcss.root()
    const finalRules = []

    css.walkAtRules('column', atRule => {
      let size
      let bpQuery
      let [head, align = 'left'] = atRule.params.split(' ')

      if (atRule.parent.type === 'root') {
        throw atRule.error(`COLUMN: Can only be used inside a rule, not on root.`)
      }

      if (head.indexOf('@')) {
        [size, bpQuery] = head.split('@')
      } else {
        size = head
      }

      if (!['left', 'center', 'right'].includes(align)) {
        throw atRule.error(`COLUMN: \`align\` value must be left, center or right`)
      }

      const parent = atRule.parent
      const flexSize = renderCalcWithRounder(size)

      // Check if we're nested under a @responsive rule.
      // If so, we don't create a media query, and we also won't
      // accept a query param for @space
      if (parent.type === 'atrule' && parent.name === 'responsive') {
        if (bpQuery) {
          throw atRule.error(`CONTAINER: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
      }

      // what if the parent's parent is @responsive?
      if (!['atrule', 'root'].includes(parent.type) && parent.parent.type === 'atrule' && parent.parent.name === 'responsive') {
        if (bpQuery) {
          throw atRule.error(`CONTAINER: When nesting @column under @responsive, we do not accept a breakpoints query.`, { name: bpQuery })
        }
      }

      const flexDecls = [
        buildDecl('position', 'relative'),
        buildDecl('flex', `0 0 ${flexSize}`),
        buildDecl('max-width', flexSize)
      ]

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

      if (!parent.nodes.length) {
        parent.remove()
      }

      if (finalRules.length) {
        css.append(finalRules)
      }
    })
  }
})