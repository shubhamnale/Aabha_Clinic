import express  from 'express'
import http     from 'http'
import mongoose from 'mongoose'
import cors     from 'cors'
import dotenv   from 'dotenv'
import helmet   from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import os       from 'os'
import path     from 'path'
import fs       from 'fs'
import { fileURLToPath } from 'url'

import authRoutes    from './routes/auth.js'
import userRoutes    from './routes/users.js'
import doctorRoutes  from './routes/doctors.js'
import patientRoutes from './routes/patients.js'
import reportRoutes  from './routes/reports.js'
import appointmentRoutes from './routes/appointments.js'
import { logError, logInfo, logWarn } from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '.env') })

const isProd = process.env.NODE_ENV === 'production'
const emailEnabled = process.env.EMAIL_ENABLED !== 'false'
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET']
if (emailEnabled) {
  REQUIRED_ENV.push('EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'APPOINTMENT_TO_EMAIL')
}
const missingEnv   = REQUIRED_ENV.filter(k => !process.env[k])
if (missingEnv.length) {
  logError(`❌ Missing required environment variables: ${missingEnv.join(', ')}`)
  logError('   Create a .env file in /backend with required values.')
  process.exit(1)
}
const app        = express()
app.set('trust proxy', 1)
const frontendDistPath = path.join(__dirname, '../frontend/dist')

const parseAllowedOrigins = rawOrigins =>
  String(rawOrigins || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)

const defaultAllowedOrigins = isProd ? [] : [
  'http://localhost:3000',
  'https://www.aabha.in'
]

const allowedOrigins = Array.from(new Set([
  ...defaultAllowedOrigins,
  ...parseAllowedOrigins(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN)
]))

const shouldServeFrontend =
  process.env.SERVE_FRONTEND === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND !== 'false')

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 300
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 20
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || '1mb'
const URLENCODED_BODY_LIMIT = process.env.URLENCODED_BODY_LIMIT || '1mb'

const createCorsError = origin => {
  const err = new Error(`CORS blocked for origin: ${origin}`)
  err.status = 403
  err.code = 'CORS_ORIGIN_DENIED'
  return err
}

const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.'
  }
})

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'AUTH_RATE_LIMITED',
    message: 'Too many login attempts. Please try again later.'
  }
})

// HTTP-only deployment: no HTTPS redirects or HSTS headers.

app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' },
}))

const corsOptions = {
  origin: (origin, callback) => {
    const normalizedOrigin = String(origin || '').trim().replace(/\/+$/, '')

    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true)
    }
    return callback(createCorsError(normalizedOrigin || origin))
  },
  credentials: true
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json({ limit: JSON_BODY_LIMIT }))
app.use(express.urlencoded({ extended: true, limit: URLENCODED_BODY_LIMIT }))
app.use(mongoSanitize())
app.use(hpp())

app.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next()
  const origin = String(req.headers.origin || '').trim().replace(/\/+$/, '')
  if (!origin) return next()
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return next()
  return res.status(403).json({ success: false, message: 'Origin not allowed.' })
})

app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)

app.use('/api/auth',     authRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/doctors',  doctorRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/reports',  reportRoutes)
app.use('/api/appointments', appointmentRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aabha CMS API running', timestamp: new Date() })
})

if (process.env.NODE_ENV === 'production') {
  if (shouldServeFrontend && fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next()
      return res.sendFile(path.join(frontendDistPath, 'index.html'))
    })
  } else if (shouldServeFrontend) {
    logWarn('⚠️  SERVE_FRONTEND is enabled but ../frontend/dist was not found.')
  }
}

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

app.use((err, req, res, next) => {
  if (err?.code === 'CORS_ORIGIN_DENIED') {
    return res.status(err.status || 403).json({
      success: false,
      code: err.code,
      message: err.message,
    })
  }

  logError(err.stack || err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' })
})

const PORT = Number(process.env.PORT) || 5000
const HOST = '0.0.0.0'

const getLanUrls = port => {
  const urls = []
  const nets = os.networkInterfaces()

  for (const entries of Object.values(nets)) {
    for (const net of entries || []) {
      if (net.family !== 'IPv4' || net.internal) continue
      if (net.address.startsWith('169.254.')) continue
      urls.push(`http://${net.address}:${port}`)
    }
  }

  return Array.from(new Set(urls))
}

const isHmsServerAlreadyRunning = async port => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1200)
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return false

    const body = await res.json().catch(() => null)
    return body?.status === 'OK' && String(body?.message || '').includes('Aabha CMS API')
  } catch {
    return false
  }
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logInfo('✅ MongoDB connected')
    const server = http.createServer(app)

    server.on('error', err => {
      if (err?.code !== 'EADDRINUSE') {
        logError(`❌ Server failed: ${err.message}`)
        process.exit(1)
      }

      ;(async () => {
        if (await isHmsServerAlreadyRunning(PORT)) {
          logInfo(`ℹ️  Backend is already running at http://localhost:${PORT}`)
          process.exit(0)
        }

        logError(`❌ Port ${PORT} is already in use by another process.`)
        process.exit(1)
      })()
    })

    server.listen(PORT, HOST, () => {
      logInfo(`🚀 Server → http://localhost:${PORT}`)
      const lanUrls = getLanUrls(PORT)
      if (lanUrls.length > 0) {
        logInfo('🌐 Network URLs:')
        lanUrls.forEach(url => logInfo(`   ${url}`))
      }
    })
  })
  .catch(err => { logError('❌ MongoDB failed:', err.message); process.exit(1) })
