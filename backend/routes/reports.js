import express from 'express'
import Patient from '../models/Patient.js'
import Doctor  from '../models/Doctor.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

function getDateRange(filter) {
  const now = new Date(), start = new Date()
  if      (filter === 'today') { start.setHours(0,0,0,0) }
  else if (filter === 'week')  { start.setDate(now.getDate() - 7) }
  else if (filter === 'month') { start.setMonth(now.getMonth() - 1) }
  else if (filter === 'year')  { start.setFullYear(now.getFullYear() - 1) }
  else                         { start.setHours(0,0,0,0) }
  return { $gte: start, $lte: now }
}

router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    const todayRange = { $gte: todayStart, $lte: todayEnd }

    const [todayPatients, waitingCount, billedCount, revenueResult] = await Promise.all([
      Patient.countDocuments({ registrationTime: todayRange }),

      // Waiting = today's patients waiting to see a doctor
      Patient.countDocuments({
        registrationTime: todayRange,
        status: 'Registered'
      }),
      Patient.countDocuments({ status: 'Billed', billingTime: todayRange }),

      Patient.aggregate([
        { $match: { status: 'Billed', billingTime: todayRange } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ])

    res.json({ success: true, data: {
      todayPatients,
      waitingCount,
      billedCount,
      todayRevenue: revenueResult[0]?.total || 0,
    }})
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/timing', protect, authorize('admin'), async (req, res) => {
  try {
    const { filter = 'today' } = req.query
    const patients = await Patient.find({ registrationTime: getDateRange(filter) })
      .select('patientId name status registrationTime billingTime paymentMethod totalAmount')
      .sort({ registrationTime: -1 })
      .lean()
    const data = patients.map(p => ({
      patientId:        p.patientId,
      name:             p.name,
      status:           p.status,
      registrationTime: p.registrationTime,
      billingTime:      p.billingTime,
      paymentMethod:    p.paymentMethod,
      totalAmount:      p.totalAmount,
    }))
    res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

router.get('/doctor-performance', protect, authorize('admin'), async (req, res) => {
  try {
    const totals = await Patient.aggregate([
      { $match: { status: 'Billed' } },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
        },
      },
    ])

    const activeDoctors = await Doctor.find({ isActive: true }).select('name specialty').lean()
    const totalStats = totals[0] || { totalPatients: 0, revenue: 0 }

    const data = activeDoctors.map((doc, index) => {
      if (activeDoctors.length === 1) {
        return {
          doctor: doc.name,
          specialty: doc.specialty,
          totalPatients: totalStats.totalPatients,
          revenue: totalStats.revenue,
          avgConsultMin: 0,
        }
      }
      return {
        doctor: doc.name,
        specialty: doc.specialty,
        totalPatients: 0,
        revenue: 0,
        avgConsultMin: 0,
      }
    })

    return res.json({ success: true, data })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// Daily Patient Report — grouped by doctor
router.get('/daily-patient-report', protect, authorize('admin'), async (req, res) => {
  try {
    const { date } = req.query  // expected: YYYY-MM-DD

    let dayStart, dayEnd
    if (date) {
      dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
    } else {
      dayStart = new Date()
      dayStart.setHours(0, 0, 0, 0)
      dayEnd = new Date()
      dayEnd.setHours(23, 59, 59, 999)
    }

    const patients = await Patient.find({
      registrationTime: { $gte: dayStart, $lte: dayEnd },
    })
      .select('name phone registrationTime totalAmount status')
      .sort({ registrationTime: 1 })
      .lean()

    const activeDoctor = await Doctor.findOne({ isActive: true }).select('name').lean()
    const doctorName = activeDoctor?.name || 'Clinic'
    const groups = [{
      doctor: doctorName,
      patients: patients.map(p => ({
        name:             p.name,
        phone:            p.phone || '—',
        registrationTime: p.registrationTime,
        totalAmount:      p.totalAmount || 0,
        status:           p.status,
      })),
    }]
    const totalPatients  = patients.length
    const totalCollection = patients.reduce((s, p) => s + (p.totalAmount || 0), 0)

    res.json({ success: true, data: { date: dayStart, groups, totalPatients, totalCollection } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router