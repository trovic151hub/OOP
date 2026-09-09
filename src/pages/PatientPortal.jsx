import React, { useEffect, useState } from 'react'
import {
  Calendar, CalendarCheck, FlaskConical, Pill, FileText, User, LogOut,
  CheckCircle, Clock, AlertCircle, Activity, ChevronRight,
  Stethoscope, Home, Menu, X, Pencil, Plus, Send, CreditCard, Bell, Upload, NotebookPen, Printer, Search, Trash2,
  ChevronLeft, Moon, Sun, RotateCcw, ExternalLink
} from 'lucide-react'
import { store, useStore } from '../store/useStore'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import DatePicker from '../components/ui/DatePicker'
import TimePicker from '../components/ui/TimePicker'
import FormDropdown from '../components/ui/FormDropdown'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { formatDate, formatDateTime, formatCurrency, formatMedications } from '../utils/helpers'
import { resizeImageToDataUrl } from '../utils/image'

const NAV = [
  { id: 'overview',      label: 'Overview',         icon: Home },
  { id: 'timeline',      label: 'Timeline',         icon: Activity },
  { id: 'appointments',  label: 'My Appointments',   icon: Calendar },
  { id: 'prescriptions', label: 'My Prescriptions',  icon: Pill },
  { id: 'lab',           label: 'Lab Results',       icon: FlaskConical },
  { id: 'billing',       label: 'My Bills',          icon: CreditCard },
  { id: 'documents',     label: 'My Documents',      icon: FileText },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
]
const MOBILE_NAV_IDS = ['overview', 'timeline', 'appointments', 'billing', 'notifications']
const PAGE_LABELS = Object.fromEntries(NAV.map(item => [item.id, item.label]))

const APPT_TYPES = ['Consultation','Follow-up','Telemedicine','Check-up','Lab Review','Other']
const PAYMENT_METHODS = ['Card', 'Bank Transfer', 'Cash at Hospital', 'Insurance']
const DOC_TYPES = ['Insurance Card', 'Referral Letter', 'Old Lab Result', 'ID Document', 'Medical History', 'Other']

const EMPTY_REQUEST = {
  type: 'Consultation',
  doctorName: '',
  date: '',
  timeStart: '',
  notes: '',
}

const EMPTY_DOCUMENT = {
  title: '',
  type: 'Insurance Card',
  date: '',
  url: '',
  description: '',
  fileData: '',
  fileName: '',
  mimeType: '',
}

