import React, { useState } from 'react'
import { patientsAPI } from '../api'
import { Modal, Alert, BtnSpinner, Btn } from './UI'
import { theme } from '../theme'
import './billmodal.css'

export default function BillModal({ patient, mode = 'billing', onClose, onSave }) {
  const [paymentMethod, setPaymentMethod] = useState(patient.paymentMethod || '')
  const [loading,       setLoading]       = useState(false)
  const [printing,      setPrinting]      = useState(false)
  const [error,         setError]         = useState('')

  const alreadyBilled  = patient.status === 'Billed'
  const consultFee     = Number(patient.consultationFee) || 0
  const grandTotal     = consultFee
  const dispensed      = patient.dispensedMedicines || []
  const investigations = patient.investigations     || []

  /* ── Billing ─────────────────────────────────────────────── */
  const handleBill = async () => {
    if (!paymentMethod) return setError('Please select payment method.')
    setLoading(true); setError('')
    try {
      const { data } = await patientsAPI.billing(patient._id, { paymentMethod, totalAmount: grandTotal })
      onSave(data.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Billing failed.')
      setLoading(false)
    }
  }

  /* ── Print ───────────────────────────────────────────────────
     FIX: Do NOT toggle display on #billprint before calling
     window.print(). The CSS @media print rule already handles
     showing/hiding — manually setting display:block then back
     to display:none races against the print renderer on mobile
     Chrome/Safari and produces a blank page.
  ─────────────────────────────────────────────────────────── */
  const handlePrint = () => {
    if (printing) return
    setPrinting(true)

    const pw = window.open('', '_blank', 'width=900,height=1100')
    if (!pw) {
      setError('Unable to open print window. Please allow popups and try again.')
      setPrinting(false)
      return
    }

    const logoUrl = `${window.location.origin}/src/pages/images/logo.png`
    const medsHtml = dispensed.length > 0
      ? dispensed.map(med => `<div class="med-item">${med.name || med}</div>`).join('')
      : '<div class="med-empty">No medicines prescribed</div>'
    const printDateTime = new Date(patient.registrationTime || patient.visitDate).toLocaleString('en-IN')

    pw.document.open()
    pw.document.write(`
      <html>
      <head>
        <title>Prescription - ${patient.patientId}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          html, body { height: 100%; }
          body { font-family: "Helvetica Neue", Arial, sans-serif; color: #111; margin: 0; font-size: 11.5px; line-height: 1.45; }
          .sheet { width: 100%; min-height: 100%; display: flex; flex-direction: column; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #111; padding-bottom: 8px; }
          .brand { display: flex; gap: 10px; align-items: center; }
          .logo { width: 44px; height: 44px; object-fit: contain; }
          .clinic-name { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.2px; }
          .tagline { margin: 2px 0 0; font-size: 10px; letter-spacing: 0.3px; text-transform: uppercase; }
          .doctor { text-align: right; font-size: 10px; line-height: 1.35; }
          .doctor strong { font-size: 11px; display: block; margin-bottom: 2px; }
          .meta { display: flex; justify-content: space-between; gap: 12px; margin: 10px 0 6px; font-size: 11px; }
          .meta .label { font-weight: 700; min-width: 90px; display: inline-block; }
          .section-title { margin: 12px 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
          .med-list { border-top: 1px solid #ddd; padding-top: 6px; }
          .med-item { padding: 4px 0; border-bottom: 1px dashed #ddd; }
          .med-empty { padding: 6px 0; color: #555; font-style: italic; }
          .rx-footer { margin-top: auto; border-top: 1px solid #111; padding-top: 8px; font-size: 10px; display: grid; gap: 4px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="brand">
              <img class="logo" src="${logoUrl}" alt="Aabha Trusted Gynaecology Care logo" />
              <div>
                <h2 class="clinic-name">Aabha Trusted Gynaecology Care</h2>
                <div class="tagline">Gynaecology • Fertility • Menopause</div>
              </div>
            </div>
          </div>

          <div class="section-title">Prescribed Medicines</div>
          <div class="med-list">${medsHtml}</div>

          <div class="rx-footer">
            <div>📞 +91 9765813448</div>
            <div>✉️ aabha.gynaecology@gmail.com</div>
            <div>📍 Office No. 229, 2nd Floor, Mont Vert, Bhugaon Road, Pune - 412115</div>
          </div>
        </div>
      </body>
      </html>
    `)
    pw.document.close()

    pw.onload = () => {
      pw.focus()
      pw.print()
      setPrinting(false)
    }
  }

  /* ── Inline summary row ──────────────────────────────────── */
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: theme.muted }}>{label}</span>
      <span>{value}</span>
    </div>
  )

  return (
    <Modal title={mode === 'print' ? 'Print Bill' : 'Collect Payment'} onClose={onClose} width={520}>
      <Alert type="err" msg={error} />

      {/* ── PRINT-ONLY INVOICE (hidden on screen via CSS) ─── */}
      <div id="billprint">

        {/* Header */}
        <div id="billprint-header">
          <div className="billprint-brand">
            <img src="/src/pages/logo.png" alt="Aabha Trusted Gynaecology Care logo" />
            <div>
              <h3>Aabha Trusted Gynaecology Care</h3>
              <p>Gynaecology • Fertility • Menopause</p>
            </div>
          </div>
        </div>

        {/* Patient details */}
        <div id="billprint-meta">
          <div>
            <span className="billprint-meta-label">Patient Name:</span>
            <span className="billprint-meta-value">{patient.name}</span>
          </div>
          <div>
            <span className="billprint-meta-label">Date &amp; Time:</span>
            <span className="billprint-meta-value">
              {new Date(patient.registrationTime || patient.visitDate).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Prescribed Medicines */}
        <div id="billprint-medicines">
          <div id="billprint-medicines-title">Prescribed Medicines</div>
          {dispensed.length > 0 ? (
            dispensed.map((med, i) => (
              <div key={i} className="billprint-medicine-item">{med.name || med}</div>
            ))
          ) : (
            <div className="billprint-medicine-empty">No medicines prescribed</div>
          )}
        </div>
      </div>

      {/* ── WEB UI: bill summary ──────────────────────────── */}
      <div className="billmodal-summary" style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <Row label="Patient"   value={`${patient.name} (${patient.patientId})`} />
        <Row label="Diagnosis" value={patient.diagnosis || '—'} />
        {investigations.length > 0 && (
          <Row label="Investigations / Tests" value={investigations.map(i => i.name || i).join(', ')} />
        )}
        <div style={{ height: 1, background: theme.border, margin: '12px 0' }} />
        <Row label="Consultation Fee" value={`₹${consultFee}`} />
        <div style={{ height: 1, background: theme.border, margin: '12px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: theme.primary }}>Total</span>
          <span style={{ color: theme.success }}>₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>


      {/* Payment method selector */}
      {mode === 'billing' && !alreadyBilled && (
        <div className="billmodal-payment" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: theme.muted, textTransform: 'uppercase', marginBottom: 10 }}>
            Payment Method
          </p>
          <div className="billmodal-payment-grid" style={{ display: 'flex', gap: 12 }}>
            {['Online', 'Offline'].map(m => (
              <div key={m} onClick={() => setPaymentMethod(m)} style={{
                flex: 1, padding: '14px 20px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${paymentMethod === m ? theme.accent : theme.border}`,
                background: paymentMethod === m ? '#E3F2FD' : '#FAFAFA',
                fontWeight: 600, fontSize: 14,
              }}>
                {m === 'Online' ? '📱 Online' : '💵 Offline'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already billed banner */}
      {alreadyBilled && (
        <div style={{ background: '#E8F5E9', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1B5E20', fontWeight: 600 }}>
          ✅ Payment collected via {patient.paymentMethod}
        </div>
      )}

      {/* Footer buttons */}
      <div className="billmodal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn outline onClick={onClose}>Close</Btn>
        <Btn outline onClick={handlePrint} disabled={printing}>{printing ? 'Printing…' : '🖨 Print Bill'}</Btn>
        {mode === 'billing' && !alreadyBilled && (
          <Btn color={theme.success} onClick={handleBill} disabled={loading}>
            {loading && <BtnSpinner />} ✓ Confirm Payment
          </Btn>
        )}
      </div>
    </Modal>
  )
}