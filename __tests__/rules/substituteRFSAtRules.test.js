const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

const cfg = {
  theme: {
    breakpoints: {
      xs: '0',
      sm: '740px',
      md: '1049px'
    },
    typography: {
      rfs: {
        minimum: {
          base: {
            xs: '10px',
            sm: '12px',
            md: '14px',
            lg: '16px',
            xl: '18px'
          }
        }
      },
      sizes: {
        base: {
          xs: '12px',
          sm: '16px',
          md: '20px',
          lg: '24px',
          xl: '30px'
        }
      }
    }
  }
}

it('fails on root', () => {
  const input = `
    @rfs base;
  `

  expect.assertions(1)
  return run(input, cfg).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses regular @rfs for all breakpoints', () => {
  const input = `
    article {
      @rfs base;
    }
  `

  const output = `
    @media (min-width: 0){
      article{
        font-size: calc(10px + 2 * ((100vw - 320px) / 739))
      }
    }

    @media (min-width: 740px){
      article{
        font-size: calc(12px + 4 * ((100vw - 740px) / 308))
      }
    }

    @media (min-width: 1049px){
      article{
        font-size: calc(14px + 6 * ((100vw - 1049px) / 200))
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @rfs for single breakpoint', () => {
  const input = `
    article {
      @rfs base sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1048px){
      article{
        font-size: calc(12px + 4 * ((100vw - 740px) / 308))
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @rfs for single breakpoint with line-height', () => {
  const input = `
    article {
      @rfs base/2.0 sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1048px){
      article{
        font-size: calc(12px + 4 * ((100vw - 740px) / 308));
        line-height: 2.0
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs correctly inside @responsive', () => {
  const input = `
    article {
      @responsive sm {
        @rfs base;
      }
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1048px) {
      article {
        font-size: calc(12px + 4 * ((100vw - 740px) / 308))
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(1)
  })
})

it('fails inside @responsive with own breakpointQuery', () => {
  const input = `
    article {
      @responsive xs {
        @rfs lg >=md;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})
