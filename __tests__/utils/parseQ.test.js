import parseQ from '../../src/util/parseQ'
import resolveConfig from '../../src/util/resolveConfig'
import defaultConfig from '../../stubs/defaultConfig.js'

const { theme: { breakpoints, breakpointCollections } } = resolveConfig([defaultConfig])

it('returns correct for <sm', () => {
  const output = parseQ({ breakpoints, breakpointCollections }, '<sm')
  const expected = [
    { max: '739px', min: '0' }
  ]
  expect(output).toEqual(expected)
})

it('returns correct for <sm/xl', () => {
  const output = parseQ({ breakpoints, breakpointCollections }, ['<sm', 'xl'])
  const expected = [
    { max: '739px', min: '0' },
    { min: '1900px' }
  ]
  expect(output).toEqual(expected)
})

it('returns correct for xs/>=md', () => {
  const output = parseQ({ breakpoints, breakpointCollections }, ['xs', '>=md'])
  const expected = [
    { max: '739px', min: '0' },
    { min: '1024px' }
  ]
  expect(output).toEqual(expected)
})

it('returns correct for xs/sm/xl', () => {
  const output = parseQ({ breakpoints, breakpointCollections }, ['xs', 'sm', 'xl'])
  const expected = [
    { max: '739px', min: '0' },
    { max: '1023px', min: '740px' },
    { min: '1900px' }
  ]
  expect(output).toEqual(expected)
})

it('returns correct for xs/sm/xl', () => {
  const output = parseQ({ breakpoints, breakpointCollections }, '$desktop')
  const expected = [
    { max: '1398px', min: '1024px' },
    { max: '1899px', min: '1399px' },
    { min: '1900px' }
  ]

  expect(output).toEqual(expected)
})
