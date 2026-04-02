import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, setDoc, getDoc
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'

const state = {
  patients:     [],
  doctors:      [],
  appointments: [],
  departments:  [],
  inventory:    [],
  messages:     [],
  users:        [],
  loading:      true,
}

let _listeners = []
function notify() { _listeners.forEach(fn => fn()) }

let _unsubs = []

export function initSubscriptions() {
  if (_unsubs.length > 0) return

  const qP  = query(collection(db, 'patients'),     orderBy('createdAt', 'desc'))
  const qD  = query(collection(db, 'doctors'),       orderBy('createdAt', 'desc'))
  const qA  = query(collection(db, 'appointments'),  orderBy('createdAt', 'desc'))
  const qDe = query(collection(db, 'departments'),   orderBy('createdAt', 'desc'))
  const qI  = query(collection(db, 'inventory'),     orderBy('createdAt', 'desc'))
  const qM  = query(collection(db, 'messages'),      orderBy('createdAt', 'asc'))
  const qU  = query(collection(db, 'users'),         orderBy('createdAt', 'asc'))

  let loaded = 0
  function checkAll() { if (++loaded >= 7) { state.loading = false; notify() } }

  _unsubs.push(
    onSnapshot(qP,  snap => { state.patients     = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qD,  snap => { state.doctors      = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qA,  snap => { state.appointments = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qDe, snap => { state.departments  = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qI,  snap => { state.inventory    = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qM,  snap => { state.messages     = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qU,  snap => { state.users        = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
  )
}

export function clearSubscriptions() {
  _unsubs.forEach(fn => fn())
  _unsubs = []
  state.patients     = []
  state.doctors      = []
  state.appointments = []
  state.departments  = []
  state.inventory    = []
  state.messages     = []
  state.users        = []
  state.loading      = true
  notify()
}

function stripMeta(data) {
  const { id: _id, createdAt: _c, ...rest } = data
  return rest
}

export async function ensureUserProfile(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:       firebaseUser.uid,
      name:      firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email:     firebaseUser.email,
      role:      'Admin',
      createdAt: new Date().toISOString(),
    })
  }
  return (await getDoc(ref)).data()
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

  async addDepartment(data) {
    return addDoc(collection(db, 'departments'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateDepartment(id, data) {
    await updateDoc(doc(db, 'departments', id), stripMeta(data))
  },
  async deleteDepartment(id) {
    await deleteDoc(doc(db, 'departments', id))
  },

  async addInventoryItem(data) {
    return addDoc(collection(db, 'inventory'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateInventoryItem(id, data) {
    await updateDoc(doc(db, 'inventory', id), stripMeta(data))
  },
  async deleteInventoryItem(id) {
    await deleteDoc(doc(db, 'inventory', id))
  },

  async sendMessage(text, senderName, senderRole) {
    const user = auth.currentUser
    if (!user || !text.trim()) return
    return addDoc(collection(db, 'messages'), {
      text: text.trim(),
      senderId:   user.uid,
      senderName: senderName || user.displayName || 'User',
      senderRole: senderRole || 'Staff',
      createdAt:  new Date().toISOString(),
    })
  },

  async updateUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role })
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
    departments:  state.departments,
    inventory:    state.inventory,
    messages:     state.messages,
    users:        state.users,
    loading:      state.loading,
  }
}
