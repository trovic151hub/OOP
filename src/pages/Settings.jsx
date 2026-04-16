import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Building2, Clock, Save, Globe, Phone, Mail, CheckCircle, Database, Loader2 } from 'lucide-react'
import NairaIcon from '../components/ui/NairaIcon'
import { useStore, store } from '../store/useStore'
import { useToast } from '../context/ToastContext'
import { seedDatabase } from '../utils/seedData'

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Africa/Nairobi', 'Africa/Lagos']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR', 'NGN', 'KES', 'GHS', 'ZAR', 'CAD', 'AUD', 'SGD', 'JPY']

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
          <Icon size={16} className="text-teal-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, children, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

export default function Settings() {
  const { settings } = useStore()
  const showToast = useToast()
  const [form, setForm]       = useState({ ...settings })
  const [saved, setSaved]     = useState(false)
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    if (!window.confirm('This will REPLACE all existing demo data (patients, doctors, appointments, billing, inventory, prescriptions, shifts, claims and more) with the full updated dataset.\n\nContinue?')) return
    setSeeding(true)
    await seedDatabase(showToast)
    setSeeding(false)
  }

  useEffect(() => { setForm({ ...settings }) }, [settings])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    if (!form.hospitalName?.trim()) { showToast('Hospital name is required.', 'error'); return }
    try {
      await store.updateSettings(form)
      setSaved(true)
      showToast('Settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      showToast('Failed to save settings.', 'error')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Hospital Settings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Configure your hospital's information and preferences</p>
        </div>
        <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
          {saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <Section title="Hospital Information" icon={Building2}>
          <Field label="Hospital Name" required full>
            <input className="input-field" placeholder="e.g. MedCore General Hospital" value={form.hospitalName || ''} onChange={set('hospitalName')} />
          </Field>
          <Field label="Tagline / Motto">
            <input className="input-field" placeholder="e.g. Excellence in Healthcare" value={form.tagline || ''} onChange={set('tagline')} />
          </Field>
          <Field label="Registration / License No.">
            <input className="input-field" placeholder="e.g. MED-2024-001" value={form.licenseNumber || ''} onChange={set('licenseNumber')} />
          </Field>
          <Field label="Physical Address" full>
            <input className="input-field" placeholder="Street, City, State, Country" value={form.address || ''} onChange={set('address')} />
          </Field>
          <Field label="Logo URL">
            <input className="input-field" placeholder="https://example.com/logo.png" value={form.logo || ''} onChange={set('logo')} />
          </Field>
          {form.logo && (
            <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img src={form.logo} alt="Logo preview" className="w-12 h-12 object-contain rounded-lg border border-slate-200" onError={e => e.target.style.display = 'none'} />
              <p className="text-xs text-slate-500">Logo preview</p>
            </div>
          )}
        </Section>

        <Section title="Contact Information" icon={Phone}>
          <Field label="Phone Number">
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" placeholder="+1 (555) 000-0000" value={form.phone || ''} onChange={set('phone')} />
            </div>
          </Field>
          <Field label="Email Address">
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" placeholder="info@hospital.com" type="email" value={form.email || ''} onChange={set('email')} />
            </div>
          </Field>
          <Field label="Website">
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" placeholder="https://www.hospital.com" value={form.website || ''} onChange={set('website')} />
            </div>
          </Field>
          <Field label="Emergency Contact">
            <div className="relative">
              <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input-field pl-9" placeholder="+1 (555) 911-0000" value={form.emergencyPhone || ''} onChange={set('emergencyPhone')} />
            </div>
          </Field>
        </Section>

        <Section title="Operations" icon={Clock}>
          <Field label="Working Hours Start">
            <input className="input-field" type="time" value={form.workingHoursStart || '08:00'} onChange={set('workingHoursStart')} />
          </Field>
          <Field label="Working Hours End">
            <input className="input-field" type="time" value={form.workingHoursEnd || '18:00'} onChange={set('workingHoursEnd')} />
          </Field>
          <Field label="Default Appointment Duration">
            <select className="input-field" value={form.appointmentDuration || '30'} onChange={set('appointmentDuration')}>
              {[15, 20, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} minutes</option>)}
            </select>
          </Field>
          <Field label="Timezone">
            <select className="input-field" value={form.timezone || 'UTC'} onChange={set('timezone')}>
              {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
            </select>
          </Field>
          <Field label="Max Patients Per Day">
            <input className="input-field" type="number" min="1" placeholder="e.g. 100" value={form.maxPatientsPerDay || ''} onChange={set('maxPatientsPerDay')} />
          </Field>
          <Field label="Bed Capacity">
            <input className="input-field" type="number" min="0" placeholder="e.g. 200" value={form.bedCapacity || ''} onChange={set('bedCapacity')} />
          </Field>
        </Section>

        <Section title="Financial Settings" icon={NairaIcon}>
          <Field label="Currency">
            <select className="input-field" value={form.currency || 'USD'} onChange={set('currency')}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="VAT / Tax Rate (%)">
            <input className="input-field" type="number" min="0" max="100" step="0.1" placeholder="e.g. 15" value={form.taxRate || ''} onChange={set('taxRate')} />
          </Field>
          <Field label="Invoice Prefix">
            <input className="input-field" placeholder="e.g. INV-" value={form.invoicePrefix || ''} onChange={set('invoicePrefix')} />
          </Field>
          <Field label="Payment Terms">
            <select className="input-field" value={form.paymentTerms || 'Due on receipt'} onChange={set('paymentTerms')}>
              {['Due on receipt', 'Net 7', 'Net 14', 'Net 30', 'Net 60'].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Invoice Notes" full>
            <textarea className="input-field resize-none" rows={2} placeholder="e.g. Thank you for choosing us. Payment is due within 30 days." value={form.invoiceNotes || ''} onChange={set('invoiceNotes')} />
          </Field>
        </Section>

        <div className="card p-6 border-2 border-dashed border-teal-200 bg-teal-50/40">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Database size={17} className="text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 mb-0.5">Load Demo Data</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Populate all sections — patients, doctors, appointments, billing, inventory, lab results, pharmacy, shifts, claims, prescriptions, rooms and documents — with realistic sample data so you can explore every feature immediately.
                Existing records are never overwritten.
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn-primary bg-teal-600 hover:bg-teal-700 flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {seeding
                ? <><Loader2 size={14} className="animate-spin" /> Loading…</>
                : <><Database size={14} /> Load Demo Data</>}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className={`btn-primary ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
            {saved ? <CheckCircle size={15} /> : <Save size={15} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
