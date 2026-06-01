import mongoose from 'mongoose'

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const value = req.params?.[paramName]
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ success: false, message: 'Invalid id.' })
  }
  next()
}

export const validateBody = schema => (req, res, next) => {
  const { value, error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  })

  if (error) {
    const message = error.details?.[0]?.message || 'Invalid request.'
    return res.status(400).json({ success: false, message })
  }

  req.body = value
  next()
}
