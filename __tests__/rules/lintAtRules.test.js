import postcss from 'postcss'
import defaultConfig from '../../stubs/defaultConfig.js'
import resolveConfig from '../../src/util/resolveConfig'
import lintAtRules from '../../src/lib/plugins/lintAtRules'

const resolvedDefaultConfig = resolveConfig([defaultConfig])

function run (input, config = resolvedDefaultConfig) {
  return postcss([lintAtRules(config)]).process(input, { from: undefined })
}

it('multiple @space under @responsive does not warn', () => {
  const input = `
    @responsive xs {
      @space padding-left 2;
      @space padding-right 2;
    }
  `
  return run(input).then(result => {
    expect(result.warnings().length).toBe(0)
  })
})

it('warns with @unpack under @responsive', () => {
  const input = `
    @responsive xs {
      font-size: 11px;
      @unpack theme.whatever;
    }
  `
  return run(input).then(result => {
    expect(result.warnings().length).toBe(1)
  })
})
