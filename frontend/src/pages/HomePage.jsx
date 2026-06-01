import React, { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './HomePage.css'
import HeroImg from './images/hero.png'
import logo from './images/logo.png'
import Waitingwomen from './images/womens.png';
import doctorImg from './images/dc.png'
import womenImg from './images/women.png'
import { appointmentsAPI } from '../api'

const HOSPITAL_NAME = "Aabha Trusted Gynaecology Care"

const DOCTOR = {
  name: 'Dr. Prajakta Chhabra',
  degrees: 'M.B.B.S., DGO, C.I.M.P',
  title: 'Consultant Gynaecologist',
  specialty: 'Fertility Specialist',
  credential: 'Certified Indian Menopause Practitioner',
}

const SERVICES = [
  {
    title: 'Gynaecology',
    icon: '🩺',
    desc: 'Comprehensive care for women across every life stage with evidence-based protocols.',
  },
  {
    title: 'Fertility',
    icon: '👶',
    desc: 'Personalized fertility counseling, ovulation guidance, and conception support.',
  },
  {
    title: 'Menopause Care',
    icon: '🌸',
    desc: 'Holistic management of menopause symptoms with lifestyle and medical support.',
  },
]

const WHY = [
  { text: 'Women-focused care plans built on empathy and clarity.', icon: '🤝' },
  { text: 'Personalized attention with a calm, patient-first experience.', icon: '✨' },
  { text: 'Transparent treatment pathways and careful follow-ups.', icon: '🧭' },
  { text: 'Quick appointments with minimal waiting time.', icon: '⚡' },
]

const AWARENESS_ITEMS = [
  { title: 'Menopause', icon: '🌿' },
  { title: 'Pain During Intercourse', icon: '💢' },
  { title: 'Breast Lumps', icon: '🎗️' },
  { title: 'Irregular Periods', icon: '📅' },
  { title: 'Menstrual Abnormalities', icon: '🩸' },
  { title: 'Hormone Issues', icon: '🧬' },
  { title: 'Painful Urination', icon: '🚻' },
  { title: 'Pelvic Pain', icon: '⚡' },
]

const AWARENESS_IMAGE = womenImg

const CONTACT = {
  phone: '+91 7499636825',
  email: 'Aabha.gynaecology@gmail.com',
  address: 'Office No. 229, 2nd Floor, Mont Vert, KingsTown, Bhugaon Road, Pune - 412115',
}

const HERO_STATS = [
  { label: 'Years of Clinical Experience', value: '12+', icon: 'stethoscope' },
  { label: 'Patient Satisfaction', value: '98%', icon: 'star' },
  { label: 'Women-Centered Programs',value: '20+', icon: 'leaf' },
]

const HeroIcon = ({ name }) => {
  switch (name) {
    case 'stethoscope':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 3v4a4 4 0 0 0 8 0V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M10 11v2a6 6 0 1 0 12 0v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="19" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      )
    case 'star':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l2.6 5.2 5.7.8-4.1 4 1 5.7-5.2-2.8-5.2 2.8 1-5.7-4.1-4 5.7-.8L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )
    case 'leaf':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 14c7-9 14-9 16-9-1 7-5 14-13 15-2-2-3-4-3-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 14c3 0 6-1 9-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

const Icon = ({ name }) => {
  switch (name) {
    case 'heart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 21s-7-4.6-9.5-8.8C.5 8.3 2.8 5 6.4 5c2.2 0 3.6 1.1 4.6 2.3C12 6.1 13.4 5 15.6 5c3.6 0 5.9 3.3 3.9 7.2C19 16.4 12 21 12 21z" stroke="#1a8aa0" strokeWidth="1.4" />
        </svg>
      )
    case 'spark':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2z" stroke="#1a8aa0" strokeWidth="1.4" />
        </svg>
      )
    case 'shield':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3l7 3v6c0 5-3.6 8.5-7 9.5-3.4-1-7-4.5-7-9.5V6l7-3z" stroke="#1a8aa0" strokeWidth="1.4" />
        </svg>
      )
    case 'circle':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#1a8aa0" strokeWidth="1.4" />
        </svg>
      )
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#1a8aa0" strokeWidth="1.4" />
        </svg>
      )
  }
}

const HealthCard = ({ title, icon, style }) => (
  <div className="health-card" style={style}>
    <div className="health-icon" aria-hidden="true">{icon}</div>
    <h3>{title}</h3>
  </div>
)

