const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('fails on root', () => {
  const input = `
    @column 3/4;
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses regular @column-typography', () => {
  const input = `
    article {
      @column-typography 3/4;
    }
  `

  const output = `
    article {
      position: relative;
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 75%;
      max-width: 75%;
      padding-right: 12.5%;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column-typography centered', () => {
  const input = `
    article {
      @column-typography 3/4 center;
    }
  `

  const output = `
    article {
      position: relative;
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 75%;
      max-width: 75%;
      padding-right: 12.5%;
      margin-left: auto;
      margin-right: auto;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column-typography right', () => {
  const input = `
    article {
      @column-typography 3/4 right;
    }
  `

  const output = `
    article {
      position: relative;
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: 75%;
      max-width: 75%;
      padding-right: 12.5%;
      margin-left: auto;
      margin-right: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column-typography for single bp', () => {
  const input = `
    article {
      @column-typography 3/4@xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 75%;
        max-width: 75%;
        padding-right: 12.5%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column-typography for single bp centered', () => {
  const input = `
    article {
      @column-typography 3/4@xs center;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 75%;
        max-width: 75%;
        padding-right: 12.5%;
        margin-left: auto;
        margin-right: auto
      }
    }

  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses multiple @column-typography for different bp', () => {
  const input = `
    article {
      @column-typography 3/4@xs;
      @column-typography 3/5@sm;
      @column-typography 1/1@>=md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 75%;
        max-width: 75%;
        padding-right: 12.5%
      }
    }

    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 60%;
        max-width: 60%;
        padding-right: 10%
      }
    }

    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: 100%;
        padding-right: 16.6666666667%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs correctly inside @responsive', () => {
  const input = `
    article {
      @responsive xs {
        @column-typography 2/4;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 50%;
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

it('fails inside @responsive with own breakpointQuery', () => {
  const input = `
    article {
      @responsive xs {
        @column-typography 2/4@sm;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})
