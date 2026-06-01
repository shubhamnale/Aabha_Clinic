const DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'info')
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }

const shouldLog = level => LEVELS[level] <= (LEVELS[DEFAULT_LEVEL] ?? 2)

export const logInfo = (...args) => {
  if (shouldLog('info')) console.log(...args)
}

export const logWarn = (...args) => {
  if (shouldLog('warn')) console.warn(...args)
}

export const logError = (...args) => {
  if (shouldLog('error')) console.error(...args)
}
