import { useState, useEffect } from 'react'

function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') || []
  } catch {
    return []
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

let _listeners = []
function notify() { _listeners.forEach(fn => fn()) }

const state = {
  patients: loadFromStorage('hms_patients'),
  doctors: loadFromStorage('hms_doctors'),
  appointments: loadFromStorage('hms_appointments'),
  currentUser: JSON.parse(localStorage.getItem('hms_user') || 'null'),
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const store = {
  getPatients: () => state.patients,
  getDoctors: () => state.doctors,
  getAppointments: () => state.appointments,
  getCurrentUser: () => state.currentUser,

  login(user) {
    state.currentUser = user
    localStorage.setItem('hms_user', JSON.stringify(user))
    notify()
  },
  logout() {
    state.currentUser = null
    localStorage.removeItem('hms_user')
    notify()
  },

  addPatient(data) {
    const p = { id: makeId(), createdAt: new Date().toISOString(), ...data }
    state.patients = [p, ...state.patients]
    saveToStorage('hms_patients', state.patients)
    notify()
    return p
  },
  updatePatient(id, data) {
    state.patients = state.patients.map(p => p.id === id ? { ...p, ...data } : p)
    saveToStorage('hms_patients', state.patients)
    notify()
  },
  deletePatient(id) {
    state.patients = state.patients.filter(p => p.id !== id)
    saveToStorage('hms_patients', state.patients)
    notify()
  },

  addDoctor(data) {
    const d = { id: makeId(), createdAt: new Date().toISOString(), ...data }
    state.doctors = [d, ...state.doctors]
    saveToStorage('hms_doctors', state.doctors)
    notify()
    return d
  },
  updateDoctor(id, data) {
    state.doctors = state.doctors.map(d => d.id === id ? { ...d, ...data } : d)
    saveToStorage('hms_doctors', state.doctors)
    notify()
  },
  deleteDoctor(id) {
    state.doctors = state.doctors.filter(d => d.id !== id)
    saveToStorage('hms_doctors', state.doctors)
    notify()
  },

  addAppointment(data) {
    const a = { id: makeId(), createdAt: new Date().toISOString(), ...data }
    state.appointments = [a, ...state.appointments]
    saveToStorage('hms_appointments', state.appointments)
    notify()
    return a
  },
  updateAppointment(id, data) {
    state.appointments = state.appointments.map(a => a.id === id ? { ...a, ...data } : a)
    saveToStorage('hms_appointments', state.appointments)
    notify()
  },
  deleteAppointment(id) {
    state.appointments = state.appointments.filter(a => a.id !== id)
    saveToStorage('hms_appointments', state.appointments)
    notify()
  },
}

export function useStore() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(f => f !== fn) }
  }, [])
  return {
    patients: state.patients,
    doctors: state.doctors,
    appointments: state.appointments,
    currentUser: state.currentUser,
  }
}
