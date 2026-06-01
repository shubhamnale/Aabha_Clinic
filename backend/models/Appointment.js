import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120,
  },
  email: {
    type: String,
    trim: true,
    maxlength: 120,
    default: '',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
  },
  date: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  time: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  symptoms: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  emailStatus: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
}, { timestamps: true })

appointmentSchema.index({ createdAt: -1 })
appointmentSchema.index({ phone: 1, date: 1, time: 1 })

export default mongoose.model('Appointment', appointmentSchema)
