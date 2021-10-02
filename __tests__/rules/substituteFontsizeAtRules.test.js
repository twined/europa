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

it('parses hardcoded @fontsize for single breakpoint', () => {
  const input = `
    article {
      @fontsize 50px xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 50px
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

it('parses regular @fontsize for all breakpoints with modifier and no line-height', () => {
  const input = `
    article {
      @fontsize lg(2.0);
    }
  `

  const output = `
    @media (min-width: 0){
      article{
        font-size: 38px
      }
    }
    @media (min-width: 740px){
      article{
        font-size: 42px
      }
    }
    @media (min-width: 1024px){
      article{
        font-size: 42px
      }
    }
    @media (min-width: 1399px){
      article{
        font-size: 42px
      }
    }
    @media (min-width: 1900px){
      article{
        font-size: 44px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @fontsize for single breakpoint with modifier and no line-height', () => {
  const input = `
    article {
      @fontsize lg(2.0) xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 38px
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @fontsize correctly inside @responsive', () => {
  const CFG = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        families: {
          serif: 'SerifFont, serif'
        },

        sizes: {
          base: {
            sm: {
              'font-size': '17px',
              'line-height': '1.3'
            },
            md: {
              'font-size': '19px',
              'line-height': '1.3'
            }
          }
        }
      }
    }
  }

  const input = `
    @responsive >=sm {
      h1 {
        @fontsize base/1;
        font-family: theme(typography.families.serif);
      }
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1023px){
      h1{
        font-size: 17px;
        line-height: 1.3;
      }
    }
    @media (min-width: 1024px){
      h1{
        font-size: 19px;
        line-height: 1.3;
      }
    }
    @media (min-width: 740px){
      h1 {
        font-family: SerifFont, serif;
      }
    }
  `

  return run(input, CFG).then(result => {
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

it('parses between() @fontsize for single breakpoint', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sizes: {
          variable: {
            sm: 'between(20px-30px)'
          }
        }
      }
    }
  }

  const input = `
    article {
      @fontsize variable sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1023px){
      article{
        font-size: calc(20px + 10 * ((100vw - 740px) / 283))
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses vw fonts to add scale var', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sizes: {
          variable: {
            sm: '4vw'
          }
        }
      }
    }
  }

  const input = `
    article {
      @fontsize variable sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1023px){
      article{
        font-size: calc(4vw * var(--ec-zoom))
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses fontsize objects with vw to use scale var', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sizes: {
          variable: {
            sm: {
              'font-size': '4vw',
              'line-height': '4vw'
            }
          }
        }
      }
    }
  }

  const input = `
    article {
      @fontsize variable sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1023px){
      article{
        font-size: calc(4vw * var(--ec-zoom));
        line-height: calc(4vw * var(--ec-zoom))
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

it('parses a selector path', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      },
      typography: {
        sizes: {
          product: {
            name: {
              xs: '14px',
              sm: '16px'
            }
          }
        }
      }
    }
  }

  const input = `
    article {
      @fontsize product.name xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        font-size: 14px
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses between()', () => {
  const cfg = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px'
      }
    }
  }

  const input = `
    article {
      @fontsize between(12px-16px)/2.0 sm;
    }
  `

  const output = `
    @media (min-width: 740px) and (max-width: 1023px){
      article{
        font-size: calc(12px + 4 * ((100vw - 740px) / 283));
        line-height: 2.0
      }
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
