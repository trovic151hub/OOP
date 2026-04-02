import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'

const state = {
  patients:     [],
  doctors:      [],
  appointments: [],
  loading:      true,
}

let _listeners = []
function notify() { _listeners.forEach(fn => fn()) }

let _unsubs = []

export function initSubscriptions() {
  if (_unsubs.length > 0) return

  const qP = query(collection(db, 'patients'),     orderBy('createdAt', 'desc'))
  const qD = query(collection(db, 'doctors'),       orderBy('createdAt', 'desc'))
  const qA = query(collection(db, 'appointments'),  orderBy('createdAt', 'desc'))

  let pLoaded = false, dLoaded = false, aLoaded = false
  function checkAll() {
    if (pLoaded && dLoaded && aLoaded) { state.loading = false; notify() }
  }

  _unsubs.push(
    onSnapshot(qP, snap => {
      state.patients = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      pLoaded = true; checkAll(); notify()
    }, console.error),
    onSnapshot(qD, snap => {
      state.doctors = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      dLoaded = true; checkAll(); notify()
    }, console.error),
    onSnapshot(qA, snap => {
      state.appointments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      aLoaded = true; checkAll(); notify()
    }, console.error),
  )
}

export function clearSubscriptions() {
  _unsubs.forEach(fn => fn())
  _unsubs = []
  state.patients     = []
  state.doctors      = []
  state.appointments = []
  state.loading      = true
  notify()
}

function stripMeta(data) {
  const { id: _id, createdAt: _c, ...rest } = data
  return rest
}

export const store = {
  async logout() {
    clearSubscriptions()
    await signOut(auth)
  },

  async addPatient(data) {
    return addDoc(collection(db, 'patients'), { ...data, createdAt: new Date().toISOString() })
  },
  async updatePatient(id, data) {
    await updateDoc(doc(db, 'patients', id), stripMeta(data))
  },
  async deletePatient(id) {
    await deleteDoc(doc(db, 'patients', id))
  },

  async addDoctor(data) {
    return addDoc(collection(db, 'doctors'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateDoctor(id, data) {
    await updateDoc(doc(db, 'doctors', id), stripMeta(data))
  },
  async deleteDoctor(id) {
    await deleteDoc(doc(db, 'doctors', id))
  },

  async addAppointment(data) {
    return addDoc(collection(db, 'appointments'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateAppointment(id, data) {
    await updateDoc(doc(db, 'appointments', id), stripMeta(data))
  },
  async deleteAppointment(id) {
    await deleteDoc(doc(db, 'appointments', id))
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
    patients:     state.patients,
    doctors:      state.doctors,
    appointments: state.appointments,
    loading:      state.loading,
  }
}
