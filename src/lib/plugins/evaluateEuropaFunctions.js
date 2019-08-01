
import _ from 'lodash'
import functions from 'postcss-functions'

export default function (getConfig) {
  return functions({
    functions: {
      theme: (path, ...defaultValue) => {
        const config = getConfig()
        return _.thru(_.get(config.theme, _.trim(path, `'"`), defaultValue), value => {
          return Array.isArray(value) ? value.join(', ') : value
        })
      },
    },
  })
}
