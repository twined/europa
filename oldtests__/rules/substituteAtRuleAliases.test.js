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
    @media (min-width: 0){
      article{
        margin-left: calc(8.3333333333% - 22.9166666667px)
      }
    }
    @media (min-width: 740px){
      article{
        margin-left: calc(8.3333333333% - 32.0833333333px)
      }
    }
    @media (min-width: 1024px){
      article{
        margin-left: calc(8.3333333333% - 45.8333333333px)
      }
    }
    @media (min-width: 1399px){
      article{
        margin-left: calc(8.3333333333% - 45.8333333333px)
      }
    }
    @media (min-width: 1900px){
      article{
        margin-left: calc(8.3333333333% - 55px)
      }
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
    @media (min-width: 0){
      article{
        margin-left: calc(-8.3333333333% - 27.0833333333px)
      }
    }
    @media (min-width: 740px){
      article{
        margin-left: calc(-8.3333333333% - 37.9166666667px)
      }
    }
    @media (min-width: 1024px){
      article{
        margin-left: calc(-8.3333333333% - 54.1666666667px)
      }
    }
    @media (min-width: 1399px){
      article{
        margin-left: calc(-8.3333333333% - 54.1666666667px)
      }
    }
    @media (min-width: 1900px){
      article{
        margin-left: calc(-8.3333333333% - 65px)
      }
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
        margin-left: calc(8.3333333333% - 22.9166666667px)
      }
    }
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