export default function HomePage({ onLoginClick }) {
  const [open, setOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingMessage, setBookingMessage] = useState(null)
  const [bookingStatus, setBookingStatus] = useState('idle')
  const lastSubmitRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    date: '',
    time: '',
    symptoms: '',
  })

  const normalizePhone = value => String(value || '').replace(/\D/g, '')

  const getValidationError = (values) => {
    const name = values.name.trim()
    const ageValue = Number(values.age)
    const phoneDigits = normalizePhone(values.phone)
    const date = values.date
    const time = values.time
    const message = values.symptoms.trim()

    if (!name || !values.age || !phoneDigits || !date || !time || !message) {
      return 'Please fill in all required fields.'
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return 'Name can contain only letters and spaces.'
    }
    if (!Number.isFinite(ageValue) || ageValue <= 0 || ageValue > 120) {
      return 'Please provide a valid age.'
    }
    if (phoneDigits.length !== 10) {
      return 'Phone number must be exactly 10 digits.'
    }

    const selectedDate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      return 'Please provide a valid appointment date.'
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      return 'Appointment date cannot be in the past.'
    }

    return ''
  }

  const validationError = useMemo(() => getValidationError(formData), [formData])
  const isFormValid = useMemo(() => !validationError, [validationError])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAppointmentSubmit = async (event) => {
    event.preventDefault()
    if (isBooking) return

    const error = getValidationError(formData)
    if (error) {
      setBookingStatus('error')
      setBookingMessage(error)
      return
    }

    const phoneDigits = normalizePhone(formData.phone)
    const dedupeKey = `${phoneDigits}|${formData.date}|${formData.time}`
    const lastSubmit = lastSubmitRef.current
    const now = Date.now()
    if (lastSubmit && lastSubmit.key === dedupeKey && now - lastSubmit.at < 2 * 60 * 1000) {
      setBookingStatus('error')
      setBookingMessage('A similar appointment request was sent recently. Please wait a moment and try again.')
      return
    }

    setIsBooking(true)
    setBookingStatus('idle')
    setBookingMessage(null)

    try {
      const payload = {
        name: formData.name.trim(),
        age: Number(formData.age),
        phone: phoneDigits,
        date: formData.date,
        time: formData.time,
        symptoms: formData.symptoms.trim(),
      }

      const response = await appointmentsAPI.create(payload)
      lastSubmitRef.current = { key: dedupeKey, at: now }
      setBookingStatus('success')
      setBookingMessage(response?.data?.message || 'Appointment request sent successfully.')
      setFormData({ name: '', age: '', phone: '', date: '', time: '', symptoms: '' })
    } catch (err) {
      console.error('Appointment booking failed:', err)
      const message = err?.response?.data?.message || 'Unable to send appointment request. Please try again.'
      setBookingStatus('error')
      setBookingMessage(message)
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="aabha-home" id="home">
      <header className="home-nav">
        <div className="nav-inner">
          <a className="nav-brand" href="#home">
            <div className="brand-row">
              <img className="brand-logo" src={logo} alt="Aabha logo" />
              <div className="brand-text">
                <span>{HOSPITAL_NAME}</span>
                <span></span>
              </div>
            </div>
          </a>
          <button className="nav-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle navigation">
            <span style={{ fontSize: 18 }}>Menu</span>
          </button>
          <nav className={`nav-links${open ? ' open' : ''}`}>
            <a href="#home" onClick={() => setOpen(false)}>Home</a>
            <a href="#about" onClick={() => setOpen(false)}>About</a>
            <a href="#services" onClick={() => setOpen(false)}>Services</a>
            <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
            <button className="nav-login" onClick={onLoginClick}>Login</button>
          </nav>
        </div>
      </header>

      <motion.section
        className="premium-hero"
        aria-labelledby="hero-heading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="premium-hero__shape premium-hero__shape--one" aria-hidden="true" />
        <div className="premium-hero__shape premium-hero__shape--two" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-12 px-6 pt-12 pb-20 lg:flex-row lg:gap-16 lg:px-10">
          <motion.div
            className="flex w-full flex-col gap-5 lg:w-[45%]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e8f0fb] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#1a6fc4] shadow-sm">
              Expert Gynaecology & Women's Care
            </span>
            <h1 id="hero-heading" className="font-serif text-[2rem] leading-tight text-[#15233b] sm:text-[2.4rem] lg:text-[2.8rem]">
              Caring for every stage of womanhood
            </h1>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2f74c8]">
              {HOSPITAL_NAME}
            </p>
            <p className="text-base leading-relaxed text-[#15233b]/75">
              Personalized, respectful, and modern care for gynaecology, fertility, and menopause. Our clinic blends
              medical excellence with a calm, supportive experience for every patient.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                className="premium-btn premium-btn--primary"
                href="#appointment"
                aria-label="Book an appointment"
              >
                <span className="premium-btn__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                Book Appointment
              </a>
              <a
                className="premium-btn premium-btn--secondary"
                href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}
              >
                <span className="premium-btn__icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6.5 3.5c1.2 0 2.6 2.4 2.6 3.4 0 .7-.5 1.4-1.1 1.9l-.7.6c.8 1.6 2.2 3 3.8 3.8l.6-.7c.5-.6 1.2-1.1 1.9-1.1 1 0 3.4 1.4 3.4 2.6 0 1.7-1.9 3.4-3.4 3.4-4.1 0-10.4-6.3-10.4-10.4 0-1.5 1.7-3.4 3.4-3.4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                Call Now
              </a>
              <button className="premium-link" onClick={onLoginClick} type="button">
                Staff Login
              </button>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              {HERO_STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="premium-stat"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  <div className="premium-stat__icon" aria-hidden="true">
                    <HeroIcon name={stat.icon} />
                  </div>
                  <div>
                    <p className="premium-stat__value">{stat.value}</p>
                    <p className="premium-stat__label">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="w-full lg:w-[55%]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="premium-hero__image">
              <img
                src={HeroImg}
                alt="Female gynecologist consulting a patient in a modern clinic"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section className="home-section" id="about">
        <div className="grid-2">
          <div>
            <h2 className="section-title">About the Clinic</h2>
            <p className="section-subtitle">
              Dedicated to supporting women at every stage of life, our clinic provides compassionate, personalized
              healthcare in a comfortable and confidential environment. We focus on preventive care, accurate
              diagnosis, and evidence-based treatments to help women achieve optimal health and well-being.
            </p>
            <ul className="info-list">
              <li><Icon name="spark" /> Comprehensive gynecological care tailored to individual needs.</li>
              <li><Icon name="heart" /> Private, respectful consultations with a patient-first approach.</li>
              <li><Icon name="shield" /> Advanced diagnostics, preventive screenings, and wellness guidance.</li>
              <li><Icon name="circle" /> Trusted support for gynecology problems, fertility, and menopause care.</li>
            </ul>
          </div>
          <div className="info-card">
            <img
              src={Waitingwomen}
              alt="Doctor consultation with patient"
              style={{ width: '100%', height: 'auto', borderRadius: 16, marginBottom: 16 }}
            />
            <h3>Comprehensive Women's Healthcare</h3>
            <p>
              Combining advanced medical expertise with personalized attention, we offer a full spectrum of
              gynecological services to help women make informed health decisions with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section doctor-section" id="doctor">
        <div className="doctor-bg-leaf doctor-leaf-top" aria-hidden="true">
          <svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 8c22 28 34 62 34 96 0 46-16 78-34 88-18-10-34-42-34-88 0-34 12-68 34-96z" fill="#cfe6f6" />
            <path d="M60 24c12 22 18 50 18 78 0 32-8 56-18 64-10-8-18-32-18-64 0-28 6-56 18-78z" fill="#bcdcf1" />
          </svg>
        </div>
        <div className="doctor-bg-leaf doctor-leaf-bottom" aria-hidden="true">
          <svg viewBox="0 0 140 220" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 10c28 32 42 70 42 112 0 54-20 92-42 104-22-12-42-50-42-104 0-42 14-80 42-112z" fill="#f6d6c7" />
          </svg>
        </div>
        <div className="doctor-grid">
          <div className="doctor-content">
            <div className="doctor-badges">
              <span className="doctor-badge badge-blue">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="#1a6fc4" strokeWidth="1.8" />
                </svg>
                Gynaecology
              </span>
              <span className="doctor-badge badge-peach">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 4c4 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2-6 6-10z" stroke="#e5865c" strokeWidth="1.8" />
                </svg>
                Fertility
              </span>
              <span className="doctor-badge badge-teal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3c5 0 9 4 9 9 0 5-4 9-9 9s-9-4-9-9c0-5 4-9 9-9z" stroke="#1a8aa0" strokeWidth="1.8" />
                </svg>
                Menopause Care
              </span>
            </div>
            <h2 className="section-title">Doctor Information</h2>
            <h3 className="doctor-name">{DOCTOR.name}</h3>
            <p className="doctor-degrees">{DOCTOR.degrees}</p>
            <ul className="doctor-points">
              <li>{DOCTOR.title}</li>
              <li>{DOCTOR.specialty}</li>
              <li>{DOCTOR.credential}</li>
            </ul>
            <div className="doctor-actions">
              <a className="btn-primary" href="#appointment">
                <span className="btn-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                Book Appointment
              </a>
              <a className="btn-secondary" href={`tel:${CONTACT.phone.replace(/\s+/g, '')}`}>
                <span className="btn-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 3.5c1.2 0 2.6 2.4 2.6 3.4 0 .7-.5 1.4-1.1 1.9l-.7.6c.8 1.6 2.2 3 3.8 3.8l.6-.7c.5-.6 1.2-1.1 1.9-1.1 1 0 3.4 1.4 3.4 2.6 0 1.7-1.9 3.4-3.4 3.4-4.1 0-10.4-6.3-10.4-10.4 0-1.5 1.7-3.4 3.4-3.4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                </span>
                Call Now
              </a>
            </div>
          </div>
          <div className="doctor-media">
            <div className="doctor-blob" aria-hidden="true"></div>
            <img src={doctorImg} alt="Dr Prajakta Chhabra, gynaecologist and fertility specialist" />
          </div>
        </div>
      </section>

      <section className="home-section" id="services">
        <h2 className="section-title">Clinic Services</h2>
        <p className="section-subtitle">Focused services designed for holistic women's health.</p>
        <div className="services-grid">
          {SERVICES.map((service) => (
            <div className="service-card" key={service.title}>
              <div className="icon-bubble" aria-hidden="true">{service.icon}</div>
              <h4>{service.title}</h4>
              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" id="awareness">
        <div className="awareness-header">
          <h2 className="section-title">Listen to Your Body Signs</h2>
          <p className="section-subtitle">You Need a Gynae Check-Up Now!</p>
        </div>
        <div className="health-orbit" role="presentation">
          <div className="health-center">
            <img
              src={AWARENESS_IMAGE}
              alt="Woman feeling unwell, representing awareness of gynaecology symptoms"
              loading="lazy"
            />
          </div>
          {AWARENESS_ITEMS.map((item, index) => (
            <HealthCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              style={{ '--angle': `${index * 45}deg` }}
            />
          ))}
        </div>
      </section>

      <section className="home-section" id="why">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">Compassionate care with modern standards.</p>
        <div className="why-grid">
          {WHY.map((item) => (
            <div className="info-card" key={item.text}>
              <div className="icon-bubble" aria-hidden="true">{item.icon}</div>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section" id="appointment">
        <div className="appointment-card">
          <h2 className="section-title">Appointment Section</h2>
          <p className="section-subtitle">
            Request a visit and our team will confirm the best time for your consultation.
          </p>
          <form className="appointment-form" onSubmit={handleAppointmentSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              min="1"
              max="120"
              inputMode="numeric"
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
            <textarea
              name="symptoms"
              placeholder="Symptoms / Message"
              value={formData.symptoms}
              onChange={handleChange}
              required
            />
            <button className="btn-primary" type="submit" disabled={!isFormValid || isBooking}>
              {isBooking ? 'Sending Request...' : 'Request Appointment'}
            </button>
            {bookingMessage && (
              <div className={`appointment-alert ${bookingStatus === 'error' ? 'error' : 'success'}`}>
                {bookingMessage}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="home-section" id="contact">
        <h2 className="section-title">Contact Section</h2>
        <p className="section-subtitle">We are here to help and answer any questions.</p>
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Phone</h3>
            <p>{CONTACT.phone}</p>
          </div>
          <div className="contact-card">
            <h3>Email</h3>
            <p>{CONTACT.email}</p>
          </div>
          <div className="contact-card">
            <h3>Address</h3>
            <p>{CONTACT.address}</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <img src={logo} alt="Aabha Trusted Gynaecology Care logo" />
              <div>
                <h4>{HOSPITAL_NAME}</h4>
                <p>Compassionate care for women, backed by clinical excellence.</p>
              </div>
            </div>
          </div>
          <div>
            <h4>Visit Us</h4>
            <p>{CONTACT.address}</p>
            <p>{CONTACT.phone}</p>
          </div>
          <div>
            <h4>Clinic Hours</h4>
            <ul className="footer-hours">
              <li>
                <span>Monday - Saturday</span>
                <strong>10:00 AM - 8:00 PM</strong>
              </li>
              
              <li>
                <span>Sunday</span>
                <strong>Consultations by Appointment Only</strong>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
