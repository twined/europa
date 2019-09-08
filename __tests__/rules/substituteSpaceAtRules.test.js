import postcss from 'postcss'

const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

const DEFAULT_CFG = {
  theme: {
    breakpoints: {
      xs: '0',
      sm: '740px',
      md: '1024px'
    },
    spacing: {
      md: {
        xs: '25px',
        sm: '50px',
        md: '75px'
      }
    },
    columns: {
      gutters: {
        xs: '20px',
        sm: '30px',
        md: '50px'
      }
    }
  }
}

it('parses @space per mq size', () => {
  const input = `
    body article .test {
      @space margin-top xl;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 0){
      body article .test {
        margin-top: 85px;
      }
    }

    @media (min-width: 740px){
      body article .test {
        margin-top: 100px;
      }
    }

    @media (min-width: 1024px){
      body article .test {
        margin-top: 140px;
      }
    }

    @media (min-width: 1399px){
      body article .test {
        margin-top: 140px;
      }
    }

    @media (min-width: 1900px){
      body article .test {
        margin-top: 180px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space only for requested bp', () => {
  const input = `
    body article .test {
      @space margin-top xl xs;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      body article .test {
        margin-top: 85px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space! only for requested bp', () => {
  const input = `
    body article .test {
      @space! margin-top xl xs;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      body article .test {
        margin-top: 85px !important;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space for theme(..)', () => {
  const input = `
    body article .test {
      @space margin-top vertical-rhythm(theme.typography.sizes.xl) xs;
    }

    body article .test {
      @space margin-top vertical-rhythm(theme.typography.sizes.xl, 1.2) xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      body article .test{
        margin-top: calc(20px * 1.6)
      }
    }

    @media (min-width: 0) and (max-width: 739px){
      body article .test{
        margin-top: calc(20px * 1.2)
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space for fraction', () => {
  const input = `
    article {
      @space margin-top 6/12 xs;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }
    @media (min-width: 0) and (max-width: 739px){
      article {
        margin-top: calc(50% - 12.5px);
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space for fraction with gutter multiplier', () => {
  const input = `
    article {
      @space margin-top 6:-1/12;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }
    @media (min-width: 0){
      article {
        margin-top: calc(50% - 30px);
      }
    }
    @media (min-width: 740px){
      article {
        margin-top: calc(50% - 45px);
      }
    }
    @media (min-width: 1024px){
      article {
        margin-top: calc(50% - 75px);
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space for fraction of breakpoint key', () => {
  const input = `
    article {
      @space margin-top xs/2 xs;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      article {
        margin-top: calc(10px/2);
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space for fraction of breakpoint key for all breakpoints', () => {
  const input = `
    article {
      @space margin-top xs/2;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }

    @media (min-width: 0){
      article {
        margin-top: calc(10px/2);
      }
    }

    @media (min-width: 740px){
      article {
        margin-top: calc(15px/2);
      }
    }

    @media (min-width: 1024px){
      article {
        margin-top: calc(15px/2);
      }
    }

    @media (min-width: 1399px){
      article {
        margin-top: calc(15px/2);
      }
    }

    @media (min-width: 1900px){
      article {
        margin-top: calc(15px/2);
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('@space with fraction and no breakpointQuery', () => {
  const input = `
    article {
      @space margin-left 6/12;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }
    @media (min-width: 0){
      article {
        margin-left: calc(50% - 10px);
      }
    }
    @media (min-width: 740px){
      article {
        margin-left: calc(50% - 15px);
      }
    }
    @media (min-width: 1024px){
      article {
        margin-left: calc(50% - 25px);
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space as gutter multiplier for regular number', () => {
  const input = `
    article {
      @space padding-left 1 xs;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      article {
        padding-left: 12.5px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space as negative gutter multiplier for regular number', () => {
  const input = `
    article {
      @space padding-left -1 xs;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      article {
        padding-left: -12.5px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space as gutter multiplier for regular number across bps', () => {
  const input = `
    article {
      @space padding-left 1;
      font-size: 18px;
    }
  `

  const output = `
    article {
      font-size: 18px;
    }

    @media (min-width: 0){
      article {
        padding-left: 12.5px;
      }
    }

    @media (min-width: 740px){
      article {
        padding-left: 17.5px;
      }
    }

    @media (min-width: 1024px){
      article {
        padding-left: 25px;
      }
    }

    @media (min-width: 1399px){
      article {
        padding-left: 25px;
      }
    }

    @media (min-width: 1900px){
      article {
        padding-left: 30px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space with no max for last bp', () => {
  const input = `
    body article .test {
      @space margin-top xl xl;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 1900px){
      body article .test {
        margin-top: 180px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space 0 w/o breakpoints', () => {
  const input = `
    article {
      @space margin-y 0;
    }
  `

  const output = `
    article {
      margin-top: 0;
      margin-bottom: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space 0 w/ breakpoint', () => {
  const input = `
    article {
      @space margin-y 0 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        margin-top: 0;
        margin-bottom: 0
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space shortcuts margin', () => {
  const input = `
    article {
      @space margin 0;
    }
  `

  const output = `
    article {
      margin-left: 0;
      margin-right: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space shortcuts padding', () => {
  const input = `
    article {
      @space padding 0;
    }
  `

  const output = `
    article {
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space shortcuts padding-y', () => {
  const input = `
    article {
      @space padding-y 0;
    }
  `

  const output = `
    article {
      padding-top: 0;
      padding-bottom: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space with q', () => {
  const input = `
    body article .test {
      @space margin-top xl <=sm;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      body article .test {
        margin-top: 85px;
      }
    }

    @media (min-width: 740px) and (max-width: 1023px){
      body article .test {
        margin-top: 100px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space with > *', () => {
  const input = `
    article {
      display: flex;
      flex-wrap: nowrap;

      > * {
        @space margin-left 2;

        &:first-of-type {
          margin-left: 0;
        }
      }
    }
  `

  const output = `
    article {
      display: flex;
      flex-wrap: nowrap;
    }
    article > *:first-of-type {
      margin-left: 0;
    }
    @media (min-width: 0){
      article > * {
        margin-left: 25px;
      }
    }
    @media (min-width: 740px){
      article > * {
        margin-left: 35px;
      }
    }
    @media (min-width: 1024px){
      article > * {
        margin-left: 50px;
      }
    }
    @media (min-width: 1399px){
      article > * {
        margin-left: 50px;
      }
    }
    @media (min-width: 1900px){
      article > * {
        margin-left: 60px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space with multiple split bps', () => {
  const input = `
    body article .test {
      @space margin-top xl xs/sm/xl;
      font-size: 18px;
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
    }

    @media (min-width: 0) and (max-width: 739px){
      body article .test {
        margin-top: 85px;
      }
    }

    @media (min-width: 740px) and (max-width: 1023px){
      body article .test {
        margin-top: 100px;
      }
    }

    @media (min-width: 1900px){
      body article .test {
        margin-top: 180px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @space per mq size with shortcuts', () => {
  const input = `
    body {
      @space margin-y xl;
    }
  `
  const output = `
    @media (min-width: 0){
      body{
        margin-top: 85px;
        margin-bottom: 85px
      }
    }

    @media (min-width: 740px){
      body{
        margin-top: 100px;
        margin-bottom: 100px
      }
    }

    @media (min-width: 1024px){
      body{
        margin-top: 140px;
        margin-bottom: 140px
      }
    }

    @media (min-width: 1399px){
      body{
        margin-top: 140px;
        margin-bottom: 140px
      }
    }

    @media (min-width: 1900px){
      body{
        margin-top: 180px;
        margin-bottom: 180px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('works inside @responsive', () => {
  const input = `
    article {
      @responsive xs {
        @space margin-top xl;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        margin-top: 85px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
  })
})

it('can use container as size', () => {
  const input = `
    article {
      @space margin-left container xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        margin-left: 15px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('works inside @responsive with q string', () => {
  const input = `
    article {
      @responsive >md {
        @space margin-top xl;
      }
    }
  `

  const output = `
    @media (min-width: 1399px) and (max-width: 1899px){
      article{
        margin-top: 140px
      }
    }

    @media (min-width: 1900px){
      article{
        margin-top: 180px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
  })
})

it('works inside @responsive as dbl parent', () => {
  const input = `
    @responsive xs {
      article {
        @space margin-top xl;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        margin-top: 85px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('fails with bp query inside @responsive', () => {
  const input = `
    article {
      @responsive xs {
        @space margin-top xl >=md;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('can run from @responsive root', () => {
  const input = `
    @responsive xs {
      .alert-yellow {
        @space margin-top xs;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      .alert-yellow{
        margin-top: 10px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