const EMPTY_APPOINTMENT_CHANGE = {
  date: '',
  timeStart: '',
  notes: '',
}

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }) {
  const cols = {
    teal:    'bg-teal-50 dark:bg-teal-500/12    text-teal-700    border-teal-200 dark:border-teal-500/30',
    blue:    'bg-blue-50 dark:bg-blue-500/12    text-blue-700    border-blue-200 dark:border-blue-500/30',
    violet:  'bg-violet-50 dark:bg-violet-500/12  text-violet-700  border-violet-200 dark:border-violet-500/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 border-emerald-200 dark:border-emerald-500/30',
    amber:   'bg-amber-50 dark:bg-amber-500/12   text-amber-700   border-amber-200 dark:border-amber-500/30',
    red:     'bg-red-50 dark:bg-red-500/12     text-red-700     border-red-200 dark:border-red-500/30',
  }
  return (
    <div className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 ${cols[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} />
        <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{label}</p>
      </div>
      <p className="text-xl sm:text-3xl font-extrabold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

export default function PatientPortal({ currentUser }) {
  const { patients = [], appointments, prescriptions = [], labResults = [], invoices = [], documents = [], notifications = [], settings } = useStore()
  const { dark, toggle: toggleDark } = useTheme()
  const [page, setPage]         = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('mc_patient_sidebar_collapsed') === 'true')
  const [profileModal, setProfileModal] = useState(false)
  const [requestModal, setRequestModal] = useState(false)
  const [paymentModal, setPaymentModal] = useState(false)
  const [documentModal, setDocumentModal] = useState(false)
  const [appointmentChangeModal, setAppointmentChangeModal] = useState(false)
  const [appointmentChangeType, setAppointmentChangeType] = useState('reschedule')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [dismissedGeneratedIds, setDismissedGeneratedIds] = useState([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [sendingRequest, setSendingRequest] = useState(false)
  const [payingInvoice, setPayingInvoice] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const [sendingAppointmentChange, setSendingAppointmentChange] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [localAvatarOverride, setLocalAvatarOverride] = useState(null)
  const showToast = useToast()

  const name = currentUser?.name || currentUser?.email || ''
  const patientProfile = patients.find(p =>
    p.uid === currentUser?.uid ||
    p.email === currentUser?.email ||
    p.name === currentUser?.name
  )
  const patientId = patientProfile?.id || ''
  const patientName = patientProfile?.name || name
  const patientEmail = patientProfile?.email || currentUser?.email || ''
  const patientAvatar = localAvatarOverride ?? (patientProfile?.avatar || currentUser?.avatar || '')
  const generatedReadKey = `medcore:patient-generated-notifications:${currentUser?.uid || patientEmail || patientName || 'guest'}`
  const [profileForm, setProfileForm] = useState({
    avatar: patientAvatar,
    phone: patientProfile?.phone || '',
    address: patientProfile?.address || '',
    emergencyContact: patientProfile?.emergencyContact || '',
    allergies: patientProfile?.allergies || '',
    insurance: patientProfile?.insurance || '',
    notes: patientProfile?.notes || '',
  })
  const [requestForm, setRequestForm] = useState(EMPTY_REQUEST)
  const [documentForm, setDocumentForm] = useState(EMPTY_DOCUMENT)
  const [appointmentChangeForm, setAppointmentChangeForm] = useState(EMPTY_APPOINTMENT_CHANGE)

  useEffect(() => {
    setLocalAvatarOverride(null)
  }, [currentUser?.uid])

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(generatedReadKey)
      setDismissedGeneratedIds(stored ? JSON.parse(stored) : [])
    } catch (_) {
      setDismissedGeneratedIds([])
    }
  }, [generatedReadKey])

  function rememberGeneratedNotifications(ids) {
    setDismissedGeneratedIds(prev => {
      const next = [...new Set([...prev, ...ids])]
      try {
        window.localStorage.setItem(generatedReadKey, JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  function belongsToPatient(record) {
    return (!!patientId && record.patientId === patientId) ||
      (!!patientEmail && record.patientEmail === patientEmail) ||
      (!!patientName && record.patientName === patientName)
  }

  const myAppts  = appointments.filter(belongsToPatient)
  const myRx     = prescriptions.filter(belongsToPatient)
  const myLabs   = labResults.filter(belongsToPatient)
  const myBills  = invoices.filter(belongsToPatient)
  const myDocs   = documents.filter(belongsToPatient)

  const upcoming     = myAppts.filter(a => !['Completed','Cancelled'].includes(a.status))
  const scheduledAppts = myAppts.filter(a => a.status === 'Scheduled')
  const requestedAppts = myAppts.filter(a => ['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(a.status))
  const completedAppts = myAppts.filter(a => a.status === 'Completed')
  const nextAppt     = myAppts.filter(a => a.date >= new Date().toISOString().slice(0,10) && a.status !== 'Cancelled')
    .sort((a,b) => a.date.localeCompare(b.date))[0]
  const abnormalLabs = myLabs.filter(l => l.status === 'Abnormal')
  const activeRx     = myRx.filter(r => r.status === 'Active')
  const pendingBills = myBills.filter(i => ['Pending', 'Overdue'].includes(i.status))
  const paidBills = myBills.filter(i => i.status === 'Paid')
  const pendingTotal = pendingBills.reduce((s, i) => s + Number(i.total || i.totalAmount || 0), 0)
  const oldestPendingBill = [...pendingBills].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))[0]
  const pendingDocReviews = myDocs.filter(d => (d.reviewStatus || (d.patientUploaded ? 'Pending Review' : 'Available')) === 'Pending Review')
  const rejectedDocs = myDocs.filter(d => d.reviewStatus === 'Rejected')
  const approvedDocs = myDocs.filter(d => ['Reviewed', 'Available'].includes(d.reviewStatus || (d.patientUploaded ? 'Pending Review' : 'Available')))
  const missingProfileFields = [
    ['phone', 'phone'],
    ['address', 'address'],
    ['emergencyContact', 'emergency contact'],
    ['insurance', 'insurance'],
    ['allergies', 'allergies'],
  ].filter(([key]) => !String(patientProfile?.[key] || '').trim()).map(([, label]) => label)
  const generatedNotifications = [
    ...myAppts
      .filter(a => ['Requested', 'Scheduled', 'Cancelled'].includes(a.status))
      .map(a => ({
        id: `appt-${a.id}-${a.status}`,
        source: 'generated',
        type: 'appointments',
        target: 'appointments',
        title: a.status === 'Requested' ? 'Appointment request sent' : a.status === 'Scheduled' ? 'Appointment confirmed' : 'Appointment cancelled',
        message: `${a.type || 'Appointment'} with ${a.doctorName || 'the hospital team'}${a.date ? ` on ${formatDate(a.date)}` : ''}.${a.staffNote ? ` ${a.staffNote}` : ''}`,
        createdAt: a.updatedAt || a.requestedAt || a.createdAt || a.date,
      })),
    ...pendingBills.map(i => ({
      id: `bill-${i.id}-${i.status}`,
      source: 'generated',
      type: 'billing',
      target: 'billing',
      title: i.status === 'Overdue' ? 'Invoice overdue' : 'Invoice awaiting payment',
      message: `${i.description || 'Medical services'} - ${formatCurrency(i.totalAmount || i.total || 0, settings?.currency)}.`,
      createdAt: i.updatedAt || i.date || i.createdAt,
    })),
    ...abnormalLabs.map(l => ({
      id: `lab-${l.id}`,
      source: 'generated',
      type: 'lab',
      target: 'lab',
      title: 'Abnormal lab result',
      message: `${l.testName || 'Lab result'} needs review${l.date ? ` from ${formatDate(l.date)}` : ''}.`,
      createdAt: l.updatedAt || l.date || l.createdAt,
    })),
    ...activeRx.slice(0, 3).map(r => ({
      id: `rx-${r.id}`,
      source: 'generated',
      type: 'prescriptions',
      target: 'prescriptions',
      title: 'Active prescription',
      message: `${r.medication || r.drugName || 'Prescription'} is active.`,
      createdAt: r.updatedAt || r.date || r.createdAt,
    })),
    ...myDocs.slice(0, 3).map(d => ({
      id: `doc-${d.id}`,
      source: 'generated',
      type: 'documents',
      target: 'documents',
      title: 'Document available',
      message: `${d.title || 'A document'} is available in your portal.`,
      createdAt: d.updatedAt || d.date || d.createdAt,
    })),
  ].filter(n => !dismissedGeneratedIds.includes(n.id))

  const savedNotifications = notifications.map(n => ({ ...n, source: 'backend' }))
  const patientNotifications = [...savedNotifications, ...generatedNotifications]
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  const unreadNotifications = savedNotifications.filter(n => !n.read).length + generatedNotifications.length
  const normalizedSearch = search.trim().toLowerCase()
  const searchResults = normalizedSearch.length >= 2 ? [
    ...NAV
      .filter(item => item.label.toLowerCase().includes(normalizedSearch))
      .map(item => ({ id: `page-${item.id}`, page: item.id, icon: item.icon, title: item.label, subtitle: 'Portal section' })),
    ...myAppts
      .filter(a => [a.type, a.doctorName, a.status, a.date, a.notes, a.patientRequestNote].some(value => String(value || '').toLowerCase().includes(normalizedSearch)))
      .slice(0, 4)
      .map(a => ({ id: `appt-${a.id}`, page: 'appointments', icon: Calendar, title: a.type || 'Appointment', subtitle: `${a.doctorName || 'Hospital team'} - ${a.date ? formatDate(a.date) : 'No date'}` })),
    ...myRx
      .filter(r => [r.doctorName, r.status, r.notes, formatMedications(r.medications), r.medication, r.drugName].some(value => String(value || '').toLowerCase().includes(normalizedSearch)))
      .slice(0, 4)
      .map(r => ({ id: `rx-${r.id}`, page: 'prescriptions', icon: Pill, title: formatMedications(r.medications) || r.medication || r.drugName || 'Prescription', subtitle: `${r.status || 'Prescription'} - ${r.date ? formatDate(r.date) : 'No date'}` })),
    ...myLabs
      .filter(l => [l.testName, l.category, l.status, l.result, l.notes].some(value => String(value || '').toLowerCase().includes(normalizedSearch)))
      .slice(0, 4)
      .map(l => ({ id: `lab-${l.id}`, page: 'lab', icon: FlaskConical, title: l.testName || 'Lab result', subtitle: `${l.status || 'Result'} - ${l.date ? formatDate(l.date) : 'No date'}` })),
    ...myBills
      .filter(i => [i.invoiceNumber, i.description, i.status, i.date, i.notes].some(value => String(value || '').toLowerCase().includes(normalizedSearch)))
      .slice(0, 4)
      .map(i => ({ id: `bill-${i.id}`, page: 'billing', icon: CreditCard, title: i.description || `Invoice #${i.invoiceNumber || i.id?.slice(0, 8)}`, subtitle: `${i.status || 'Invoice'} - ${formatCurrency(i.totalAmount || i.total || 0, settings?.currency)}` })),
    ...myDocs
      .filter(d => [d.title, d.type, d.description, d.reviewStatus, d.reviewNote].some(value => String(value || '').toLowerCase().includes(normalizedSearch)))
      .slice(0, 4)
      .map(d => ({ id: `doc-${d.id}`, page: 'documents', icon: FileText, title: d.title || 'Document', subtitle: `${d.type || 'Document'} - ${d.reviewStatus || 'Available'}` })),
  ].slice(0, 8) : []
  const patientTimeline = [
    ...myAppts.flatMap(a => {
      const events = []
      const submittedAt = a.requestedAt || a.createdAt || a.date
      const currentAt = a.reviewedAt || a.updatedAt || a.createdAt || a.date
      const isChangeRequest = ['Reschedule Requested', 'Cancel Requested'].includes(a.status)
      const isPendingRequest = ['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(a.status)
      const requestTitle = a.status === 'Cancel Requested'
        ? 'Cancellation request sent'
        : a.status === 'Reschedule Requested'
          ? 'Reschedule request sent'
          : 'Appointment request sent'

      if (isPendingRequest) {
        events.push({
          id: `appt-${a.id}-request`,
          date: submittedAt,
          icon: Calendar,
          tone: 'amber',
          status: a.status,
          title: requestTitle,
          subtitle: `${formatDateTime(submittedAt || a.date)} - ${a.type || 'Appointment'}`,
          detail: isChangeRequest && a.requestedDate
            ? `Requested for ${formatDate(a.requestedDate)}${a.requestedTimeStart ? ` at ${a.requestedTimeStart}` : ''}`
            : `${a.doctorName || 'Hospital team'}${a.date ? ` on ${formatDate(a.date)}` : ''}`,
          note: a.patientRequestNote || a.notes || '',
        })
      } else {
        events.push({
          id: `appt-${a.id}-current`,
          date: currentAt,
          icon: a.status === 'Cancelled' ? X : CheckCircle,
          tone: a.status === 'Cancelled' ? 'red' : a.status === 'Scheduled' ? 'emerald' : 'blue',
          status: a.status,
          title: a.status === 'Cancelled' ? 'Appointment cancelled' : a.status === 'Scheduled' ? 'Appointment confirmed' : `Appointment ${a.status?.toLowerCase() || 'updated'}`,
          subtitle: `${formatDateTime(currentAt || a.date)} - ${a.type || 'Appointment'}`,
          detail: `${a.doctorName || 'Hospital team'}${a.date ? ` on ${formatDate(a.date)}` : ''}${a.timeStart ? ` at ${a.timeStart}` : ''}`,
          note: a.staffNote || '',
        })
      }
      return events
    }),
    ...myDocs.flatMap(d => {
      const reviewStatus = d.reviewStatus || (d.patientUploaded ? 'Pending Review' : 'Available')
      const uploadedAt = d.createdAt || d.date
      const events = []
      if (d.patientUploaded) {
        events.push({
          id: `doc-${d.id}-upload`,
          date: uploadedAt,
          icon: Upload,
          tone: reviewStatus === 'Pending Review' ? 'amber' : 'violet',
          status: reviewStatus,
          title: 'Document uploaded',
          subtitle: `${formatDateTime(uploadedAt || d.date)} - ${d.type || 'Document'}`,
          detail: d.title || 'Patient document',
          note: d.description || '',
        })
      }
      if (['Reviewed', 'Rejected'].includes(reviewStatus)) {
        events.push({
          id: `doc-${d.id}-review`,
          date: d.reviewedAt || d.createdAt || d.date,
          icon: reviewStatus === 'Rejected' ? X : CheckCircle,
          tone: reviewStatus === 'Rejected' ? 'red' : 'emerald',
          status: reviewStatus,
          title: reviewStatus === 'Rejected' ? 'Document rejected' : 'Document reviewed',
          subtitle: `${formatDateTime(d.reviewedAt || d.createdAt || d.date)} - ${d.type || 'Document'}`,
          detail: d.title || 'Patient document',
          note: d.reviewNote || '',
        })
      }
      return events
    }),
  ]
    .filter(item => item.date)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))

  function handleSignOut() { store.logout() }

  function navigate(id) { setPage(id); setMobileNavOpen(false) }

  function openSearchResult(result) {
    navigate(result.page)
    setSearch('')
    setSearchOpen(false)
    setMobileSearchOpen(false)
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed(value => {
      localStorage.setItem('mc_patient_sidebar_collapsed', String(!value))
      return !value
    })
  }
  function setProfileField(k) { return e => setProfileForm(f => ({ ...f, [k]: e.target.value })) }
  function setRequestField(k) { return e => setRequestForm(f => ({ ...f, [k]: e.target.value })) }
  function setDocumentField(k) { return e => setDocumentForm(f => ({ ...f, [k]: e.target.value })) }
  function setAppointmentChangeField(k) { return e => setAppointmentChangeForm(f => ({ ...f, [k]: e.target.value })) }

  function openDocumentUpload() {
    setDocumentForm({ ...EMPTY_DOCUMENT, date: new Date().toISOString().slice(0, 10) })
    setDocumentModal(true)
  }

  function openCorrectedDocumentUpload(doc) {
    setDocumentForm({
      ...EMPTY_DOCUMENT,
      title: doc.title ? `${doc.title} - corrected` : '',
      type: doc.type || EMPTY_DOCUMENT.type,
      date: new Date().toISOString().slice(0, 10),
      description: doc.reviewNote ? `Correction for rejected upload: ${doc.reviewNote}` : '',
    })
    setDocumentModal(true)
  }

  function openAppointmentChange(appointment, type) {
    setSelectedAppointment(appointment)
    setAppointmentChangeType(type)
    setAppointmentChangeForm({
      date: appointment.date || '',
      timeStart: appointment.timeStart || '',
      notes: '',
    })
    setAppointmentChangeModal(true)
  }

  function handleDocumentFile(file) {
    if (!file) {
      setDocumentForm(f => ({ ...f, fileData: '', fileName: '', mimeType: '' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be 5 MB or smaller.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setDocumentForm(f => ({
        ...f,
        fileData: String(reader.result || ''),
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        title: f.title || file.name.replace(/\.[^.]+$/, ''),
      }))
    }
    reader.onerror = () => showToast('Could not read that file.', 'error')
    reader.readAsDataURL(file)
  }

  function openPayment(invoice) {
    setSelectedInvoice(invoice)
    setPaymentMethod(invoice.paymentMethod || 'Card')
    setPaymentModal(true)
  }

  function openProfileEdit() {
    setProfileForm({
      avatar: patientAvatar,
      phone: patientProfile?.phone || '',
      address: patientProfile?.address || '',
      emergencyContact: patientProfile?.emergencyContact || '',
      allergies: patientProfile?.allergies || '',
      insurance: patientProfile?.insurance || '',
      notes: patientProfile?.notes || '',
    })
    setProfileModal(true)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !patientProfile) return
    if (!file.type.startsWith('image/')) { showToast('Please choose an image file.', 'error'); return }
    if (file.size > 1.5 * 1024 * 1024) { showToast('Image must be smaller than 1.5MB.', 'error'); return }

    setUploadingAvatar(true)
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      await store.updatePatient(patientProfile.id, { avatar: dataUrl })
      if (currentUser?.uid) await store.updateUserProfile(currentUser.uid, { avatar: dataUrl })
      setLocalAvatarOverride(dataUrl)
      setProfileForm(f => ({ ...f, avatar: dataUrl }))
      showToast('Profile photo updated.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to upload photo.', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function removeAvatar() {
    if (!patientProfile) return
    setUploadingAvatar(true)
    try {
      await store.updatePatient(patientProfile.id, { avatar: '' })
      if (currentUser?.uid) await store.updateUserProfile(currentUser.uid, { avatar: '' })
      setLocalAvatarOverride('')
      setProfileForm(f => ({ ...f, avatar: '' }))
      showToast('Profile photo removed.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to remove photo.', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function saveProfile() {
    if (!patientProfile) { showToast('No linked patient profile found.', 'error'); return }
    setSavingProfile(true)
    try {
      await store.updatePatient(patientProfile.id, profileForm)
      if (currentUser?.uid) await store.updateUserProfile(currentUser.uid, { avatar: profileForm.avatar || '' })
      showToast('Profile updated.', 'success')
      setProfileModal(false)
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function submitAppointmentRequest() {
    if (!requestForm.date) { showToast('Preferred date is required.', 'error'); return }
    if (!requestForm.notes.trim()) { showToast('Please add a short reason for the visit.', 'error'); return }
    setSendingRequest(true)
    try {
      await store.addAppointment(requestForm)
      showToast('Appointment request sent.', 'success')
      setRequestForm(EMPTY_REQUEST)
      setRequestModal(false)
      setPage('appointments')
    } catch (err) {
      showToast(err.message || 'Failed to send appointment request.', 'error')
    } finally {
      setSendingRequest(false)
    }
  }

  async function submitPayment() {
    if (!selectedInvoice) return
    setPayingInvoice(true)
    try {
      await store.payInvoice(selectedInvoice.id, { paymentMethod })
      showToast('Payment recorded.', 'success')
      setPaymentModal(false)
      setSelectedInvoice(null)
    } catch (err) {
      showToast(err.message || 'Failed to record payment.', 'error')
    } finally {
      setPayingInvoice(false)
    }
  }

  async function submitDocumentUpload() {
    if (!documentForm.title.trim()) { showToast('Document title is required.', 'error'); return }
    if (!documentForm.date) { showToast('Document date is required.', 'error'); return }
    if (!documentForm.fileData && !documentForm.url.trim()) { showToast('Attach a file or paste a document link.', 'error'); return }
    setUploadingDocument(true)
    try {
      if (documentForm.fileData) await store.uploadDocument(documentForm)
      else await store.addDocument(documentForm)
      showToast('Document uploaded.', 'success')
      setDocumentForm(EMPTY_DOCUMENT)
      setDocumentModal(false)
      setPage('documents')
    } catch (err) {
      showToast(err.message || 'Failed to upload document.', 'error')
    } finally {
      setUploadingDocument(false)
    }
  }

  async function submitAppointmentChange() {
    if (!selectedAppointment) return
    if (appointmentChangeType === 'reschedule' && !appointmentChangeForm.date) {
      showToast('Preferred date is required.', 'error')
      return
    }
    if (appointmentChangeType === 'cancel' && !appointmentChangeForm.notes.trim()) {
      showToast('Please add a cancellation reason.', 'error')
      return
    }
    setSendingAppointmentChange(true)
    try {
      if (appointmentChangeType === 'reschedule') {
        await store.requestAppointmentReschedule(selectedAppointment.id, appointmentChangeForm)
        showToast('Reschedule request sent.', 'success')
      } else {
        await store.requestAppointmentCancel(selectedAppointment.id, appointmentChangeForm)
        showToast('Cancellation request sent.', 'success')
      }
      setAppointmentChangeModal(false)
      setSelectedAppointment(null)
    } catch (err) {
      showToast(err.message || 'Failed to send request.', 'error')
    } finally {
      setSendingAppointmentChange(false)
    }
  }

  async function openNotification(notification) {
    if (notification.source === 'backend' && !notification.read) {
      await store.markNotificationRead(notification.id)
    }
    if (notification.source === 'generated') {
      rememberGeneratedNotifications([notification.id])
    }
    if (notification.target) navigate(notification.target)
  }

  async function markAllNotificationsRead() {
    if (savedNotifications.some(n => !n.read)) await store.markAllNotificationsRead()
    if (generatedNotifications.length > 0) {
      rememberGeneratedNotifications(generatedNotifications.map(n => n.id))
    }
  }

  const textCls = sidebarCollapsed ? 'md:hidden' : ''
  const getNavAlertCount = id => {
    if (id === 'lab') return abnormalLabs.length
    if (id === 'billing') return pendingBills.length
    if (id === 'notifications') return unreadNotifications
    return 0
  }

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className={`${sidebarCollapsed ? 'md:px-3' : 'px-5'} px-5 py-6 border-b border-slate-100 dark:border-slate-700`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className={`font-extrabold text-teal-700 dark:text-teal-400 text-base tracking-tight ${textCls}`}>MedCore</span>
        </div>
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'md:justify-center' : ''}`}>
          <Avatar name={patientName} src={patientAvatar} size="md" />
          <div className={`min-w-0 ${textCls}`}>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate max-w-32">{patientName}</p>
            <p className="text-[11px] text-teal-600 font-medium">Patient Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const alertCount = getNavAlertCount(id)
          const badgeTone = id === 'billing' ? 'bg-amber-500' : 'bg-red-500'
          return (
            <button key={id}
              onClick={() => navigate(id)}
              title={sidebarCollapsed ? label : undefined}
              className={`sidebar-link relative ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''} ${page === id ? 'active' : ''}`}>
              <Icon size={16} />
              <span className={textCls}>{label}</span>
              {alertCount > 0 && (
                <>
                  <span className={`ml-auto text-[10px] ${badgeTone} text-white font-bold px-1.5 py-0.5 rounded-full ${textCls}`}>
                    {alertCount}
                  </span>
                  <span className={`hidden ${sidebarCollapsed ? 'md:block' : ''} absolute right-3 top-2.5 w-2 h-2 rounded-full ${badgeTone}`} />
                </>
              )}
            </button>
          )
        })}
      </nav>
      <div className="px-3 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
        <button onClick={handleSignOut}
          title={sidebarCollapsed ? 'Sign Out' : undefined}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}>
          <LogOut size={15} />
          <span className={textCls}>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-[55] bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-[56] h-full w-60 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300
          ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-60'}
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <button
          onClick={() => setMobileNavOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        {Sidebar}
      </aside>

      <button
        type="button"
        onClick={toggleSidebarCollapsed}
        className={`hidden md:flex fixed top-[68px] z-[57] w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-200 transition-all duration-300 ${sidebarCollapsed ? 'left-[60px]' : 'left-[228px]'}`}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ChevronLeft size={14} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
      </button>

      <div className={`min-h-screen min-w-0 flex flex-col transition-[margin-left] duration-300 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-60'}`}>
        <header className={`fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 ${sidebarCollapsed ? 'md:left-[72px]' : 'md:left-60'}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 truncate">{PAGE_LABELS[page] || 'Patient Portal'}</h1>
              <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 truncate">Patient Portal</p>
            </div>
          </div>
          <div className="relative hidden md:block flex-1 max-w-md mx-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
              placeholder="Search your portal..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {searchOpen && normalizedSearch.length >= 2 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] overflow-hidden">
                {searchResults.length > 0 ? searchResults.map(result => {
                  const Icon = result.icon
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => openSearchResult(result)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-500/12 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{result.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{result.subtitle}</p>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                    </button>
                  )
                }) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-600">
                    No patient portal results
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => { setMobileSearchOpen(true); setSearchOpen(true) }}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Search patient portal"
              title="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors no-print"
              aria-label="Print current page"
              title="Print current page"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('notifications')}
              className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotifications > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Avatar name={patientName} src={patientAvatar} size="sm" />
              <div className="hidden lg:block min-w-0 max-w-36">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{patientName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Patient</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {mobileSearchOpen && (
          <div className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-xl p-3 no-print">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setSearchOpen(true) }}
                placeholder="Search your portal..."
                className="w-full pl-8 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={() => { setMobileSearchOpen(false); setSearch(''); setSearchOpen(false) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close search"
              >
                <X size={14} />
              </button>
            </div>
            {searchOpen && normalizedSearch.length >= 2 && (
              <div className="mt-3 max-h-[calc(100vh-10rem)] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {searchResults.length > 0 ? searchResults.map(result => {
                  const Icon = result.icon
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => openSearchResult(result)}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/12 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{result.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{result.subtitle}</p>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 dark:text-slate-700 flex-shrink-0" />
                    </button>
                  )
                }) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-600">
                    No patient portal results
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <main className="flex-1 pt-[4.5rem] sm:pt-20 pb-20 md:pb-8 px-3 sm:px-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">

            {page === 'overview' && (
              <>
                <div className="mb-4 sm:mb-5 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-slate-800/95 border border-white dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 px-3 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 mb-3">
                        <Activity size={12} /> Patient Portal
                      </div>
                      <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Welcome back, {patientName.split(' ')[0]}</h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">Manage appointments, documents, bills, and care updates from one place.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 lg:w-64">
                      <button onClick={() => setRequestModal(true)} className="btn-primary justify-center text-xs">
                        <Plus size={13} /> Appointment
                      </button>
                      <button onClick={openDocumentUpload} className="btn-ghost justify-center text-xs">
                        <Upload size={13} /> Document
                      </button>
                      <button onClick={() => navigate('billing')} className="btn-ghost justify-center text-xs">
                        <CreditCard size={13} /> Bills
                      </button>
                      <button onClick={() => navigate('timeline')} className="btn-ghost justify-center text-xs">
                        <Activity size={13} /> Timeline
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:hidden mb-4 -mx-3 px-3 overflow-x-auto">
                  <div className="flex gap-2 min-w-max pb-1">
                    {NAV.filter(item => item.id !== 'overview').map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => navigate(id)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm"
                      >
                        <Icon size={14} className="text-teal-600 dark:text-teal-400" />
                        {label.replace('My ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {patientProfile && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5 mb-4 sm:mb-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={patientName} src={patientAvatar} size="lg" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{patientName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{patientEmail || 'No email on patient record'}</p>
                      </div>
                      </div>
                      <button onClick={openProfileEdit} className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0">
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 text-xs">
                      <div><p className="text-slate-400 dark:text-slate-600">Patient ID</p><p className="font-bold text-slate-700 dark:text-slate-300">#{patientId.slice(-6).toUpperCase()}</p></div>
                      <div><p className="text-slate-400 dark:text-slate-600">Blood Type</p><p className="font-bold text-slate-700 dark:text-slate-300">{patientProfile.blood || 'Unknown'}</p></div>
                      <div><p className="text-slate-400 dark:text-slate-600">Status</p><p className="font-bold text-slate-700 dark:text-slate-300">{patientProfile.status || 'Active'}</p></div>
                      <div><p className="text-slate-400 dark:text-slate-600">Phone</p><p className="font-bold text-slate-700 dark:text-slate-300 truncate">{patientProfile.phone || '-'}</p></div>
                      <div><p className="text-slate-400 dark:text-slate-600">Emergency</p><p className="font-bold text-slate-700 dark:text-slate-300 truncate">{patientProfile.emergencyContact || '-'}</p></div>
                      <div><p className="text-slate-400 dark:text-slate-600">Insurance</p><p className="font-bold text-slate-700 dark:text-slate-300 truncate">{patientProfile.insurance || '-'}</p></div>
                      <div className="sm:col-span-2"><p className="text-slate-400 dark:text-slate-600">Allergies</p><p className="font-bold text-slate-700 dark:text-slate-300 truncate">{patientProfile.allergies || 'None recorded'}</p></div>
                    </div>
                  </div>
                )}

                {patientProfile && missingProfileFields.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-500/12 border border-amber-200 dark:border-amber-500/30 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 mb-4 sm:mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Complete your profile</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">Missing: {missingProfileFields.join(', ')}</p>
                      </div>
                    </div>
                    <button onClick={openProfileEdit} className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0">
                      <Pencil size={12} /> Update
                    </button>
                  </div>
                )}

                {abnormalLabs.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/30 rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-3 mb-4 sm:mb-5 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">Abnormal Lab Result{abnormalLabs.length > 1 ? 's' : ''}</p>
                      <p className="text-xs text-red-500">You have {abnormalLabs.length} lab result{abnormalLabs.length > 1 ? 's' : ''} requiring attention. Please contact your doctor.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                  <QuickAction
                    icon={Calendar}
                    title="Request care"
                    subtitle={upcoming.length ? `${upcoming.length} appointment${upcoming.length === 1 ? '' : 's'} currently active` : 'Ask the hospital team for a visit'}
                    tone="teal"
                    action="Request"
                    onClick={() => setRequestModal(true)}
                  />
                  <QuickAction
                    icon={Upload}
                    title={rejectedDocs.length ? 'Fix document' : 'Upload document'}
                    subtitle={rejectedDocs.length ? `${rejectedDocs.length} rejected upload${rejectedDocs.length === 1 ? '' : 's'} need attention` : `${pendingDocReviews.length} upload${pendingDocReviews.length === 1 ? '' : 's'} waiting for review`}
                    tone={rejectedDocs.length ? 'amber' : 'violet'}
                    action="Open"
                    onClick={() => navigate('documents')}
                  />
                  <QuickAction
                    icon={CreditCard}
                    title="Review bills"
                    subtitle={pendingBills.length ? `${pendingBills.length} invoice${pendingBills.length === 1 ? '' : 's'} awaiting payment` : 'No outstanding payments right now'}
                    tone={pendingBills.length ? 'amber' : 'blue'}
                    action="View"
                    onClick={() => navigate('billing')}
                  />
                  <QuickAction
                    icon={User}
                    title="Profile"
                    subtitle={missingProfileFields.length ? `${missingProfileFields.length} field${missingProfileFields.length === 1 ? '' : 's'} missing` : 'Your contact details look complete'}
                    tone={missingProfileFields.length ? 'amber' : 'teal'}
                    action="Update"
                    onClick={openProfileEdit}
                  />
                </div>

                {nextAppt && (
                  <div className="bg-teal-600 text-white rounded-xl sm:rounded-2xl px-3.5 sm:px-5 py-3.5 sm:py-4 mb-4 sm:mb-5 flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold opacity-70 uppercase tracking-wide">Next Appointment</p>
                      <p className="font-bold text-base sm:text-lg">{formatDate(nextAppt.date)}</p>
                      <p className="text-xs sm:text-sm opacity-80 truncate">Dr. {nextAppt.doctorName} - {nextAppt.type}</p>
                    </div>
                    <Badge status={nextAppt.status} />
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                  <StatCard icon={Calendar}    label="Upcoming"         value={upcoming.length}    color="blue" />
                  <StatCard icon={Pill}        label="Active Rx"        value={activeRx.length}    color="teal" />
                  <StatCard icon={FlaskConical} label="Lab Tests"       value={myLabs.length}      color="violet" />
                  <StatCard icon={CreditCard}  label="Pending Bills"    value={pendingBills.length} color={pendingBills.length > 0 ? 'amber' : 'emerald'} />
                  <StatCard icon={CheckCircle} label="Completed Visits" value={myAppts.filter(a => a.status === 'Completed').length} color="emerald" />
                  <StatCard icon={AlertCircle} label="Abnormal Labs"    value={abnormalLabs.length} color={abnormalLabs.length > 0 ? 'red' : 'emerald'} />
                  <StatCard icon={FileText}    label="Documents"        value={myDocs.length} color="violet" />
                </div>

                {patientTimeline.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5 mb-5 sm:mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Recent Status Updates</p>
                      <button onClick={() => navigate('timeline')} className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-0.5">
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {patientTimeline.slice(0, 3).map(item => <TimelineItem key={item.id} item={item} compact />)}
                    </div>
                  </div>
                )}

                {activeRx.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-slate-700 dark:text-slate-300">Current Medications</p>
                      <button onClick={() => navigate('prescriptions')} className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-0.5">
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {activeRx.slice(0, 3).map(r => {
                        const med = normalizeMedicationList(r.medications)[0]
                        const instruction = [med?.frequency, med?.duration].filter(Boolean).join(' - ')
                        return (
                        <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <div className="w-8 h-8 bg-teal-100 dark:bg-teal-500/18 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill size={14} className="text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{med?.name || formatMedications(r.medications) || r.medication || 'Prescription'}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{instruction || 'Follow care team instructions'}</p>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-600 truncate max-w-20 flex-shrink-0">{r.doctorName ? `Dr. ${r.doctorName}` : 'Care team'}</p>
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {page === 'timeline' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Request Timeline</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Track appointment requests and document review updates.</p>
                  </div>
                  <button onClick={() => setRequestModal(true)} className="btn-primary">
                    <Plus size={15} /> Request Appointment
                  </button>
                </div>
                {patientTimeline.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 text-center text-slate-400 dark:text-slate-600">
                    <Activity size={36} className="text-slate-200 mb-3" />
                    <p className="text-sm font-medium">No request updates yet</p>
                    <p className="text-xs mt-1">Appointment requests and document reviews will appear here.</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5">
                    <div className="flex flex-col">
                      {patientTimeline.map(item => <TimelineItem key={item.id} item={item} />)}
                    </div>
                  </div>
                )}
              </>
            )}

            {page === 'appointments' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">My Appointments</h2>
                  <button onClick={() => setRequestModal(true)} className="btn-primary">
                    <Plus size={15} /> Request Appointment
                  </button>
                </div>
                {myAppts.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
                    <StatCard icon={CalendarCheck} label="Scheduled" value={scheduledAppts.length} color="teal" />
                    <StatCard icon={Clock} label="In Review" value={requestedAppts.length} color={requestedAppts.length ? 'amber' : 'emerald'} />
                    <StatCard icon={CheckCircle} label="Completed" value={completedAppts.length} color="emerald" />
                    <StatCard icon={X} label="Cancelled" value={myAppts.filter(a => a.status === 'Cancelled').length} color="red" />
                  </div>
                )}
                {myAppts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center mb-4">
                      <Calendar size={26} className="text-teal-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No appointments yet</p>
                    <p className="text-xs mt-1 max-w-sm">Request a visit and the hospital team will review your preferred date and time.</p>
                    <button onClick={() => setRequestModal(true)} className="btn-primary text-xs mt-4">
                      <Plus size={13} /> Request First Appointment
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {myAppts.sort((a,b) => b.date.localeCompare(a.date)).map(a => {
                      const waitingReview = ['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(a.status)
                      return (
                      <div key={a.id} className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 ${waitingReview ? 'border-amber-200 dark:border-amber-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="w-full sm:w-28 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 px-3.5 sm:px-4 py-3 text-teal-700 dark:text-teal-400 flex-shrink-0">
                          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Visit Date</p>
                          <p className="text-sm font-extrabold mt-1">{a.date ? formatDate(a.date) : 'Pending'}</p>
                          {a.timeStart && <p className="text-xs mt-1 opacity-80">{a.timeStart}</p>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{a.type || 'Appointment'}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5 truncate">{a.doctorName ? `Dr. ${a.doctorName}` : 'Any available doctor'}</p>
                            </div>
                            <Badge status={a.status} />
                          </div>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2">
                              <p className="font-bold text-slate-400 dark:text-slate-600 uppercase">Clinician</p>
                              <p className="mt-0.5 text-slate-700 dark:text-slate-300 truncate">{a.doctorName ? `Dr. ${a.doctorName}` : 'Any available doctor'}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2">
                              <p className="font-bold text-slate-400 dark:text-slate-600 uppercase">Time</p>
                              <p className="mt-0.5 text-slate-700 dark:text-slate-300">{a.timeStart || 'Pending'}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2">
                              <p className="font-bold text-slate-400 dark:text-slate-600 uppercase">Next Step</p>
                              <p className="mt-0.5 text-slate-700 dark:text-slate-300">{waitingReview ? 'Staff review' : a.status === 'Scheduled' ? 'Attend visit' : a.status || 'Updated'}</p>
                            </div>
                          </div>
                          {a.requestedDate && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Requested change: {formatDate(a.requestedDate)}{a.requestedTimeStart ? ` at ${a.requestedTimeStart}` : ''}</p>}
                          <div className={`mt-3 rounded-xl border px-3 py-2 ${waitingReview ? 'bg-amber-50 dark:bg-amber-500/12 border-amber-100 dark:border-amber-500/30' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700'}`}>
                            <p className={`text-xs font-semibold ${waitingReview ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                              {appointmentNextStep(a)}
                            </p>
                          </div>
                          {a.patientRequestNote && <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">{a.patientRequestNote}</p>}
                          {a.notes && <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">{a.notes}</p>}
                          {a.staffNote && <p className="text-xs text-teal-700 dark:text-teal-400 mt-2 bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 rounded-lg px-3 py-2">{a.staffNote}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {a.status === 'Scheduled' && (
                            <div className="flex flex-col gap-1.5">
                              <button onClick={() => openAppointmentChange(a, 'reschedule')} className="btn-ghost text-xs py-1.5 px-3 justify-center">
                                <RotateCcw size={13} /> Reschedule
                              </button>
                              <button onClick={() => openAppointmentChange(a, 'cancel')} className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5">
                                <X size={13} /> Cancel
                              </button>
                            </div>
                          )}
                        </div>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </>
            )}

            {page === 'prescriptions' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">My Prescriptions</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Medication instructions shared by your care team.</p>
                  </div>
                  {activeRx.length > 0 && (
                    <span className="rounded-xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-400">
                      {activeRx.length} active
                    </span>
                  )}
                </div>
                {myRx.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center mb-4">
                      <Pill size={26} className="text-teal-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No prescriptions found</p>
                    <p className="text-xs mt-1 max-w-sm">Prescriptions from your doctor will appear here after they are added to your record.</p>
                  </div>
                ) : (
                  <>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {myRx.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r => (
                      <PrescriptionCard key={r.id} prescription={r} />
                    ))}
                  </div>
                  <div className="hidden">
                    {myRx.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">Prescription</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600">Dr. {r.doctorName} - {r.date ? formatDate(r.date) : '-'}</p>
                          </div>
                          <Badge status={r.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(r.medications||[]).map((m, i) => (
                            <div key={i} className="bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 rounded-xl px-3 py-2 text-xs">
                              <p className="font-bold text-teal-700">{m.name} <span className="font-normal text-slate-600 dark:text-slate-400">{m.dosage}</span></p>
                              <p className="text-slate-400 dark:text-slate-600">{m.frequency} - {m.duration}</p>
                            </div>
                          ))}
                          {(!r.medications || r.medications.length === 0) && (
                            <p className="text-xs text-slate-500">{typeof r.medications === 'string' ? r.medications : 'No medication details'}</p>
                          )}
                        </div>
                        {r.notes && <p className="mt-3 text-xs text-slate-500 italic pt-2 border-t border-slate-50 dark:border-slate-800 flex items-start gap-1.5"><NotebookPen size={13} className="mt-0.5 flex-shrink-0" /> <span>{r.notes}</span></p>}
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </>
            )}

            {page === 'lab' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Lab Results</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Results shared by the hospital laboratory.</p>
                  </div>
                  {abnormalLabs.length > 0 && (
                    <span className="rounded-xl bg-red-50 dark:bg-red-500/12 border border-red-100 dark:border-red-500/30 px-3 py-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                      {abnormalLabs.length} need attention
                    </span>
                  )}
                </div>
                {myLabs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/12 flex items-center justify-center mb-4">
                      <FlaskConical size={26} className="text-violet-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No lab results found</p>
                    <p className="text-xs mt-1 max-w-sm">Lab results will appear here when the hospital shares them with you.</p>
                  </div>
                ) : (
                  <>
                  <div className="flex flex-col gap-3">
                    {myLabs.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(l => (
                      <LabResultCard key={l.id} lab={l} />
                    ))}
                  </div>
                  <div className="hidden">
                    {myLabs.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(l => (
                      <div key={l.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-4 sm:p-5 ${l.status === 'Abnormal' ? 'border-red-200 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
                        {l.status === 'Abnormal' && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold mb-2">
                            <AlertCircle size={13} /> Abnormal Result - Please consult your doctor
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{l.testName}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-600">{l.category} - {l.date ? formatDate(l.date) : '-'}</p>
                          </div>
                          <Badge status={l.status} />
                        </div>
                        {(l.result || l.normalRange) && (
                          <div className="mt-3 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                            {l.result && <div><p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">Result</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{l.result}</p></div>}
                            {l.normalRange && <div><p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">Normal Range</p><p className="text-sm text-slate-600 dark:text-slate-400">{l.normalRange}</p></div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </>
            )}

            {page === 'billing' && (
              <>
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">My Bills</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Review outstanding invoices and payment history.</p>
                  </div>
                  {pendingBills.length > 0 && (
                    <button onClick={() => openPayment(pendingBills[0])} className="btn-primary">
                      <CreditCard size={15} /> Pay Outstanding
                    </button>
                  )}
                </div>
                {myBills.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/12 flex items-center justify-center mb-4">
                      <CreditCard size={26} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No bills found</p>
                    <p className="text-xs mt-1 max-w-sm">Invoices from the hospital will appear here when they are available.</p>
                  </div>
                ) : (
                  <>
                  <div className="flex flex-col gap-4 sm:gap-5">
                    <div className={`rounded-2xl sm:rounded-3xl border p-4 sm:p-6 ${pendingTotal > 0 ? 'bg-amber-50 dark:bg-amber-500/12 border-amber-200 dark:border-amber-500/30' : 'bg-emerald-50 dark:bg-emerald-500/12 border-emerald-200 dark:border-emerald-500/30'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-wide ${pendingTotal > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>Outstanding Balance</p>
                          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(pendingTotal, settings?.currency)}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{pendingBills.length} unpaid invoice{pendingBills.length === 1 ? '' : 's'} - {paidBills.length} paid</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:w-56">
                          <div className="rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-white/80 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-400 dark:text-slate-600 font-bold uppercase">Unpaid</p>
                            <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{pendingBills.length}</p>
                          </div>
                          <div className="rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-white/80 dark:border-slate-700 px-3 py-2">
                            <p className="text-[11px] text-slate-400 dark:text-slate-600 font-bold uppercase">Paid</p>
                            <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200">{paidBills.length}</p>
                          </div>
                        </div>
                      </div>
                      {pendingBills.length > 0 && (
                        <div className="mt-4 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-white/80 dark:border-slate-700 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
                          Oldest outstanding: <span className="font-bold text-slate-800 dark:text-slate-200">{oldestPendingBill?.description || 'Medical services'}</span>. Pay the oldest balance first to keep billing clean.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Outstanding</p>
                        {pendingBills.length === 0 && <span className="text-xs font-semibold text-emerald-600">All caught up</span>}
                      </div>
                      {pendingBills.length === 0 ? (
                        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/12 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                          You do not have any outstanding invoices.
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {pendingBills.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(i => (
                            <BillCard key={i.id} invoice={i} payable settings={settings} onPay={openPayment} />
                          ))}
                        </div>
                      )}
                    </div>

                    {paidBills.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Payment History</p>
                        <div className="flex flex-col gap-3">
                          {paidBills.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(i => (
                            <BillCard key={i.id} invoice={i} payable={false} settings={settings} onPay={openPayment} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="hidden">
                    {myBills.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(i => {
                      const payable = ['Pending', 'Overdue'].includes(i.status)
                      return (
                      <div key={i.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${i.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/12' : 'bg-amber-50 dark:bg-amber-500/12'}`}>
                          <FileText size={16} className={i.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">Invoice #{i.invoiceNumber || i.id?.slice(0,8)}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-600">{i.date ? formatDate(i.date) : '-'}</p>
                          {i.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{i.description}</p>}
                        </div>
                        <div className="sm:text-right flex-shrink-0">
                          <p className="font-extrabold text-slate-800 dark:text-slate-200 text-base sm:text-lg">{formatCurrency(i.totalAmount || i.total || 0, settings?.currency)}</p>
                          <Badge status={i.status} />
                          {payable && (
                            <button
                              onClick={() => openPayment(i)}
                              className="btn-primary text-xs py-1.5 px-3 mt-2 w-full sm:w-auto justify-center"
                            >
                              <CreditCard size={13} /> Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
                  </>
                )}
              </>
            )}

            {page === 'documents' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">My Documents</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Upload files and follow staff review decisions.</p>
                  </div>
                  <button onClick={openDocumentUpload} className="btn-primary">
                    <Upload size={15} /> Upload Document
                  </button>
                </div>
                {myDocs.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/12 flex items-center justify-center mb-4">
                      <FileText size={26} className="text-violet-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No documents found</p>
                    <p className="text-xs mt-1 max-w-sm">Upload insurance cards, referral letters, previous results, or any file the hospital asks for.</p>
                    <button onClick={openDocumentUpload} className="btn-primary text-xs mt-4">
                      <Upload size={13} /> Upload First Document
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
                      <StatCard icon={FileText} label="Total Files" value={myDocs.length} color="violet" />
                      <StatCard icon={Clock} label="In Review" value={pendingDocReviews.length} color={pendingDocReviews.length ? 'amber' : 'emerald'} />
                      <StatCard icon={AlertCircle} label="Needs Fix" value={rejectedDocs.length} color={rejectedDocs.length ? 'red' : 'emerald'} />
                      <StatCard icon={CheckCircle} label="Available" value={approvedDocs.length} color="emerald" />
                    </div>
                    {rejectedDocs.length > 0 && (
                      <div className="mb-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/12 px-3.5 py-3 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-700 dark:text-red-400">Document action required</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{rejectedDocs.length} upload{rejectedDocs.length === 1 ? '' : 's'} need corrected files.</p>
                          </div>
                        </div>
                        <button onClick={() => openCorrectedDocumentUpload(rejectedDocs[0])} className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0">
                          <Upload size={13} /> Fix First
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                    {myDocs.sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(d => {
                      const reviewStatus = d.reviewStatus || (d.patientUploaded ? 'Pending Review' : 'Available')
                      const rejected = reviewStatus === 'Rejected'
                      return (
                      <div key={d.id} className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 ${rejected ? 'border-red-200 dark:border-red-500/30' : reviewStatus === 'Pending Review' ? 'border-amber-200 dark:border-amber-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-50 dark:bg-violet-500/12 flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-violet-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{d.title}</p>
                            <Badge status={reviewStatus} />
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-600">{d.type || 'Document'}{d.date ? ` - ${formatDate(d.date)}` : ''}</p>
                          <p className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${rejected ? 'bg-red-50 dark:bg-red-500/12 text-red-700 dark:text-red-400' : reviewStatus === 'Pending Review' ? 'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'}`}>
                            {rejected ? 'Correction needed' : reviewStatus === 'Pending Review' ? 'Waiting for staff review' : 'Ready in portal'}
                          </p>
                          {d.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{d.description}</p>}
                          {d.reviewNote && (
                            <p className={`text-xs mt-2 rounded-lg px-3 py-2 border ${rejected ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/12 border-red-100 dark:border-red-500/30' : 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/12 border-teal-100 dark:border-teal-500/30'}`}>
                              {d.reviewNote}
                            </p>
                          )}
                          {rejected && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                              Please upload a corrected version so staff can review it again.
                            </p>
                          )}
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:items-end flex-shrink-0">
                          {d.url && (
                            <a href={d.url} target="_blank" rel="noreferrer" className="btn-ghost text-xs py-1.5 px-3 justify-center">
                              <ExternalLink size={13} /> Open
                            </a>
                          )}
                          {rejected && (
                            <button onClick={() => openCorrectedDocumentUpload(d)} className="btn-primary text-xs py-1.5 px-3 justify-center">
                              <Upload size={13} /> Upload Corrected
                            </button>
                          )}
                        </div>
                      </div>
                    )})}
                    </div>
                  </>
                )}
              </>
            )}

            {page === 'notifications' && (
              <>
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Notifications</h2>
                    <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Updates from hospital activity and your current records.</p>
                  </div>
                  {patientNotifications.length > 0 && (
                    <button onClick={markAllNotificationsRead} className="btn-ghost text-xs">
                      <CheckCircle size={13} /> Mark All Read
                    </button>
                  )}
                </div>
                {patientNotifications.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <StatCard icon={Bell} label="Unread" value={unreadNotifications} color={unreadNotifications ? 'teal' : 'emerald'} />
                    <StatCard icon={Activity} label="Auto Updates" value={generatedNotifications.length} color="blue" />
                    <StatCard icon={CheckCircle} label="From Staff" value={savedNotifications.length} color="violet" />
                  </div>
                )}
                {unreadNotifications > 0 && (
                  <div className="mb-4 rounded-xl border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/12 px-3.5 py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Bell size={17} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-teal-800 dark:text-teal-300">Updates need review</p>
                        <p className="text-xs text-teal-700 dark:text-teal-400 mt-0.5">{unreadNotifications} unread update{unreadNotifications === 1 ? '' : 's'} from staff activity or your records.</p>
                      </div>
                    </div>
                    <button onClick={markAllNotificationsRead} className="btn-ghost text-xs py-1.5 px-3 flex-shrink-0">
                      <CheckCircle size={13} /> Clear
                    </button>
                  </div>
                )}
                {patientNotifications.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-14 sm:py-20 px-4 sm:px-5 text-center text-slate-400 dark:text-slate-600">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/12 flex items-center justify-center mb-4">
                      <Bell size={26} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications</p>
                    <p className="text-xs mt-1 max-w-sm">Appointment, billing, document, prescription, and lab-result updates will appear here.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {patientNotifications.map(n => (
                      <NotificationCard key={`${n.source}-${n.id}`} notification={n} onOpen={openNotification} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 safe-bottom">
          {NAV.filter(item => MOBILE_NAV_IDS.includes(item.id)).map(({ id, label, icon: Icon }) => {
            const active = page === id
            const hasAlert = (id === 'billing' && pendingBills.length > 0) || (id === 'notifications' && unreadNotifications > 0) || (id === 'timeline' && (pendingDocReviews.length > 0 || rejectedDocs.length > 0))
            return (
              <button key={id} onClick={() => navigate(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors relative min-h-[56px] touch-manipulation
                  ${active ? 'text-teal-600' : 'text-slate-400 dark:text-slate-600'}`}>
                {hasAlert && <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-red-500" />}
                <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-semibold leading-none mt-0.5">{label.split(' ')[0]}</span>
                {active && <span className="absolute bottom-0 w-6 h-0.5 bg-teal-500 rounded-full" />}
              </button>
            )
          })}
        </div>
      </div>

      <Modal open={paymentModal} onClose={() => !payingInvoice && setPaymentModal(false)} title="Pay Invoice" icon={CreditCard} accentColor="teal">
        {selectedInvoice && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-teal-100 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/12 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Amount Due</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(selectedInvoice.totalAmount || selectedInvoice.total || 0, settings?.currency)}
                  </p>
                </div>
                <Badge status={selectedInvoice.status} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                <div className="rounded-xl bg-white/70 dark:bg-slate-900/40 border border-white/80 dark:border-slate-700 px-3 py-2">
                  <p className="text-slate-400 dark:text-slate-600 font-bold uppercase">Invoice</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">#{selectedInvoice.invoiceNumber || selectedInvoice.id?.slice(0,8)}</p>
                </div>
                <div className="rounded-xl bg-white/70 dark:bg-slate-900/40 border border-white/80 dark:border-slate-700 px-3 py-2">
                  <p className="text-slate-400 dark:text-slate-600 font-bold uppercase">Date</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{selectedInvoice.date ? formatDate(selectedInvoice.date) : 'No date'}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                Invoice #{selectedInvoice.invoiceNumber || selectedInvoice.id?.slice(0,8)} - {selectedInvoice.description || 'Medical services'}
              </p>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <FormDropdown
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={PAYMENT_METHODS.map(method => ({ value: method, label: method }))}
              />
            </div>
            <div className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/12 p-3 text-xs text-blue-700 dark:text-blue-400">
              This demo records the invoice as paid in MedCore. No external payment gateway is contacted.
            </div>
            <div className="flex gap-3">
              <button disabled={payingInvoice} onClick={() => setPaymentModal(false)} className="btn-ghost flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"><X size={14} /> Cancel</button>
              <button disabled={payingInvoice} onClick={submitPayment} className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                <CheckCircle size={14} /> {payingInvoice ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={documentModal} onClose={() => !uploadingDocument && setDocumentModal(false)} title="Upload Document" icon={Upload} accentColor="teal">
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-violet-50 dark:bg-violet-500/12 border border-violet-100 dark:border-violet-500/30 p-4">
            <p className="text-sm font-bold text-violet-800 dark:text-violet-300">Share a file with the hospital</p>
            <p className="text-xs text-violet-700/80 dark:text-violet-400 mt-1">Uploaded documents are marked for staff review before they become part of your confirmed record.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">Document Title <span className="text-red-400">*</span></label>
              <input
                className="input-field"
                value={documentForm.title}
                onChange={setDocumentField('title')}
                placeholder="e.g. Insurance card front"
              />
            </div>
            <div>
              <label className="label">Document Type</label>
              <FormDropdown
                value={documentForm.type}
                onChange={v => setDocumentForm(f => ({ ...f, type: v }))}
                options={DOC_TYPES.map(t => ({ value: t, label: t }))}
              />
            </div>
            <div>
              <label className="label">Document Date <span className="text-red-400">*</span></label>
              <DatePicker value={documentForm.date} onChange={v => setDocumentForm(f => ({ ...f, date: v }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Select File</label>
              <input
                className="input-field file:mr-3 file:border-0 file:bg-teal-50 file:text-teal-700 file:font-semibold"
                type="file"
                accept=".pdf,image/*,.doc,.docx"
                onChange={e => handleDocumentFile(e.target.files?.[0])}
              />
              {documentForm.fileName && (
                <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-1">{documentForm.fileName}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Document Link</label>
              <input
                className="input-field"
                type="url"
                value={documentForm.url}
                onChange={setDocumentField('url')}
                placeholder="https://drive.google.com/..."
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">Attach a file directly, or paste a secure link if the file already lives elsewhere.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={documentForm.description}
                onChange={setDocumentField('description')}
                placeholder="Briefly describe what this document contains"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button disabled={uploadingDocument} onClick={() => setDocumentModal(false)} className="btn-ghost flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"><X size={14} /> Cancel</button>
          <button disabled={uploadingDocument} onClick={submitDocumentUpload} className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
            {uploadingDocument ? 'Uploading...' : <><Upload size={14} /> Upload</>}
          </button>
        </div>
      </Modal>

      <Modal
        open={appointmentChangeModal}
        onClose={() => !sendingAppointmentChange && setAppointmentChangeModal(false)}
        title={appointmentChangeType === 'reschedule' ? 'Request Reschedule' : 'Request Cancellation'}
        icon={appointmentChangeType === 'reschedule' ? Calendar : X}
        accentColor={appointmentChangeType === 'reschedule' ? 'teal' : 'red'}
      >
        {selectedAppointment && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedAppointment.type || 'Appointment'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Current: {selectedAppointment.date ? formatDate(selectedAppointment.date) : 'date pending'}{selectedAppointment.timeStart ? ` at ${selectedAppointment.timeStart}` : ''}
              </p>
            </div>
            {appointmentChangeType === 'reschedule' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Preferred Date <span className="text-red-400">*</span></label>
                  <DatePicker value={appointmentChangeForm.date} onChange={v => setAppointmentChangeForm(f => ({ ...f, date: v }))} />
                </div>
                <div>
                  <label className="label">Preferred Time</label>
                  <TimePicker value={appointmentChangeForm.timeStart} onChange={v => setAppointmentChangeForm(f => ({ ...f, timeStart: v }))} />
                </div>
              </div>
            )}
            <div>
              <label className="label">
                Reason {appointmentChangeType === 'cancel' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={appointmentChangeForm.notes}
                onChange={setAppointmentChangeField('notes')}
                placeholder={appointmentChangeType === 'reschedule' ? 'Optional note for the scheduling team' : 'Please tell us why you need to cancel'}
              />
            </div>
            <div className="flex gap-3">
              <button disabled={sendingAppointmentChange} onClick={() => setAppointmentChangeModal(false)} className="btn-ghost flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"><X size={14} /> Cancel</button>
              <button disabled={sendingAppointmentChange} onClick={submitAppointmentChange} className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                {sendingAppointmentChange ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={profileModal} onClose={() => setProfileModal(false)} title="Update Profile" icon={User} accentColor="teal">
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 p-4">
            <p className="text-sm font-bold text-teal-800 dark:text-teal-300">Keep your care details current</p>
            <p className="text-xs text-teal-700/80 dark:text-teal-400 mt-1">Contact, emergency, allergy, and insurance details help staff prepare for visits and follow-ups.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={patientName} src={profileForm.avatar || patientAvatar} size="lg" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile photo</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">JPG or PNG, up to 1.5MB</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <label className={`btn-primary text-xs justify-center cursor-pointer ${uploadingAvatar ? 'opacity-60 pointer-events-none' : ''}`}>
                <Upload size={13} /> {uploadingAvatar ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
              </label>
              {(profileForm.avatar || patientAvatar) && (
                <button type="button" onClick={removeAvatar} disabled={uploadingAvatar} className="btn-ghost text-xs justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input-field" value={profileForm.phone} onChange={setProfileField('phone')} placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label className="label">Insurance</label>
              <input className="input-field" value={profileForm.insurance} onChange={setProfileField('insurance')} placeholder="Provider / policy details" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input-field" value={profileForm.address} onChange={setProfileField('address')} placeholder="Home address" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Emergency Contact</label>
              <input className="input-field" value={profileForm.emergencyContact} onChange={setProfileField('emergencyContact')} placeholder="Name and phone number" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Allergies</label>
              <input className="input-field" value={profileForm.allergies} onChange={setProfileField('allergies')} placeholder="Medication, food, or material allergies" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input-field resize-none" rows={3} value={profileForm.notes} onChange={setProfileField('notes')} placeholder="Anything the hospital should know" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button disabled={savingProfile} onClick={() => setProfileModal(false)} className="btn-ghost flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"><X size={14} /> Cancel</button>
          <button onClick={saveProfile} disabled={savingProfile || !patientProfile} className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
            {savingProfile ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={14} /> Save Profile</>}
          </button>
        </div>
      </Modal>

      <Modal open={requestModal} onClose={() => setRequestModal(false)} title="Request Appointment" icon={Calendar} accentColor="teal">
        <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="rounded-2xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 p-4">
            <p className="text-sm font-bold text-teal-800 dark:text-teal-300">Tell us when you would like to come in</p>
            <p className="text-xs text-teal-700/80 dark:text-teal-400 mt-1">Your request will appear as pending until the hospital confirms the appointment.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Visit Type</label>
              <FormDropdown value={requestForm.type} onChange={v => setRequestForm(f => ({ ...f, type: v }))} options={APPT_TYPES.map(t => ({ value: t, label: t }))} />
            </div>
            <div>
              <label className="label">Preferred Doctor</label>
              <input className="input-field" value={requestForm.doctorName} onChange={setRequestField('doctorName')} placeholder="Optional" />
            </div>
            <div>
              <label className="label">Preferred Date <span className="text-red-400">*</span></label>
              <DatePicker value={requestForm.date} onChange={v => setRequestForm(f => ({ ...f, date: v }))} />
            </div>
            <div>
              <label className="label">Preferred Time</label>
              <TimePicker value={requestForm.timeStart} onChange={v => setRequestForm(f => ({ ...f, timeStart: v }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Reason for Visit <span className="text-red-400">*</span></label>
              <textarea className="input-field resize-none" rows={3} value={requestForm.notes} onChange={setRequestField('notes')} placeholder="Briefly describe why you need an appointment" />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Requests are reviewed by the hospital team before they become scheduled appointments.
          </p>
        </div>
        <div className="flex gap-3 mt-5">
          <button disabled={sendingRequest} onClick={() => setRequestModal(false)} className="btn-ghost flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"><X size={14} /> Cancel</button>
          <button onClick={submitAppointmentRequest} disabled={sendingRequest} className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed">
            {sendingRequest ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Send Request</>}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function QuickAction({ icon: Icon, title, subtitle, tone = 'teal', onClick, action }) {
  const colors = {
    teal:   'bg-teal-50 dark:bg-teal-500/12 text-teal-700 border-teal-100 dark:border-teal-500/30',
    blue:   'bg-blue-50 dark:bg-blue-500/12 text-blue-700 border-blue-100 dark:border-blue-500/30',
    amber:  'bg-amber-50 dark:bg-amber-500/12 text-amber-700 border-amber-100 dark:border-amber-500/30',
    violet: 'bg-violet-50 dark:bg-violet-500/12 text-violet-700 border-violet-100 dark:border-violet-500/30',
  }[tone]

  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-left hover:border-teal-200 dark:hover:border-teal-500/40 hover:shadow-sm transition-all"
    >
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center mb-2.5 sm:mb-3 ${colors}`}>
        <Icon size={17} />
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</p>
      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 leading-relaxed">{subtitle}</p>
      <p className="text-xs font-bold text-teal-600 mt-2.5 sm:mt-3 flex items-center gap-1">
        {action} <ChevronRight size={12} />
      </p>
    </button>
  )
}

function BillCard({ invoice, payable, settings, onPay }) {
  const amount = formatCurrency(invoice.totalAmount || invoice.total || 0, settings?.currency)
  const paid = invoice.status === 'Paid'
  const overdue = invoice.status === 'Overdue'

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 ${overdue ? 'border-red-200 dark:border-red-500/30' : payable ? 'border-amber-200 dark:border-amber-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`w-full sm:w-36 rounded-xl sm:rounded-2xl border px-3.5 sm:px-4 py-3 flex-shrink-0 ${paid ? 'bg-emerald-50 dark:bg-emerald-500/12 border-emerald-100 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : overdue ? 'bg-red-50 dark:bg-red-500/12 border-red-100 dark:border-red-500/30 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-500/12 border-amber-100 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Amount</p>
          <p className="text-lg font-extrabold mt-1">{amount}</p>
          <p className="text-xs mt-1 opacity-80">{invoice.date ? formatDate(invoice.date) : 'No date'}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">Invoice #{invoice.invoiceNumber || invoice.id?.slice(0, 8)}</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{invoice.description || 'Medical services'}</p>
            </div>
            <Badge status={invoice.status} />
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {paid ? 'Payment has been recorded for this invoice.' : overdue ? 'This invoice is overdue. Please complete payment or contact billing.' : 'This invoice is awaiting payment.'}
            </p>
          </div>
        </div>
        {payable && (
          <button onClick={() => onPay(invoice)} className="btn-primary text-xs py-1.5 px-3 justify-center sm:w-28 flex-shrink-0">
            <CreditCard size={13} /> Pay Now
          </button>
        )}
      </div>
    </div>
  )
}

function normalizeMedicationList(medications) {
  if (!medications) return []
  if (Array.isArray(medications)) return medications
  return String(medications)
    .split(/[,;\n]/)
    .map(name => name.trim())
    .filter(Boolean)
    .map(name => ({ name }))
}

function PrescriptionCard({ prescription }) {
  const meds = normalizeMedicationList(prescription.medications)
  const fallback = formatMedications(prescription.medications) || prescription.medication || prescription.drugName || 'Medication details not recorded'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`w-full sm:w-32 rounded-xl sm:rounded-2xl border px-3.5 sm:px-4 py-3 flex-shrink-0 ${prescription.status === 'Active' ? 'bg-teal-50 dark:bg-teal-500/12 border-teal-100 dark:border-teal-500/30 text-teal-700 dark:text-teal-400' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Started</p>
          <p className="text-sm font-extrabold mt-1">{prescription.date ? formatDate(prescription.date) : 'No date'}</p>
          <p className="text-xs mt-1 opacity-80">{prescription.doctorName ? `Dr. ${prescription.doctorName}` : 'Care team'}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Prescription</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{meds.length} medication{meds.length === 1 ? '' : 's'} listed</p>
            </div>
            <Badge status={prescription.status} />
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meds.length > 0 ? meds.map((m, i) => (
              <div key={`${m.name || 'med'}-${i}`} className="rounded-xl bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/20 px-3 py-2">
                <p className="text-sm font-bold text-teal-800 dark:text-teal-300">{m.name || 'Medication'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' - ') || 'Follow instructions from your care team'}
                </p>
              </div>
            )) : (
              <div className="sm:col-span-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-3 py-2 text-xs text-slate-500">
                {fallback}
              </div>
            )}
          </div>
          {prescription.notes && (
            <div className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-500/12 border border-blue-100 dark:border-blue-500/30 px-3 py-2">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">{prescription.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LabResultCard({ lab }) {
  const abnormal = lab.status === 'Abnormal'
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 ${abnormal ? 'border-red-200 dark:border-red-500/30' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className={`w-full sm:w-32 rounded-xl sm:rounded-2xl border px-3.5 sm:px-4 py-3 flex-shrink-0 ${abnormal ? 'bg-red-50 dark:bg-red-500/12 border-red-100 dark:border-red-500/30 text-red-700 dark:text-red-400' : 'bg-violet-50 dark:bg-violet-500/12 border-violet-100 dark:border-violet-500/30 text-violet-700 dark:text-violet-400'}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">Result Date</p>
          <p className="text-sm font-extrabold mt-1">{lab.date ? formatDate(lab.date) : 'No date'}</p>
          <p className="text-xs mt-1 opacity-80">{lab.category || 'Lab test'}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-slate-200">{lab.testName || 'Lab result'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{lab.category || 'Clinical result'}</p>
            </div>
            <Badge status={lab.status} />
          </div>
          {abnormal && (
            <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-500/12 border border-red-100 dark:border-red-500/30 px-3 py-2">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">This result needs attention. Please contact your doctor or the hospital team.</p>
            </div>
          )}
          {(lab.result || lab.normalRange) && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lab.result && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">Your Result</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{lab.result}</p>
                </div>
              )}
              {lab.normalRange && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">Reference Range</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{lab.normalRange}</p>
                </div>
              )}
            </div>
          )}
          {lab.notes && <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">{lab.notes}</p>}
        </div>
      </div>
    </div>
  )
}

function NotificationCard({ notification, onOpen }) {
  const unread = notification.source === 'generated' || !notification.read
  const icons = {
    appointments: Calendar,
    billing: CreditCard,
    lab: FlaskConical,
    prescriptions: Pill,
    documents: FileText,
  }
  const tones = {
    appointments: 'bg-blue-50 dark:bg-blue-500/12 text-blue-600 border-blue-100 dark:border-blue-500/30',
    billing: 'bg-amber-50 dark:bg-amber-500/12 text-amber-600 border-amber-100 dark:border-amber-500/30',
    lab: 'bg-red-50 dark:bg-red-500/12 text-red-600 border-red-100 dark:border-red-500/30',
    prescriptions: 'bg-teal-50 dark:bg-teal-500/12 text-teal-600 border-teal-100 dark:border-teal-500/30',
    documents: 'bg-violet-50 dark:bg-violet-500/12 text-violet-600 border-violet-100 dark:border-violet-500/30',
  }
  const Icon = icons[notification.type] || Bell
  const tone = unread ? (tones[notification.type] || 'bg-teal-50 dark:bg-teal-500/12 text-teal-600 border-teal-100 dark:border-teal-500/30') : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-700'

  return (
    <button
      onClick={() => onOpen(notification)}
      className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4 text-left hover:border-teal-200 dark:hover:border-teal-500/40 transition-colors ${unread ? 'border-teal-200 dark:border-teal-500/30' : 'border-slate-200 dark:border-slate-700'}`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${tone}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base">{notification.title || 'Notification'}</p>
          {unread && <span className="rounded-full bg-teal-50 dark:bg-teal-500/12 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-400">New</span>}
          {notification.source === 'generated' && <span className="rounded-full bg-blue-50 dark:bg-blue-500/12 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">Auto</span>}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
        {notification.createdAt && <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-2">{formatDate(notification.createdAt)}</p>}
      </div>
      {notification.target && <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 mt-3 flex-shrink-0" />}
    </button>
  )
}

function appointmentNextStep(appointment) {
  const messages = {
    Requested: 'Your request is with the scheduling team.',
    'Reschedule Requested': 'Staff will confirm the new time or suggest another slot.',
    'Cancel Requested': 'Staff will review the cancellation request.',
    Scheduled: 'You can reschedule or cancel before the visit.',
    'Checked In': 'You are checked in. Please wait for the care team.',
    'In Progress': 'This visit is currently in progress.',
    Completed: 'This visit has been completed.',
    Cancelled: 'This appointment is no longer active.',
  }
  return messages[appointment.status] || 'The hospital team will update this appointment when needed.'
}

function TimelineItem({ item, compact = false }) {
  const tone = {
    amber:   'bg-amber-50 dark:bg-amber-500/12 text-amber-600 border-amber-200 dark:border-amber-500/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/12 text-emerald-600 border-emerald-200 dark:border-emerald-500/30',
    red:     'bg-red-50 dark:bg-red-500/12 text-red-600 border-red-200 dark:border-red-500/30',
    blue:    'bg-blue-50 dark:bg-blue-500/12 text-blue-600 border-blue-200 dark:border-blue-500/30',
    violet:  'bg-violet-50 dark:bg-violet-500/12 text-violet-600 border-violet-200 dark:border-violet-500/30',
    slate:   'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700',
  }[item.tone || 'slate']

  const Icon = item.icon

  return (
    <div className="relative flex gap-3">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${tone}`}>
        <Icon size={15} />
      </div>
      <div className={`flex-1 min-w-0 ${compact ? 'pb-3' : 'pb-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{item.subtitle}</p>
          </div>
          {item.status && <Badge status={item.status} />}
        </div>
        {item.detail && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{item.detail}</p>}
        {item.note && (
          <p className="text-xs text-teal-700 dark:text-teal-400 mt-2 bg-teal-50 dark:bg-teal-500/12 border border-teal-100 dark:border-teal-500/30 rounded-lg px-3 py-2">
            {item.note}
          </p>
        )}
      </div>
    </div>
  )
}


