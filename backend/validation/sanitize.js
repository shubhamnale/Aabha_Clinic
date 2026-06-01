export const sanitizeText = (value, maxLen = 200) => {
  if (value === undefined || value === null) return ''
  return String(value)
    .replace(/<[^>]*>/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLen)
}
