import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ';

export default postcss.plugin('europacss-responsive', getConfig => {
  return function (css) {
    const config = getConfig()
    const { theme: { breakpoints, breakpointCollections } } = config
    const finalRules = []

    css.walkAtRules('responsive', atRule => {
      const parent = atRule.parent

      let root = false
      if (parent.type === 'root') {
        root = true
      }

      const nodes = atRule.nodes
      if (!nodes) {
        throw atRule.error(`RESPONSIVE: Must include child nodes.`, { word: 'responsive' })
      }

      const params = atRule.params
      if (!params) {
        throw atRule.error(`RESPONSIVE: Must include breakpoint selectors`, { word: 'responsive' })
      }

      // clone parent, but without atRule
      let cp = atRule.clone()
      const src = atRule.source
      atRule.remove()

      // convert to query string
      const mediaQuery = buildMediaQueryQ({ breakpoints, breakpointCollections }, params)

      // create a media query
      const mediaRule = postcss.atRule({ name: 'media', params: mediaQuery })

      if (root) {
        // originalRule is not used
        // check if nodes. if not we toss out
        if (nodes.length) {
          mediaRule.append(...cloneNodes(nodes))
        }
      } else {
        const originalRule = postcss.rule({ selector: parent.selector })
        originalRule.source = src
        originalRule.append(...cloneNodes(nodes))
        mediaRule.append(originalRule)
      }

      // check if parent has anything
      if (!parent.nodes.length) {
        parent.remove()
      }

      // add to finalRules if we have nodes
      if (mediaRule.nodes && mediaRule.nodes.length) {
        finalRules.push(mediaRule)
      }
    })

    if (finalRules.length) {
      css.append(finalRules)
    }
  }
})