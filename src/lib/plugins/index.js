import lintAtRules from './lintAtRules'
import evaluateEuropaFunctions from './evaluateEuropaFunctions'
import substituteIfAtRules from './substituteIfAtRules'
import substituteEuropaAtRules from './substituteEuropaAtRules'
import substituteIterateAtRules from './substituteIterateAtRules'
import substituteUnpackAtRules from './substituteUnpackAtRules'
import substituteContainerAtRules from './substituteContainerAtRules'
import substituteAtruleAliases from './substituteAtruleAliases'
import substituteSpaceAtRules from './substituteSpaceAtRules'
import substituteFontsizeAtRules from './substituteFontsizeAtRules'
import substituteRFSAtRules from './substituteRFSAtRules'
import substituteColumnAtRules from './substituteColumnAtRules'
import substituteColumnTypographyAtRules from './substituteColumnTypographyAtRules'
import substituteResponsiveAtRules from './substituteResponsiveAtRules'
import substituteEmbedResponsiveAtRules from './substituteEmbedResponsiveAtRules'
import substituteRowAtRules from './substituteRowAtRules'
import postcssExtend from 'postcss-extend-rule'

export default [
  lintAtRules,
  // substituteRowAtRules,
  substituteEuropaAtRules,
  substituteIfAtRules,
  evaluateEuropaFunctions,
  substituteIterateAtRules,
  substituteUnpackAtRules,
  substituteContainerAtRules,
  substituteAtruleAliases,
  substituteSpaceAtRules,
  substituteFontsizeAtRules,
  substituteRFSAtRules,
  substituteEmbedResponsiveAtRules,
  substituteColumnAtRules,
  substituteColumnTypographyAtRules,
  substituteResponsiveAtRules
]
