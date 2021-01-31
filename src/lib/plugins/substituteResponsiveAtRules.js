import _ from 'lodash'
import postcss from 'postcss'
import cloneNodes from '../../util/cloneNodes'
import buildMediaQuery from '../../util/buildMediaQuery'
import buildMediaQueryQ from '../../util/buildMediaQueryQ';

/**
 * RESPONSIVE
 *
 * @param breakpoint
 * @param block
 *
 * Examples:
 *
 *    @resposive sm {
 *      width: 25px;
 *    }
 *
 */
module.exports = getConfig => {
  const config = getConfig()
  const finalRules = []

  return {
    postcssPlugin: 'europacss-responsive',
    prepare({ root }) {
      return {
        AtRuleExit: {
          'responsive': atRule => processRule(atRule, config, finalRules),
        },

        OnceExit() {
          if (finalRules.length) {
            root.append(finalRules)
          }
        }
      }
    }
  }
}

module.exports.postcss = true

function processRule(atRule, config, finalRules) {
  const parent = atRule.parent
  const { theme: { breakpoints, breakpointCollections } } = config


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
}