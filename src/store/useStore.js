import { useState, useEffect } from 'react'
import { api } from '../api/client'

const DEFAULT_SETTINGS = {
  hospitalName: 'MedCore Hospital',
  tagline: 'Excellence in Healthcare',
  address: '',
  phone: '',
  email: '',
  website: '',
  timezone: 'UTC',
  currency: 'USD',
  workingHoursStart: '08:00',
  workingHoursEnd: '18:00',
  appointmentDuration: 30,
  logo: '',
}

// [state key, API path] for the 17 list collections + settings (18 total),
// mirroring the 18 onSnapshot subscriptions this store used to hold.
const COLLECTIONS = [
  ['patients', '/patients'],
  ['doctors', '/doctors'],
  ['appointments', '/appointments'],
  ['departments', '/departments'],
  ['inventory', '/inventory'],
  ['messages', '/messages'],
  ['users', '/users'],
  ['medicalRecords', '/medical-records'],
  ['billing', '/billing'],
  ['shifts', '/shifts'],
  ['rooms', '/rooms'],
  ['labResults', '/lab-results'],
  ['prescriptions', '/prescriptions'],
  ['expenses', '/expenses'],
  ['documents', '/documents'],
  ['claims', '/claims'],
  ['pharmacyOrders', '/pharmacy-orders'],
]

const state = {
  patients:       [],
  doctors:        [],
  appointments:   [],
  departments:    [],
  inventory:      [],
  messages:       [],
  users:          [],
  medicalRecords: [],
  billing:        [],
  shifts:         [],
  rooms:          [],
  labResults:     [],
  prescriptions:  [],
  expenses:       [],
  documents:      [],
  claims:         [],
  pharmacyOrders: [],
  settings:       { ...DEFAULT_SETTINGS },
  loading:        true,
  currentUser:    null,
}

let _listeners = []
function notify() { _listeners.forEach(fn => fn()) }

let _initialized = false

async function refetch(key, path) {
  try {
    state[key] = await api.get(path)
  } catch (err) {
    console.error(err)
  }
  notify()
}

async function refetchSettings() {
  try {
    state.settings = { ...DEFAULT_SETTINGS, ...(await api.get('/settings')) }
  } catch (err) {
    console.error(err)
  }
  notify()
}

const COLLECTION_PATHS = Object.fromEntries(COLLECTIONS)

// Lets a page poll one collection for near-live updates (e.g. the Waiting
// Room queue picking up another receptionist's check-ins) without a full
// Socket.IO layer — call on an interval, no-op if the store isn't loaded yet.
export function refetchCollection(key) {
  const path = COLLECTION_PATHS[key]
  if (!path) return Promise.resolve()
  return refetch(key, path)
}

export async function initSubscriptions() {
  if (_initialized) return
  _initialized = true
  await Promise.all([
    ...COLLECTIONS.map(([key, path]) => refetch(key, path)),
    refetchSettings(),
  ])
  state.loading = false
  notify()
}

export function clearSubscriptions() {
  _initialized = false
  Object.assign(state, {
    patients: [], doctors: [], appointments: [], departments: [],
    inventory: [], messages: [], users: [], medicalRecords: [],
    billing: [], shifts: [], rooms: [], labResults: [],
    prescriptions: [], expenses: [], documents: [], claims: [],
    pharmacyOrders: [], settings: { ...DEFAULT_SETTINGS }, loading: true,
    currentUser: null,
  })
  notify()
}

export function setCurrentUser(user) {
  state.currentUser = user
  notify()
}

// One-shot handoff for "open this specific DM" — set by a notification click,
// read once by the Messages page on mount, then cleared. Doesn't need to be
// part of the reactive store since nothing else observes it.
let _pendingChatTarget = null
export function setPendingChatTarget(uid) { _pendingChatTarget = uid }
export function consumePendingChatTarget() {
  const v = _pendingChatTarget
  _pendingChatTarget = null
  return v
}

export async function ensureUserProfile() {
  const { user } = await api.get('/auth/me')
  return user
}

export async function fetchAuditLog() {
  return api.get('/audit-log?limit=200')
}

async function addItem(key, path, data) {
  const created = await api.post(path, data)
  await refetch(key, path)
  return created
}
async function updateItem(key, path, id, data) {
  await api.put(`${path}/${id}`, data)
  await refetch(key, path)
}
async function deleteItem(key, path, id) {
  await api.del(`${path}/${id}`)
  await refetch(key, path)
}

