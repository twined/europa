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
        margin-left: calc(8.333333333333334% - 22.916666666666668px)
      }
    }
    @media (min-width: 740px){
      article{
        margin-left: calc(8.333333333333334% - 32.083333333333336px)
      }
    }
    @media (min-width: 1024px){
      article{
        margin-left: calc(8.333333333333334% - 45.833333333333336px)
      }
    }
    @media (min-width: 1399px){
      article{
        margin-left: calc(8.333333333333334% - 45.833333333333336px)
      }
    }
    @media (min-width: 1900px){
      article{
        margin-left: calc(8.333333333333334% - 54.99999999999999px)
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
        margin-left: calc(-8.333333333333334% - 27.083333333333332px)
      }
    }
    @media (min-width: 740px){
      article{
        margin-left: calc(-8.333333333333334% - 37.916666666666664px)
      }
    }
    @media (min-width: 1024px){
      article{
        margin-left: calc(-8.333333333333334% - 54.166666666666664px)
      }
    }
    @media (min-width: 1399px){
      article{
        margin-left: calc(-8.333333333333334% - 54.166666666666664px)
      }
    }
    @media (min-width: 1900px){
      article{
        margin-left: calc(-8.333333333333334% - 65px)
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
        margin-left: calc(8.333333333333334% - 22.916666666666668px)
      }
    }
    
  `

  return run(input).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
