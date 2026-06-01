import express from 'express'
import rateLimit from 'express-rate-limit'
import Appointment from '../models/Appointment.js'
import { getMailer, getEmailSender } from '../utils/mailer.js'
import { validateBody } from '../middleware/validate.js'
import { appointmentCreateSchema } from '../validation/schemas.js'
import { sanitizeText } from '../validation/sanitize.js'
import { logError } from '../utils/logger.js'

const router = express.Router()

const APPOINTMENT_RATE_LIMIT_WINDOW_MS = Number(process.env.APPOINTMENT_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000
const APPOINTMENT_RATE_LIMIT_MAX = Number(process.env.APPOINTMENT_RATE_LIMIT_MAX) || 12
const APPOINTMENT_DEDUPE_WINDOW_MS = Number(process.env.APPOINTMENT_DEDUPE_WINDOW_MS) || 2 * 60 * 1000
const APPOINTMENT_TO_EMAIL = process.env.APPOINTMENT_TO_EMAIL

const appointmentLimiter = rateLimit({
  windowMs: APPOINTMENT_RATE_LIMIT_WINDOW_MS,
  max: APPOINTMENT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'APPOINTMENT_RATE_LIMITED',
    message: 'Too many appointment requests. Please try again later.'
  }
})

const recentRequests = new Map()

const isValidEmail = value => /^(\S+)@(\S+)\.(\S+)$/.test(value)
const isValidName = value => /^[A-Za-z\s]+$/.test(value)
const isValidTime = value => /^\d{2}:\d{2}$/.test(value)

const normalizePhone = value => String(value || '').replace(/\D/g, '')
const buildKey = ({ phone, date }) => `${phone}|${date}`

router.post('/', appointmentLimiter, validateBody(appointmentCreateSchema), async (req, res) => {
  try {
    const name = sanitizeText(req.body.name, 80)
    const email = sanitizeText(req.body.email, 120)
    const age = Number(req.body.age)
    const phoneRaw = sanitizeText(req.body.phone, 30)
    const phone = normalizePhone(phoneRaw)
    const date = sanitizeText(req.body.date, 30)
    const time = sanitizeText(req.body.time, 30)
    const symptoms = sanitizeText(req.body.symptoms, 500)

    if (!APPOINTMENT_TO_EMAIL) {
      return res.status(500).json({
        success: false,
        message: 'Appointment email recipient is not configured.'
      })
    }

    if (!isValidName(name)) {
      return res.status(400).json({
        success: false,
        message: 'Name can contain only letters and spaces.'
      })
    }

    if (!Number.isFinite(age) || age <= 0 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid age.'
      })
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits.'
      })
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      })
    }

    if (!isValidTime(time)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid appointment time.'
      })
    }

    const appointmentDate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid appointment date.'
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past.'
      })
    }

    const dedupeKey = buildKey({ phone, date })
    const lastSeen = recentRequests.get(dedupeKey)
    const now = Date.now()

    if (lastSeen && now - lastSeen < APPOINTMENT_DEDUPE_WINDOW_MS) {
      return res.status(429).json({
        success: false,
        message: 'An appointment for this phone number and date was sent recently. Please wait a moment and try again.'
      })
    }

    if (recentRequests.size > 200) {
      for (const [key, timestamp] of recentRequests.entries()) {
        if (now - timestamp > APPOINTMENT_DEDUPE_WINDOW_MS) recentRequests.delete(key)
      }
    }

    const existingSameDay = await Appointment.findOne({ phone, date }).lean()

    if (existingSameDay) {
      return res.status(409).json({
        success: false,
        message: 'Only one appointment per phone number is allowed for the selected date.'
      })
    }

    recentRequests.set(dedupeKey, now)

    const appointment = await Appointment.create({
      name,
      age,
      email,
      phone,
      date,
      time,
      symptoms,
      emailStatus: 'pending',
    })

    const mailer = getMailer()
    const emailBody = [
      `Patient Name: ${name}`,
      `Age: ${age}`,
      `Email: ${email || 'N/A'}`,
      `Phone: ${phone}`,
      `Appointment Date: ${date}`,
      `Appointment Time: ${time}`,
      `Symptoms/Message: ${symptoms || 'N/A'}`,
    ].join('\n')

    try {
      await mailer.sendMail({
        from: `Aabha Clinic <${getEmailSender()}>`,
        to: APPOINTMENT_TO_EMAIL,
        subject: 'New Appointment Booking',
        text: emailBody,
      })

      appointment.emailStatus = 'sent'
      await appointment.save()
    } catch (mailErr) {
      logError('Appointment email failed:', mailErr?.message || mailErr)
      appointment.emailStatus = 'failed'
      await appointment.save()

      return res.status(500).json({
        success: false,
        message: 'Appointment saved, but email failed to send. Please try again later.'
      })
    }

    res.status(200).json({ success: true, message: 'Appointment request sent successfully.' })
  } catch (err) {
    logError('Appointment booking failed:', err?.message || err)
    res.status(500).json({ success: false, message: err.message || 'Failed to send appointment email.' })
  }
})

export default router
