import _ from 'lodash'
import postcss from 'postcss'

export default function updateSource (nodes, source) {
  return _.tap(Array.isArray(nodes) ? postcss.root({ nodes }) : nodes, tree => {
    tree.walk(node => (node.source = source))
  })
}
