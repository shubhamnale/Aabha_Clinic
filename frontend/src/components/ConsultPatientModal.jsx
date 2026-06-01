import React, { useMemo, useState } from 'react'
import { patientsAPI } from '../api'
import { Modal, Field, Alert, BtnSpinner, Btn } from './UI'

function toList(value) {
  return String(value || '')
    .split(/[\n,]/)
    .map(item => item.trim())
    .filter(Boolean)
}

export default function ConsultPatientModal({ patient, onClose, onSave }) {
  const initial = useMemo(() => ({
    name: patient?.name || '',
    diagnosis: patient?.diagnosis || '',
    consultationFee: patient?.consultationFee ?? '',
    medicines: Array.isArray(patient?.medicines) ? patient.medicines.join('\n') : '',
    dispensedMedicines: Array.isArray(patient?.dispensedMedicines) ? patient.dispensedMedicines.map(m => m.name || m).join('\n') : '',
    investigations: Array.isArray(patient?.investigations) ? patient.investigations.map(i => i.name || i).join('\n') : '',
  }), [patient])

  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        diagnosis: form.diagnosis.trim(),
        consultationFee: form.consultationFee === '' ? undefined : Number(form.consultationFee),
        medicines: toList(form.medicines),
        dispensedMedicines: toList(form.dispensedMedicines),
        investigations: toList(form.investigations),
      }

      const { data } = await patientsAPI.consult(patient._id, payload)
      onSave(data.data)
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update patient.')
      setLoading(false)
    }
  }

  return (
    <Modal title="Consult Patient" onClose={onClose} width={680}>
      <Alert type="err" msg={error} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <Field label="Patient Name">
          <input value={form.name} onChange={handleChange} name="name" />
        </Field>
        <Field label="Consultation Fee">
          <input value={form.consultationFee} onChange={handleChange} name="consultationFee" inputMode="decimal" />
        </Field>
        <Field label="Diagnosis" style={{ gridColumn: 'span 2' }}>
          <textarea value={form.diagnosis} onChange={handleChange} name="diagnosis" rows={3} />
        </Field>
        <Field label="Medicines" style={{ gridColumn: 'span 2' }}>
          <textarea value={form.medicines} onChange={handleChange} name="medicines" rows={3} placeholder="One per line or comma-separated" />
        </Field>
        <Field label="Dispensed Medicines" style={{ gridColumn: 'span 2' }}>
          <textarea value={form.dispensedMedicines} onChange={handleChange} name="dispensedMedicines" rows={3} placeholder="One per line or comma-separated" />
        </Field>
        <Field label="Investigations" style={{ gridColumn: 'span 2' }}>
          <textarea value={form.investigations} onChange={handleChange} name="investigations" rows={3} placeholder="One per line or comma-separated" />
        </Field>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <Btn outline onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSubmit} disabled={loading}>
          {loading && <BtnSpinner />} Save Consult
        </Btn>
      </div>
    </Modal>
  )
}