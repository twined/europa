const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('aliases @column-offset', () => {
  const input = `
    article {
      @column-offset 1/12;
    }
  `

  const output = `
    article {
      margin-left: 8.3333333333%;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('aliases @column-offset negative value', () => {
  const input = `
    article {
      @column-offset -1/12;
    }
  `

  const output = `
    article {
      margin-left: -8.3333333333%;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('aliases @column-offset for single bp', () => {
  const input = `
    article {
      @column-offset 1/12 xs;
    }
  `

  const output = `
    @media (min-width: 0) and (max-width: 739px){
      article{
        margin-left: 8.3333333333%
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
