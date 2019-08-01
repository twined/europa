import fs from 'fs'

/**
 * Gives us reloading when editing config file!
 *
 * @param {*} configFile
 */

export default function (configFile) {
  if (!fs.existsSync(configFile)) {
    throw new Error(`Specified EUROPA configuration file "${ configFile }" doesn't exist.`)
  }

  return function (css, opts) {
    opts.messages.push({
      type: 'dependency',
      file: configFile,
      parent: css.source.input.file
    })
  }
}
