const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('parses @font', () => {
  const input = `
    article {
      @font serif;
    }
  `

  const output = `
    article {
      font-family: Georgia,Cambria,"Times New Roman",Times,serif;
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @font with size', () => {
  const input = `
    article {
      @font serif xs;
    }
  `

  const output = `
    article {
      font-family: Georgia,Cambria,"Times New Roman",Times,serif;
    }
    @media (min-width: 0) {
      article {
        font-size: 12px;
      }
    }
    @media (min-width: 740px) {
      article {
        font-size: 12px;
      }
    }
    @media (min-width: 1024px) {
      article {
        font-size: 12px;
      }
    }
    @media (min-width: 1399px) {
      article {
        font-size: 12px;
      }
    }
    @media (min-width: 1900px) {
      article {
        font-size: 14px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
