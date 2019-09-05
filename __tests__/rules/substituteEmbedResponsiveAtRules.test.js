const postcss = require('postcss')
const plugin = require('../../src')

function run (input, opts) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('parses @embed-responsive', () => {
  const input = `
    article {
      background-color: green;
      @embed-responsive 16/9;
    }
  `

  const output = `
    article {
      background-color: green;
      position: relative;
      width: 100%;
    }
    article::before {
      display: block;
      content: "";
    }
    article iframe,
      article embed,
      article object,
      article video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    article::before {
      padding-top: 56.25%;
    }
  `

  return run(input).then(result => {
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

  const output = ''

  return run(input, cfg).then(result => {
    expect(result.css).toMatchCSS(output)
    expect(result.warnings().length).toBe(0)
  })
})
