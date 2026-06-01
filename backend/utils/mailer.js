import nodemailer from 'nodemailer'

const doctorEmail = process.env.DOCTOR_EMAIL
let mailerInstance

export function getEmailSender() {
  const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER
  if (!sender) {
    throw new Error('Email sender is not configured. Set EMAIL_FROM or EMAIL_USER.')
  }

  return sender
}

export function getMailer() {
  if (mailerInstance) return mailerInstance

  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !port || !user || !pass) {
    throw new Error('Email transport is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.')
  }

  mailerInstance = nodemailer.createTransport({
    host,
    port,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass },
  })

  return mailerInstance
}

export async function sendAppointmentEmail({ patientName, phone, date, time, message }) {
  if (!doctorEmail) throw new Error('Doctor email not configured')

  const mailer = getMailer()
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7fcfe; padding: 32px; border-radius: 16px; max-width: 480px; margin: auto;">
      <h2 style="color: #1a8aa0;">New Appointment Booking</h2>
      <table style="width: 100%; font-size: 16px; margin-top: 18px;">
        <tr><td><strong>Patient Name:</strong></td><td>${patientName}</td></tr>
        <tr><td><strong>Phone Number:</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${date}</td></tr>
        <tr><td><strong>Time:</strong></td><td>${time}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message}</td></tr>
      </table>
      <p style="margin-top: 24px; color: #555;">Please check your dashboard for more details.</p>
    </div>
  `

  await mailer.sendMail({
    from: `Clinic Booking <${getEmailSender()}>`,
    to: doctorEmail,
    subject: 'New Appointment Booking',
    html,
  })
}
