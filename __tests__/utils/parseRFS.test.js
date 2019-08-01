import parseRFS from '../../src/util/parseRFS'

it('returns standard 2xs size, since min is the same', () => {
  const cfg = {
    breakpoints: {
      xs: '0',
      sm: '740px'
    },
    typography: {
      rfs: {
        minimum: {
          '2xs': {
            xs: '10px'
          }
        }
      },
      sizes: {
        '2xs': {
          xs: '10px'
        }
      }
    }
  }

  const output = parseRFS(null, cfg, '2xs', 'xs')
  const expected = '10px'
  expect(output).toEqual(expected)
})

it('calcs for min/max with bp min xs', () => {
  const cfg = {
    breakpoints: {
      xs: '0',
      sm: '740px'
    },
    typography: {
      rfs: {
        minimum: {
          '2xs': {
            xs: '10px'
          }
        }
      },
      sizes: {
        '2xs': {
          xs: '15px'
        }
      }
    }
  }

  const output = parseRFS(null, cfg, '2xs', 'xs')
  const expected = 'calc(10px + 5 * ((100vw - 320px) / 739))'
  expect(output).toEqual(expected)
})

it('calcs for min/max with bp min sm', () => {
  const cfg = {
    breakpoints: {
      xs: '0',
      sm: '740px',
      md: '1049px'
    },
    typography: {
      rfs: {
        minimum: {
          '2xs': {
            sm: '10px'
          }
        }
      },
      sizes: {
        '2xs': {
          sm: '15px'
        }
      }
    }
  }

  const output = parseRFS(null, cfg, '2xs', 'sm')
  const expected = 'calc(10px + 5 * ((100vw - 740px) / 308))'
  expect(output).toEqual(expected)
})
