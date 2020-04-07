const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('sets column gap and display grid', () => {
  const input = `
    article {
      @grid;
      color: blue;
    }
  `

  const output = `
    article {
      display: grid;
      color: blue;
    }
    @media(min-width: 0){
      article {
        grid-column-gap: 25px;
      }
    }
    @media(min-width: 740px){
      article {
        grid-column-gap: 35px;
      }
    }
    @media(min-width: 1024px){
      article {
        grid-column-gap: 50px;
      }
    }
    @media(min-width: 1399px){
      article {
        grid-column-gap: 50px;
      }
    }
    @media(min-width: 1900px){
      article {
        grid-column-gap: 60px;
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
