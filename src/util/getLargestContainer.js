export default function getLargestContainer (config) {
  const containerBps = config.theme.container.maxWidth
  const lastKey = [...Object.keys(containerBps)].pop()
  return containerBps[lastKey]
}