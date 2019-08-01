import extractBreakpointKeys from '../../src/util/extractBreakpointKeys'
import resolveConfig from '../../src/util/resolveConfig'
import defaultConfig from '../../stubs/defaultConfig.js'

const config = resolveConfig([defaultConfig])

it('returns correct for <sm', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '<sm')
  const expected = ['xs']
  expect(output).toEqual(expected)
})

it('returns correct for <=sm', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '<=sm')
  const expected = ['xs', 'sm']
  expect(output).toEqual(expected)
})

it('returns correct for >sm', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '>sm')
  const expected = ['md', 'lg', 'xl']
  expect(output).toEqual(expected)
})

it('returns correct for >=sm', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '>=sm')
  const expected = ['sm', 'md', 'lg', 'xl']
  expect(output).toEqual(expected)
})

it('returns correct for >lg', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '>lg')
  const expected = ['xl']
  expect(output).toEqual(expected)
})

it('returns correct for >=lg', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, '>=lg')
  const expected = ['lg', 'xl']
  expect(output).toEqual(expected)
})

it('returns only xs', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'xs')
  const expected = ['xs']
  expect(output).toEqual(expected)
})

it('returns only sm', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'sm')
  const expected = ['sm']
  expect(output).toEqual(expected)
})

it('returns only md', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'md')
  const expected = ['md']
  expect(output).toEqual(expected)
})

it('returns only lg', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'lg')
  const expected = ['lg']
  expect(output).toEqual(expected)
})

it('returns only xl', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'xl')
  const expected = ['xl']
  expect(output).toEqual(expected)
})

it('returns multiple breakpoints for slash separated list', () => {
  const output = extractBreakpointKeys(config.theme.breakpoints, 'xs/md/xl')
  const expected = ['xs', 'md', 'xl']
  expect(output).toEqual(expected)
})
