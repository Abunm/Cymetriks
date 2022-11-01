export function km() {
  return this * (360 / 40075)
}

export function m() {
  return this::km() / 1000
}
