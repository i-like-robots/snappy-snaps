export function escapeBacktickString(value) {
  return value.replace(/`|\\|\${/g, '\\$&')
}
