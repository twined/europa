import postcss from 'postcss'

module.exports = (opts = {}) => {
  return {
    postcssPlugin: 'europacss-lint',
    prepare (result) {
      return {
        AtRule: {
          responsive: atRule => {
            const nodes = atRule.nodes
            if (!nodes) {
              atRule.warn(
                result,
                `RESPONSIVE: @responsive rule is empty!`,
                {
                  name: '@responsive',
                  plugin: 'europacss'
                }
              )
              return
            }

            atRule.walkAtRules(childNode => {
              switch (childNode.name) {
                case 'unpack':
                  atRule.warn(
                    result,
                    `UNPACK: @unpack should not be nested under @responsive, since it unpacks through all breakpoints`,
                    {
                      name: 'unpack',
                      plugin: 'europacss'
                    }
                  )
              }
            })

          }
        }
      }
    }
  }
}
module.exports.postcss = true
