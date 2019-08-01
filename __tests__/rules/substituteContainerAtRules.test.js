const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('fails on root', () => {
  const input = `
    @container;
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses @container with no other decls', () => {
  const input = `
    article {
      @container;
    }
  `

  const output = `
      article {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
      }

      @media (min-width: 0) {
        article {
          padding-left: 15px;
          padding-right: 15px;
        }
      }

      @media (min-width: 740px) {
        article {
          padding-left: 35px;
          padding-right: 35px;
        }
      }

      @media (min-width: 1024px) {
        article {
          padding-left: 50px;
          padding-right: 50px;
        }
      }

      @media (min-width: 1399px) {
        article {
          padding-left: 100px;
          padding-right: 100px;
        }
      }

      @media (min-width: 1900px) {
        article {
          padding-left: 100px;
          padding-right: 100px;
        }
      }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @container with other decls', () => {
  const input = `
    article {
      @container;
      background-color: red;
      padding-bottom: 50px;
    }
  `

  const output = `
    article {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      background-color: red;
      padding-bottom: 50px;
    }

    @media (min-width: 0) {
      article {
        padding-left: 15px;
        padding-right: 15px;
      }
    }

    @media (min-width: 740px) {
      article {
        padding-left: 35px;
        padding-right: 35px;
      }
    }

    @media (min-width: 1024px) {
      article {
        padding-left: 50px;
        padding-right: 50px;
      }
    }

    @media (min-width: 1399px) {
      article {
        padding-left: 100px;
        padding-right: 100px;
      }
    }

    @media (min-width: 1900px) {
      article {
        padding-left: 100px;
        padding-right: 100px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @container for specific breakpoints', () => {
  const input = `
    article {
      @container xs/sm/xl;
      background-color: red;
      padding-bottom: 50px;
    }
  `

  const output = `
    article {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      background-color: red;
      padding-bottom: 50px;
    }

    @media (min-width: 0) and (max-width: 739px) {
      article {
        padding-left: 15px;
        padding-right: 15px;
      }
    }

    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        padding-left: 35px;
        padding-right: 35px;
      }
    }

    @media (min-width: 1900px) {
      article {
        padding-left: 100px;
        padding-right: 100px;
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
        @container;
      }

      background-color: red;
      padding-bottom: 50px;
    }
  `

  const output = `
    article {
      background-color: red;
      padding-bottom: 50px;
    }

    @media (min-width: 0) and (max-width: 739px) {
      article {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        padding-left: 15px;
        padding-right: 15px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(1)
  })
})