export const store = {
  async logout() {
    try { await api.post('/auth/logout') } catch (_) {}
    clearSubscriptions()
  },

  async updateSettings(data) {
    await api.put('/settings', data)
    await refetchSettings()
  },

  async addPatient(data)          { return addItem('patients', '/patients', data) },
  async updatePatient(id, data)   { return updateItem('patients', '/patients', id, data) },
  async deletePatient(id) {
    await deleteItem('patients', '/patients', id)
    await Promise.all([refetch('appointments', '/appointments'), refetch('medicalRecords', '/medical-records')])
  },

  async addDoctor(data)          { return addItem('doctors', '/doctors', data) },
  async updateDoctor(id, data)   { return updateItem('doctors', '/doctors', id, data) },
  async deleteDoctor(id) {
    await deleteItem('doctors', '/doctors', id)
    await Promise.all([refetch('appointments', '/appointments'), refetch('shifts', '/shifts')])
  },

  async addAppointment(data)        { return addItem('appointments', '/appointments', data) },
  async updateAppointment(id, data) { return updateItem('appointments', '/appointments', id, data) },
  async deleteAppointment(id)       { return deleteItem('appointments', '/appointments', id) },

  async addDepartment(data)        { return addItem('departments', '/departments', data) },
  async updateDepartment(id, data) { return updateItem('departments', '/departments', id, data) },
  async deleteDepartment(id)       { return deleteItem('departments', '/departments', id) },

  async addInventoryItem(data)        { return addItem('inventory', '/inventory', data) },
  async updateInventoryItem(id, data) { return updateItem('inventory', '/inventory', id, data) },
  async deleteInventoryItem(id)       { return deleteItem('inventory', '/inventory', id) },

  async deductInventoryForPrescription(prescriptionText) {
    if (!prescriptionText || !prescriptionText.trim()) return []
    const { deducted } = await api.post('/inventory/deduct-for-prescription', { prescriptionText })
    await refetch('inventory', '/inventory')
    return deducted
  },

  async sendMessage(text, senderName, senderRole, recipientId = null) {
    if (!text || !text.trim()) return
    const created = await api.post('/messages', { text: text.trim(), senderName, senderRole, recipientId })
    await refetch('messages', '/messages')
    return created
  },

  async updateUserProfile(uid, data) { return updateItem('users', '/users', uid, data) },

  async updateLastSeen(uid) {
    try { await api.put(`/users/${uid}/last-seen`) } catch (_) {}
  },

  async updateUserRole(uid, role) {
    await api.put(`/users/${uid}/role`, { role })
    await Promise.all([refetch('users', '/users'), refetch('doctors', '/doctors')])
  },

  async linkDoctorToUser(doctorId, uid) {
    await api.put(`/doctors/${doctorId}/link-user`, { userId: uid })
    await refetch('doctors', '/doctors')
  },

  // Creates the login account and doctor profile together, already linked.
  // Returns { doctor, tempPassword } — the temp password is shown to the
  // Admin once, at creation time, then never retrievable again.
  async onboardDoctor(data) {
    const result = await api.post('/doctors/onboard', data)
    await Promise.all([refetch('doctors', '/doctors'), refetch('users', '/users')])
    return result
  },

  async addRoom(data)        { return addItem('rooms', '/rooms', data) },
  async updateRoom(id, data) { return updateItem('rooms', '/rooms', id, data) },
  async deleteRoom(id)       { return deleteItem('rooms', '/rooms', id) },

  async addLabResult(data)        { return addItem('labResults', '/lab-results', data) },
  async updateLabResult(id, data) { return updateItem('labResults', '/lab-results', id, data) },
  async deleteLabResult(id)       { return deleteItem('labResults', '/lab-results', id) },

  async addMedicalRecord(data)        { return addItem('medicalRecords', '/medical-records', data) },
  async updateMedicalRecord(id, data) { return updateItem('medicalRecords', '/medical-records', id, data) },
  async deleteMedicalRecord(id)       { return deleteItem('medicalRecords', '/medical-records', id) },

  async addInvoice(data)        { return addItem('billing', '/billing', data) },
  async updateInvoice(id, data) { return updateItem('billing', '/billing', id, data) },
  async deleteInvoice(id)       { return deleteItem('billing', '/billing', id) },

  async addShift(data)        { return addItem('shifts', '/shifts', data) },
  async updateShift(id, data) { return updateItem('shifts', '/shifts', id, data) },
  async deleteShift(id)       { return deleteItem('shifts', '/shifts', id) },

  async addPrescription(data)        { return addItem('prescriptions', '/prescriptions', data) },
  async updatePrescription(id, data) { return updateItem('prescriptions', '/prescriptions', id, data) },
  async deletePrescription(id)       { return deleteItem('prescriptions', '/prescriptions', id) },

  async addExpense(data)        { return addItem('expenses', '/expenses', data) },
  async updateExpense(id, data) { return updateItem('expenses', '/expenses', id, data) },
  async deleteExpense(id)       { return deleteItem('expenses', '/expenses', id) },

  async addDocument(data)        { return addItem('documents', '/documents', data) },
  async updateDocument(id, data) { return updateItem('documents', '/documents', id, data) },
  async deleteDocument(id)       { return deleteItem('documents', '/documents', id) },

  async addClaim(data)        { return addItem('claims', '/claims', data) },
  async updateClaim(id, data) { return updateItem('claims', '/claims', id, data) },
  async deleteClaim(id)       { return deleteItem('claims', '/claims', id) },

  async addPharmacyOrder(data)        { return addItem('pharmacyOrders', '/pharmacy-orders', data) },
  async updatePharmacyOrder(id, data) { return updateItem('pharmacyOrders', '/pharmacy-orders', id, data) },
  async deletePharmacyOrder(id)       { return deleteItem('pharmacyOrders', '/pharmacy-orders', id) },
}

export function useStore() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(f => f !== fn) }
  }, [])
  return {
    patients:       state.patients,
    doctors:        state.doctors,
    appointments:   state.appointments,
    departments:    state.departments,
    inventory:      state.inventory,
    messages:       state.messages,
    users:          state.users,
    medicalRecords: state.medicalRecords,
    billing:        state.billing,
    invoices:       state.billing,
    shifts:         state.shifts,
    rooms:          state.rooms,
    labResults:     state.labResults,
    prescriptions:  state.prescriptions,
    expenses:       state.expenses,
    documents:      state.documents,
    claims:         state.claims,
    pharmacyOrders: state.pharmacyOrders,
    settings:       state.settings,
    loading:        state.loading,
    currentUser:    state.currentUser,
  }
}
