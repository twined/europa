const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('parses @if when true', () => {
  const cfg = {
    theme: {
      typography: {
        optimizeLegibility: true
      }
    }
  }

  const input = `
    article {
      @if theme.typography.optimizeLegibility {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
  `

  const output = `
    article {
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @if when false', () => {
  const cfg = {
    theme: {
      typography: {
        optimizeLegibility: false
      }
    }
  }

  const input = `
    article {
      @if theme.typography.optimizeLegibility {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
  `

  const output = `
    article {
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @if from root level when true', () => {
  const cfg = {
    theme: {
      typography: {
        optimizeLegibility: true
      }
    }
  }

  const input = `
    @if theme.typography.optimizeLegibility {
      article {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
  `

  const output = `
    article {
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})

it('parses @if from root level when false', () => {
  const cfg = {
    theme: {
      typography: {
        optimizeLegibility: false
      }
    }
  }

  const input = `
    @if theme.typography.optimizeLegibility {
      article {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    }
  `

  const output = ``

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
