import postcss from 'postcss'
import defaultConfig from '../../stubs/defaultConfig.js'
import resolveConfig from '../../src/util/resolveConfig'
import lintAtRules from '../../src/lib/plugins/lintAtRules'

const resolvedDefaultConfig = resolveConfig([defaultConfig])

function run (input, config = resolvedDefaultConfig) {
  return postcss([lintAtRules(config)]).process(input, { from: undefined })
}

// it('warns with single @space under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @space padding-right 2;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @column under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @column 6/12;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @column-typography under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @column-typography 6/12;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @column-offset under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @column-offset 6/12;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @rfs under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @rfs xl;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @fontsize under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @fontsize xl;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

// it('warns with single @container under @responsive', () => {
//   const input = `
//     @responsive xs {
//       @container xl;
//     }
//   `
//   return run(input).then(result => {
//     expect(result.warnings().length).toBe(1)
//   })
// })

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
