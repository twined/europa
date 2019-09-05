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

it('parses regular @column', () => {
  const input = `
    article {
      @column 3/4;
    }
  `

  const output = `
    article {
      position: relative;
      flex: 0 0 75%;
      max-width: 75%;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column + gutter', () => {
  const input = `
    article {
      @column 3:1/4;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 12.5px);
        max-width: calc(75% + 12.5px)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 17.5px);
        max-width: calc(75% + 17.5px)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 25px);
        max-width: calc(75% + 25px)
      }
    }
    @media (min-width: 1399px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 25px);
        max-width: calc(75% + 25px)
      }
    }
    @media (min-width: 1900px) {
      article {
        position: relative;
        flex: 0 0 calc(75% + 30px);
        max-width: calc(75% + 30px)
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column centered', () => {
  const input = `
    article {
      @column 3/4 center;
    }
  `

  const output = `
    article {
      position: relative;
      flex: 0 0 75%;
      max-width: 75%;
      margin-left: auto;
      margin-right: auto;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column right', () => {
  const input = `
    article {
      @column 3/4 right;
    }
  `

  const output = `
    article {
      position: relative;
      flex: 0 0 75%;
      max-width: 75%;
      margin-left: auto;
      margin-right: 0;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column for single bp', () => {
  const input = `
    article {
      @column 3/4@xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 75%;
        max-width: 75%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @column for single bp centered', () => {
  const input = `
    article {
      @column 3/4@xs center;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 75%;
        max-width: 75%;
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

it('parses multiple @column for different bp', () => {
  const input = `
    article {
      @column 3/4@xs;
      @column 3/5@sm;
      @column 1/1@>=md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 75%;
        max-width: 75%
      }
    }

    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex: 0 0 60%;
        max-width: 60%
      }
    }

    @media (min-width: 1024px) {
      article {
        position: relative;
        flex: 0 0 100%;
        max-width: 100%
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
        @column 2/4;
      }
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex: 0 0 50%;
        max-width: 50%
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
        @column 2/4@sm;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('fails with wrong syntax', () => {
  const input = `
    article {
      @column 12/12 <=sm;
      @column 6/12 md;
      @column 8/12 >=lg;
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses properly with multiple @column in a row', () => {
  const input = `
    article {
      @column 12/12@<=sm;
      @column 6/12@md;
      @column 8/12@>=lg;
    }
  `

  const output = `
  @media (min-width: 0) and (max-width: 1023px) {
    article {
      position: relative;
      flex: 0 0 100%;
      max-width: 100%
    }
  }

  @media (min-width: 1024px) and (max-width: 1398px) {
    article {
      position: relative;
      flex: 0 0 50%;
      max-width: 50%
    }
  }

  @media (min-width: 1399px) {
    article {
      position: relative;
      flex: 0 0 66.6666666667%;
      max-width: 66.6666666667%
    }
  }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
