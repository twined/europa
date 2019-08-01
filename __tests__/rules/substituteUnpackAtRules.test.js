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
      md: '1024px'
    },
    typography: {
      sections: {
        navigation: {
          xs: {
            'font-size': '17px',
            'line-height': '17px',
            'letter-spacing': '0.12rem'
          },
          sm: {
            'font-size': '17px',
            'line-height': '17px',
            'letter-spacing': '0.12rem'
          },
          md: {
            'font-size': '12px',
            'line-height': '12px',
            'letter-spacing': '0.12rem'
          }
        }
      }
    }
  }
}

it('parses @unpack', () => {
  const input = `
    article {
      @unpack theme.typography.sections.navigation;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem
      }
    }

    @media (min-width: 740px) {
      article {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem
      }
    }

    @media (min-width: 1024px) {
      article {
        font-size: 12px;
        line-height: 12px;
        letter-spacing: 0.12rem
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses advanced @unpack', () => {
  const cfg2 = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sections: {
          navigation: {
            xs: {
              'font-size': '17px',
              'line-height': '17px',
              'letter-spacing': '0.12rem'
            },
            sm: {
              'font-size': '17px',
              'line-height': '17px',
              'letter-spacing': '0.12rem'
            },
            md: {
              'font-size': '12px',
              'line-height': '12px',
              'letter-spacing': '0.12rem'
            }
          },

          simple: {
            xs: {
              color: 'red'
            },
            sm: {
              color: 'green'
            },
            md: {
              color: 'blue'
            }
          }
        }
      }
    }
  }
  const input = `
    article {
      @unpack theme.typography.sections.navigation;

      h1 {
        color: blue;
        @unpack theme.typography.sections.simple;
      }
    }
  `

  const output = `
    article h1 {
      color: blue;
    }

    @media (min-width: 0) {
      article {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 740px) {
      article {
        font-size: 17px;
        line-height: 17px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 1024px) {
      article {
        font-size: 12px;
        line-height: 12px;
        letter-spacing: 0.12rem;
      }
    }

    @media (min-width: 0) {
      article h1 {
        color: red;
      }
    }

    @media (min-width: 740px) {
      article h1 {
        color: green;
      }
    }

    @media (min-width: 1024px) {
      article h1 {
        color: blue;
      }
    }
  `

  return run(input, cfg2).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('fails without params', () => {
  const input = `
  @unpack;
  `
  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})
