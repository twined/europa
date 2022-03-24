import lintAtRules from './lintAtRules'
import evaluateEuropaFunctions from './evaluateEuropaFunctions'
import substituteIfAtRules from './substituteIfAtRules'
import substituteColorAtRules from './substituteColorAtRules'
import substituteEuropaAtRules from './substituteEuropaAtRules'
import substituteIterateAtRules from './substituteIterateAtRules'
import substituteUnpackAtRules from './substituteUnpackAtRules'
import substituteContainerAtRules from './substituteContainerAtRules'
import substituteAtruleAliases from './substituteAtruleAliases'
import substituteSpaceAtRules from './substituteSpaceAtRules'
import substituteFontAtRules from './substituteFontAtRules'
import substituteFontsizeAtRules from './substituteFontsizeAtRules'
import substituteColumnAtRules from './substituteColumnAtRules'
import substituteResponsiveAtRules from './substituteResponsiveAtRules'
import substituteEmbedResponsiveAtRules from './substituteEmbedResponsiveAtRules'
import substituteGridAtRules from './substituteGridAtRules'

export default [
  lintAtRules,
  substituteEuropaAtRules,
  substituteIfAtRules,
  substituteColorAtRules,
  evaluateEuropaFunctions,
  substituteGridAtRules,
  substituteIterateAtRules,
  substituteUnpackAtRules,
  substituteContainerAtRules,
  substituteAtruleAliases,
  substituteSpaceAtRules,
  substituteFontAtRules,
  substituteFontsizeAtRules,
  substituteEmbedResponsiveAtRules,
  substituteColumnAtRules,
  substituteResponsiveAtRules
]
