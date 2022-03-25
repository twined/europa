export default function isLargestBreakpoint (config, breakpoint) {
  const containerBps = config.theme.container.maxWidth
  const lastKey = [...Object.keys(containerBps)].pop()
  return (breakpoint === lastKey)
}