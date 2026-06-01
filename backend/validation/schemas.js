import Joi from 'joi'

const namePattern = /^[A-Za-z\s]+$/

export const loginSchema = Joi.object({
  username: Joi.string().trim().lowercase().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
})

export const patientCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).pattern(namePattern).required(),
  age: Joi.number().integer().min(1).max(120).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').default('Male'),
  phone: Joi.string().trim().pattern(/^\d{10}$/).allow('').optional(),
  address: Joi.string().trim().max(200).allow('').optional(),
})

const nameItemSchema = Joi.alternatives().try(
  Joi.object({
    name: Joi.string().trim().max(120).required(),
  }),
  Joi.string().trim().max(120)
)

export const patientConsultSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).pattern(namePattern).optional(),
  diagnosis: Joi.string().trim().max(400).allow('').optional(),
  consultationFee: Joi.number().min(0).max(100000).optional(),
  medicines: Joi.array().items(nameItemSchema).optional(),
  dispensedMedicines: Joi.array().items(nameItemSchema).optional(),
  investigations: Joi.array().items(nameItemSchema).optional(),
})

export const patientBillingSchema = Joi.object({
  paymentMethod: Joi.string().valid('Online', 'Offline').required(),
  totalAmount: Joi.number().min(0).max(1000000).required(),
})

export const doctorCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  specialty: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().trim().pattern(/^\d{10}$/).allow('').optional(),
  email: Joi.string().trim().email().allow('').optional(),
})

export const doctorUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  specialty: Joi.string().trim().min(2).max(120).optional(),
  phone: Joi.string().trim().pattern(/^\d{10}$/).allow('').optional(),
  email: Joi.string().trim().email().allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1)

export const userCreateSchema = Joi.object({
  username: Joi.string().trim().lowercase().min(3).max(50).required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().trim().min(2).max(80).required(),
  role: Joi.string().valid('admin', 'reception', 'doctor', 'billing').required(),
  doctorRef: Joi.string().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
})

export const userUpdateSchema = Joi.object({
  username: Joi.string().trim().lowercase().min(3).max(50).optional(),
  name: Joi.string().trim().min(2).max(80).optional(),
  role: Joi.string().valid('admin', 'reception', 'doctor', 'billing').optional(),
  doctorRef: Joi.string().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
}).min(1)

export const userProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).optional(),
  currentPassword: Joi.string().min(6).max(128).optional(),
  newPassword: Joi.string().min(6).max(128).optional(),
}).and('currentPassword', 'newPassword')

export const appointmentCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).pattern(namePattern).required(),
  age: Joi.number().integer().min(1).max(120).required(),
  email: Joi.string().trim().email().allow('', null).optional(),
  phone: Joi.string().trim().pattern(/^\d{10}$/).required(),
  date: Joi.string().trim().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  time: Joi.string().trim().pattern(/^\d{2}:\d{2}$/).required(),
  symptoms: Joi.string().trim().min(2).max(500).required(),
})
