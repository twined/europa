const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('parses @responsive for single breakpoint', () => {
  const input = `
    body article .test {
      font-size: 18px;
      color: red;

      @responsive xs {
        color: yellow;
        font-size: 15px;
      }
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
      color: red
    }

    @media (min-width: 0) and (max-width: 739px) {
      body article .test {
        color: yellow;
        font-size: 15px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @responsive for single breakpoint eq or down', () => {
  const input = `
    body article .test {
      font-size: 18px;
      color: red;

      @responsive <=sm {
        color: yellow;
        font-size: 15px;
      }
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
      color: red
    }

    @media (min-width: 0) and (max-width: 1023px) {
      body article .test {
        color: yellow;
        font-size: 15px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @responsive for multiple breakpoints', () => {
  const input = `
    body article .test {
      font-size: 18px;
      color: red;

      @responsive xs/sm/xl {
        color: yellow;
        font-size: 15px;
      }
    }
  `

  const output = `
    body article .test {
      font-size: 18px;
      color: red
    }

    @media (min-width: 0) and (max-width: 739px), (min-width: 740px) and (max-width: 1023px), (min-width: 1900px) {
      body article .test {
        color: yellow;
        font-size: 15px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses multiple @responsive within same rule', () => {
  const input = `
    article {
      width: 90%;
      background-color: black;

      @responsive xs/sm {
        width: 100%;
      }

      @responsive >sm {
        width: 80%;
      }

      @responsive >=md {
        display: flex;
        flex-direction: row;
      }

      @responsive xl {
        background-color: yellow;
      }
    }
  `

  const output = `
    article {
      width: 90%;
      background-color: black
    }

    @media (min-width: 0) and (max-width: 739px), (min-width: 740px) and (max-width: 1023px) {
      article {
        width: 100%
      }
    }

    @media (min-width: 1024px) {
      article {
        width: 80%
      }
    }

    @media (min-width: 1024px) {
      article {
        display: flex;
        flex-direction: row
      }
    }

    @media (min-width: 1900px) {
      article {
        background-color: yellow
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('can run from root', () => {
  const input = `
    @responsive xs {
      .alert-yellow {
        color: yellow;
      }

      .alert-red {
        color: red;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      .alert-yellow {
        color: yellow;
      }
      .alert-red {
        color: red;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('can run multiple from root', () => {
  const input = `
    @responsive xs {
      .alert-yellow {
        color: yellow;
      }

      .alert-red {
        color: red;
      }
    }

    @responsive sm {
      .alert-yellow {
        display: none;
      }

      .alert-red {
        display: none;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      .alert-yellow {
        color: yellow;
      }
      .alert-red {
        color: red;
      }
    }

    @media (min-width: 740px) and (max-width: 1023px) {
      .alert-yellow {
        display: none;
      }
      .alert-red {
        display: none;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('fails without children', () => {
  const input = `
    body article .test {
      font-size: 18px;
      color: red;

      @responsive;
    }
  `
  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('fails without params', () => {
  const input = `
    body article .test {
      font-size: 18px;
      color: red;

      @responsive {
        font-size: 55px;
      }
    }
  `
  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses advanced nesting', () => {
  const input = `
    header[data-nav] {
      @container;
      @unpack theme.header.padding.large;

      nav {
        color: pink;
        figure {
          &.brand {
            z-index: 5;

            @responsive <=sm {
              align-items: flex-start;
            }

            svg {
              @unpack theme.typography.sections.navigation;
            }
          }
        }
      }
    }
  `

  const output = `
    header[data-nav] {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
    }

    @media (min-width: 0) {
      header[data-nav] {
        padding-left: 15px;
        padding-right: 15px;
      }
    }

    @media (min-width: 740px) {
      header[data-nav] {
        padding-left: 35px;
        padding-right: 35px;
      }
    }

    @media (min-width: 1024px) {
      header[data-nav] {
        padding-left: 50px;
        padding-right: 50px;
      }
    }

    @media (min-width: 1399px) {
      header[data-nav] {
        padding-left: 100px;
        padding-right: 100px;
      }
    }

    @media (min-width: 1900px) {
      header[data-nav] {
        padding-left: 100px;
        padding-right: 100px;
      }
    }

    header[data-nav] nav {
      color: pink;
    }

    header[data-nav] nav figure.brand {
      z-index: 5;
    }

    @media (min-width: 0) {
      header[data-nav] {
        padding-top: 15px;
        padding-bottom: 15px;
      }
    }

    @media (min-width: 740px) {
      header[data-nav] {
        padding-top: 40px;
        padding-bottom: 40px;
      }
    }

    @media (min-width: 1024px) {
      header[data-nav] {
        padding-top: 40px;
        padding-bottom: 40px;
      }
    }

    @media (min-width: 1399px) {
      header[data-nav] {
        padding-top: 70px;
        padding-bottom: 70px;
      }
    }

    @media (min-width: 1900px) {
      header[data-nav] {
        padding-top: 80px;
        padding-bottom: 80px;
      }
    }

    @media (min-width: 0) and (max-width: 1023px) {
      header[data-nav] nav figure.brand {
        align-items: flex-start;
      }
    }

    @media (min-width: 0) {
      header[data-nav] nav figure.brand svg {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 740px) {
      header[data-nav] nav figure.brand svg {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 1024px) {
      header[data-nav] nav figure.brand svg {
        font-size: 12px;
        line-height: 12px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 1399px) {
      header[data-nav] nav figure.brand svg {
        font-size: 12px;
        line-height: 12px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 1900px) {
      header[data-nav] nav figure.brand svg {
        font-size: 15px;
        line-height: 15px;
        letter-spacing: 2px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses multiple space tags inside reponsive', () => {
  const input = `
    .v-module {
      &[data-v="body+center"] {
        @responsive >=lg {
          @space padding-left 2;
          @space margin-left 3/12;
          @column-typography 6/12;
        }
      }
    }
  `

  const output = `
    @media (min-width: 1399px) and (max-width: 1899px){
      .v-module[data-v="body+center"]{
        padding-left: 50px
      }
    }

    @media (min-width: 1900px){
      .v-module[data-v="body+center"]{
        padding-left: 60px
      }
    }

    @media (min-width: 1399px) and (max-width: 1899px){
      .v-module[data-v="body+center"]{
        margin-left: 25%
      }
    }

    @media (min-width: 1900px){
      .v-module[data-v="body+center"]{
        margin-left: 25%
      }
    }

    @media (min-width: 1399px){
      .v-module[data-v="body+center"]{
        position: relative;
        flex: 0 0 50%;
        max-width: 50%;
        padding-right: 8.3333333333%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
