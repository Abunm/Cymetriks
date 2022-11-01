import fetch from 'isomorphic-fetch'

export const resolveAddress = async (address, opts) => {
  const baseUrl = '//nominatim.openstreetmap.org/search'
  let url = baseUrl + `?q=${encodeURIComponent(address)}`

  url += '&format=json'

  if (opts && opts.country) {
    url += `&country=${opts.country}`
  }

  const res = await fetch(url)

  return await res.json()
}
