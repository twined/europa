const postcss = require('postcss')
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
    @media (min-width: 0) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% - 5px);
        max-width: calc(75% - 5px - 0.002vw)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% - 7.5px);
        max-width: calc(75% - 7.5px - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% - 12.5px);
        max-width: calc(75% - 12.5px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses calc()ed @column', () => {
  const input = `
    article {
      @column calc(100vw - var[3/4]);
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(100vw - (75% - 5px));
        max-width: calc(100vw - 75% + 5px - 0.002vw)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(100vw - (75% - 7.5px));
        max-width: calc(100vw - 75% + 7.5px - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(100vw - (75% - 12.5px));
        max-width: calc(100vw - 75% + 12.5px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
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
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 15px);
        max-width: calc(75% + 15px - 0.002vw)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 22.5px);
        max-width: calc(75% + 22.5px - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 37.5px);
        max-width: calc(75% + 37.5px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses regular @column + half gutter', () => {
  const input = `
    article {
      @column 3:0.5/4;
    }
  `

  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 5px);
        max-width: calc(75% + 5px - 0.002vw)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 7.5px);
        max-width: calc(75% + 7.5px - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% + 12.5px);
        max-width: calc(75% + 12.5px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('fails on old format', () => {
  const input = `
    article {
      @column 3/4@xs;
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses @column for single bp', () => {
  const input = `
    article {
      @column 3/4 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% - 5px);
        max-width: calc(75% - 5px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses multiple @column for different bp', () => {
  const input = `
    article {
      @column 3/4 xs;
      @column 3/5 sm;
      @column 1/1 md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(75% - 6.25px);
        max-width: calc(75% - 6.25px - 0.002vw)
      }
    }
    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(60% - 14px);
        max-width: calc(60% - 14px - 0.002vw)
      }
    }
    @media (min-width: 1024px) and (max-width: 1398px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: calc(100% - 0.002vw)
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
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% - 10px);
        max-width: calc(50% - 10px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs nested under advanced breakpoint', () => {
  const ADVANCED_CFG = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px',
        lg: '1250px',
        xl: '1920px'
      },
      spacing: {
        md: {
          xs: '25px',
          sm: '50px',
          md: '75px',
          lg: '95px',
          xl: '115px'
        }
      },
      columns: {
        gutters: {
          xs: '20px',
          sm: '30px',
          md: '50px',
          lg: '70px',
          xl: '90px'
        }
      }
    }
  }

  const input = `
    article {
      @responsive >=md {
        @column 2:1/4;
      }
    }
  `

  const output = `
    @media (min-width: 1024px) and (max-width: 1249px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 25px);
        max-width: calc(50% + 25px - 0.002vw)
      }
    }
    @media (min-width: 1250px) and (max-width: 1919px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 35px);
        max-width: calc(50% + 35px - 0.002vw)
      }
    }
    @media (min-width: 1920px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 45px);
        max-width: calc(50% + 45px - 0.002vw)
      }
    }
  `

  return run(input, ADVANCED_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs with advanced breakpoint', () => {
  const ADVANCED_CFG = {
    theme: {
      breakpoints: {
        xs: '0',
        sm: '740px',
        md: '1024px',
        lg: '1250px',
        xl: '1920px'
      },
      spacing: {
        md: {
          xs: '25px',
          sm: '50px',
          md: '75px',
          lg: '95px',
          xl: '115px'
        }
      },
      columns: {
        gutters: {
          xs: '20px',
          sm: '30px',
          md: '50px',
          lg: '70px',
          xl: '90px'
        }
      }
    }
  }

  const input = `
    article {
      @column 2:1/4 >=md;
    }
  `

  const output = `
    @media (min-width: 1024px) and (max-width: 1249px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 25px);
        max-width: calc(50% + 25px - 0.002vw)
      }
    }
    @media (min-width: 1250px) and (max-width: 1919px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 35px);
        max-width: calc(50% + 35px - 0.002vw)
      }
    }
    @media (min-width: 1920px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 45px);
        max-width: calc(50% + 45px - 0.002vw)
      }
    }
  `

  return run(input, ADVANCED_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('runs with gutters and breakpoint', () => {
  const input = `
    article {
      @column 2:1/4 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% + 10px);
        max-width: calc(50% + 10px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('fails inside @responsive with own breakpointQuery', () => {
  const input = `
    article {
      @responsive xs {
        @column 2/4 sm;
      }
    }
  `

  expect.assertions(1)
  return run(input).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

it('parses 12/12', () => {
  const input = `
    article {
      @column 12/12;
    }
  `
  const output = `
    @media (min-width: 0) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: calc(100% - 0.002vw)
      }
    }
    @media (min-width: 740px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: calc(100% - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: calc(100% - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses properly with multiple @column in a row', () => {
  const input = `
    article {
      @column 12/12 xs;
      @column 6/12 sm/md;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: 100%;
        max-width: calc(100% - 0.002vw)
      }
    }
    @media (min-width: 740px) and (max-width: 1023px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% - 15px);
        max-width: calc(50% - 15px - 0.002vw)
      }
    }
    @media (min-width: 1024px) {
      article {
        position: relative;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: calc(50% - 25px);
        max-width: calc(50% - 25px - 0.002vw)
      }
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
