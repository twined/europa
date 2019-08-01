const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('fails on root', () => {
  const input = `
    @fontsize base;
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses regular @fontsize for all breakpoints', () => {
  const input = `
    article {
      @fontsize lg;
    }
  `

  const output = `
    @media (min-width: 0){
      article{
        font-size: 19px
      }
    }

    @media (min-width: 740px){
      article{
        font-size: 21px
      }
    }

    @media (min-width: 1024px){
      article{
        font-size: 21px
      }
    }

    @media (min-width: 1399px){
      article{
        font-size: 21px
      }
    }

    @media (min-width: 1900px){
      article{
        font-size: 22px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @fontsize for single breakpoint', () => {
  const input = `
    article {
      @fontsize lg xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 19px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @fontsize for single breakpoint with line-height', () => {
  const input = `
    article {
      @fontsize lg/2.0 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 19px;
        line-height: 2.0
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @fontsize for single breakpoint with line-height and modifier', () => {
  const input = `
    article {
      @fontsize lg(2.0)/2.0 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 38px;
        line-height: 2.0
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @fontsize for all breakpoints with line-height and modifier', () => {
  const input = `
    article {
      @fontsize lg(2.0)/2.0;
    }
  `

  const output = `
    @media (min-width: 0){
      article{
        font-size: 38px;
        line-height: 2.0
      }
    }

    @media (min-width: 740px){
      article{
        font-size: 42px;
        line-height: 2.0
      }
    }

    @media (min-width: 1024px){
      article{
        font-size: 42px;
        line-height: 2.0
      }
    }

    @media (min-width: 1399px){
      article{
        font-size: 42px;
        line-height: 2.0
      }
    }

    @media (min-width: 1900px){
      article{
        font-size: 44px;
        line-height: 2.0
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses object @fontsize for single breakpoint', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sizes: {
          base: {
            xs: {
              'font-size': '17px',
              'line-height': '24px',
              'letter-spacing': '0.98px'
            },
            sm: '19px'
          }
        }
      }
    }
  }

  const input = `
    article {
      @fontsize base xs;
      @fontsize base sm;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 17px;
        line-height: 24px;
        letter-spacing: 0.98px
      }
    }

    @media (min-width: 740px) and (max-width: 1023px){
      article{
        font-size: 19px
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
      @responsive xs {
        @fontsize lg;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        font-size: 19px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(1)
  })
})

it('fails inside @responsive with own breakpointQuery', () => {
  const input = `
    article {
      @responsive xs {
        @fontsize lg >=md;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})
