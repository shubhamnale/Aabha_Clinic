import express from 'express'
import Patient from '../models/Patient.js'
import { protect, authorize } from '../middleware/auth.js'
import { validateBody, validateObjectId } from '../middleware/validate.js'
import { patientBillingSchema, patientConsultSchema, patientCreateSchema } from '../validation/schemas.js'

const router = express.Router()

function escapeRegex(input = '') {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function todayStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getDateRange(filter) {
  const now = new Date(), start = new Date(), end = new Date()
  if (filter === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { $gte: start, $lte: end }
  } else if (filter === 'week')  { start.setDate(now.getDate() - 7) }
  else if   (filter === 'month') { start.setMonth(now.getMonth() - 1) }
  else if   (filter === 'year')  { start.setFullYear(now.getFullYear() - 1) }
  else                           { start.setHours(0, 0, 0, 0) }
  return { $gte: start, $lte: now }
}

function normalizeNameList(items = []) {
  return items
    .map(item => {
      if (typeof item === 'string') return { name: item.trim() }
      if (item && typeof item.name === 'string') return { name: item.name.trim() }
      return null
    })
    .filter(item => item && item.name)
}

// ── GET all patients ──────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { filter, search } = req.query
    if (filter && !['today', 'week', 'month', 'year'].includes(filter)) {
      return res.status(400).json({ success: false, message: 'Invalid filter.' })
    }
    const today = todayStart()
    let query = {}

    if (req.user.role === 'reception' || req.user.role === 'billing') {
      // Today only
      query.registrationTime = { $gte: today }

    } else if (req.user.role === 'doctor') {
      query.registrationTime = { $gte: today }

    } else {
      // Admin — use filter param
      // Admin path in patients.js
if (filter) query.registrationTime = getDateRange(filter)
    }

    // Search overlay
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim().slice(0, 60))
      const searchOr = { $or: [
        { name:      { $regex: safeSearch, $options: 'i' } },
        { patientId: { $regex: safeSearch, $options: 'i' } },
      ]}
      query = Object.keys(query).length
        ? { $and: [query, searchOr] }
        : searchOr
    }

    const patients = await Patient.find(query)
      .sort({ registrationTime: -1 })
      .lean()

    res.json({ success: true, data: patients })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST register patient ─────────────────────────────────────────────────────
router.post('/', protect, authorize('reception', 'admin'), validateBody(patientCreateSchema), async (req, res) => {
  try {
    const { name, age, gender, phone, address } = req.body
    const patient = await Patient.create({
      name, age, gender, phone, address,
      status: 'Registered',
      registrationTime: new Date(),
    })
    res.status(201).json({ success: true, data: patient })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// ── PUT consult complete ──────────────────────────────────────────────────────
router.put('/:id/consult', protect, authorize('doctor', 'admin'), validateObjectId('id'), validateBody(patientConsultSchema), async (req, res) => {
  try {
    const {
      name, diagnosis, consultationFee,
      medicines, dispensedMedicines, investigations
    } = req.body

    const update = {
      status:          'Doctor Completed',
    }
    if (name                !== undefined) update.name                 = name
    if (diagnosis           !== undefined) update.diagnosis            = diagnosis
    if (consultationFee     !== undefined) update.consultationFee      = parseFloat(consultationFee) || 0
    if (medicines           !== undefined) update.medicines            = normalizeNameList(medicines)
    if (dispensedMedicines  !== undefined) update.dispensedMedicines   = normalizeNameList(dispensedMedicines)
    if (investigations      !== undefined) update.investigations       = normalizeNameList(investigations)

    const patient = await Patient.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true }
    )

    res.json({ success: true, data: patient })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── PUT billing ───────────────────────────────────────────────────────────────
router.put('/:id/billing', protect, authorize('billing', 'admin'), validateObjectId('id'), validateBody(patientBillingSchema), async (req, res) => {
  try {
    const { paymentMethod, totalAmount } = req.body
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: 'Billed', paymentMethod, totalAmount, billingTime: new Date() },
      { new: true, runValidators: true }
    )
    res.json({ success: true, data: patient })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET single patient ────────────────────────────────────────────────────────
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .lean()
    if (!patient) return res.status(404).json({ success: false, message: 'Not found.' })
    res.json({ success: true, data: patient })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router