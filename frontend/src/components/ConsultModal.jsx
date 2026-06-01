import React, { useState } from 'react'
import { patientsAPI } from '../api'
import { Modal, Field, Alert, BtnSpinner, Btn, inputStyle } from './UI'
import { theme } from '../theme'

// ── ConsultModal ──────────────────────────────────────────────────────────────
export default function ConsultModal({ patient: init, onClose, onSave }) {
  const [patientName,       setPatientName]       = useState(init.name)
  const [diagnosis,         setDiagnosis]         = useState(init.diagnosis || '')
  const [consultationFee,   setConsultationFee]   = useState(init.consultationFee ?? 0)
  const [dispensedMeds,     setDispensedMeds]     = useState(init.dispensedMedicines?.map(m => m.name || m).join('\n') || '')
  const [investigations,    setInvestigations]    = useState(init.investigations?.map(i => i.name || i).join('\n') || '')

  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')

  const handleSave = async () => {
    setLoading(true); setError('')
    try {
      const parseLines = text =>
        text.split('\n')
         .map(s => s.trim())
         .filter(Boolean)
         .map(name => ({ name }))

      const { data } = await patientsAPI.consult(init._id, {
        name: patientName,
        diagnosis,
        consultationFee: parseFloat(consultationFee) || 0,
        dispensedMedicines: parseLines(dispensedMeds),
        investigations: parseLines(investigations),
      })

      onSave(data.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save.')
      setLoading(false)
    }
  }

  return (
    <Modal title="Consultation" onClose={onClose} width={680}>
      <Alert type="err" msg={error} />


      <Field label="Patient Name">
        <input style={inputStyle} value={patientName} onChange={e => setPatientName(e.target.value)} />
      </Field>

      <Field label="Diagnosis">
        <textarea style={{ ...inputStyle, resize:'vertical' }} rows={3} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter diagnosis…" />
      </Field>

      <Field label="Consultation Fee (₹)">
        <input style={{ ...inputStyle, maxWidth:200 }} type="number" min="0" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} placeholder="Enter fee" />
      </Field>

      <Field label="Medicines Prescribed (one per line)">
        <textarea style={{ ...inputStyle, resize:'vertical', fontFamily:'monospace', fontSize:15 }} rows={3}
          value={dispensedMeds} onChange={e => setDispensedMeds(e.target.value)}
          placeholder={'Tab. Paracetamol 500mg'} />
      </Field>

      <Field label="Investigations / Tests (one per line)">
        <textarea style={{ ...inputStyle, resize:'vertical', fontFamily:'monospace', fontSize:15 }} rows={4}
          value={investigations} onChange={e => setInvestigations(e.target.value)}
          placeholder={'Ultrasound\nBlood Test - Complete Blood Count'} />
      </Field>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn color={theme.success} onClick={handleSave} disabled={loading}>
          {loading && <BtnSpinner />} ✓ Complete Consultation
        </Btn>
      </div>
    </Modal>
  )
}