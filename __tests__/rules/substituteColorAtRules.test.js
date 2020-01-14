const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

const DEFAULT_CFG = {
  theme: {
    colors: {
      green: {
        dark: '#22AA22',
        light: '#AAFFAA'
      }
    }
  }
}

it('parses @color', () => {
  const input = `
    article {
      @color fg green.dark;
      @color bg green.light;
    }
  `

  const output = `
    article {
      color: #22AA22;
      background-color: #AAFFAA;
    }
  `

  return run(input, DEFAULT_CFG).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
