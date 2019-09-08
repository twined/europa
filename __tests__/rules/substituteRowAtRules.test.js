const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('parses @row', () => {
  const input = `
    article {
      @row;
    }
  `

  const output = `
    article {
      display: flex;
    }
    article > *:first-child {
      margin-left: 0;
    }
    @media (min-width: 0) {
      article > * {
        margin-left: 25px;
      }
    }
    @media (min-width: 740px) {
      article > * {
        margin-left: 35px;
      }
    }
    @media (min-width: 1024px) {
      article > * {
        margin-left: 50px;
      }
    }
    @media (min-width: 1399px) {
      article > * {
        margin-left: 50px;
      }
    }
    @media (min-width: 1900px) {
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
