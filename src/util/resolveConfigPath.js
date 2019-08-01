import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import { defaultConfigFile } from '../constants'

export default function resolveConfigPath (filePath) {
  if (_.isObject(filePath)) {
    return undefined
  }

  if (!_.isUndefined(filePath)) {
    return path.resolve(filePath)
  }

  try {
    const defaultConfigPath = path.resolve(defaultConfigFile)
    fs.accessSync(defaultConfigPath)
    return defaultConfigPath
  } catch (err) {
    return undefined
  }
}
