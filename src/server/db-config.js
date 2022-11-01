import Config from './models/config'

let cache = null

export async function getConfig() {
  if (!cache) {
    const allConfig = await Config.fetchAll()
    cache = {}
    allConfig.each(conf => {
      cache[conf.get('name')] = conf.get('value')
    })
  }

  return cache
}

export function invalidCache() {
  cache = null
}
