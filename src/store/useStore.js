import { useState, useEffect } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, where, setDoc, getDoc, getDocs, limit
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'

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
  loading:        true,
}

let _listeners = []
function notify() { _listeners.forEach(fn => fn()) }

let _unsubs = []

async function logAudit(action, entity, entityName) {
  try {
    const user = auth.currentUser
    if (!user) return
    await addDoc(collection(db, 'auditLog'), {
      action,
      entity,
      entityName: entityName || 'Unknown',
      userId:     user.uid,
      userName:   user.displayName || user.email || 'System',
      timestamp:  new Date().toISOString(),
    })
  } catch (_) {}
}

export function initSubscriptions() {
  if (_unsubs.length > 0) return

  const qP  = query(collection(db, 'patients'),       orderBy('createdAt', 'desc'))
  const qD  = query(collection(db, 'doctors'),         orderBy('createdAt', 'desc'))
  const qA  = query(collection(db, 'appointments'),    orderBy('createdAt', 'desc'))
  const qDe = query(collection(db, 'departments'),     orderBy('createdAt', 'desc'))
  const qI  = query(collection(db, 'inventory'),       orderBy('createdAt', 'desc'))
  const qM  = query(collection(db, 'messages'),        orderBy('createdAt', 'asc'))
  const qU  = query(collection(db, 'users'),           orderBy('createdAt', 'asc'))
  const qR  = query(collection(db, 'medicalRecords'),  orderBy('date', 'desc'))
  const qB  = query(collection(db, 'billing'),         orderBy('createdAt', 'desc'))
  const qS  = query(collection(db, 'shifts'),          orderBy('createdAt', 'asc'))

  let loaded = 0
  function checkAll() { if (++loaded >= 10) { state.loading = false; notify() } }

  _unsubs.push(
    onSnapshot(qP,  snap => { state.patients       = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qD,  snap => { state.doctors        = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qA,  snap => { state.appointments   = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qDe, snap => { state.departments    = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qI,  snap => { state.inventory      = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qM,  snap => { state.messages       = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qU,  snap => { state.users          = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qR,  snap => { state.medicalRecords = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qB,  snap => { state.billing        = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
    onSnapshot(qS,  snap => { state.shifts         = snap.docs.map(d => ({ id: d.id, ...d.data() })); checkAll(); notify() }, console.error),
  )
}

export function clearSubscriptions() {
  _unsubs.forEach(fn => fn())
  _unsubs = []
  Object.assign(state, {
    patients: [], doctors: [], appointments: [], departments: [],
    inventory: [], messages: [], users: [], medicalRecords: [],
    billing: [], shifts: [], loading: true,
  })
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
    const existingUsers = await getDocs(collection(db, 'users'))
    const isFirstUser = existingUsers.empty
    await setDoc(ref, {
      uid:       firebaseUser.uid,
      name:      firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email:     firebaseUser.email,
      role:      isFirstUser ? 'Admin' : 'Receptionist',
      createdAt: new Date().toISOString(),
    })
  }
  return (await getDoc(ref)).data()
}

export async function fetchAuditLog() {
  const q = query(collection(db, 'auditLog'), orderBy('timestamp', 'desc'), limit(200))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const store = {
  async logout() {
    clearSubscriptions()
    await signOut(auth)
  },

  async addPatient(data) {
    const ref = await addDoc(collection(db, 'patients'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Patient', data.name)
    return ref
  },
  async updatePatient(id, data) {
    await updateDoc(doc(db, 'patients', id), stripMeta(data))
    logAudit('Updated', 'Patient', data.name)
  },
  async deletePatient(id, name) {
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('patientName', '==', name)))
    await Promise.all(apptSnap.docs.map(d => deleteDoc(d.ref)))
    const recSnap = await getDocs(query(collection(db, 'medicalRecords'), where('patientId', '==', id)))
    await Promise.all(recSnap.docs.map(d => deleteDoc(d.ref)))
    await deleteDoc(doc(db, 'patients', id))
    logAudit('Deleted', 'Patient', name || id)
  },

  async addDoctor(data) {
    const ref = await addDoc(collection(db, 'doctors'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Doctor', data.name)
    return ref
  },
  async updateDoctor(id, data) {
    await updateDoc(doc(db, 'doctors', id), stripMeta(data))
    logAudit('Updated', 'Doctor', data.name)
  },
  async deleteDoctor(id, name) {
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('doctorName', '==', name)))
    await Promise.all(apptSnap.docs.map(d => deleteDoc(d.ref)))
    const shiftSnap = await getDocs(query(collection(db, 'shifts'), where('doctorId', '==', id)))
    await Promise.all(shiftSnap.docs.map(d => deleteDoc(d.ref)))
    await deleteDoc(doc(db, 'doctors', id))
    logAudit('Deleted', 'Doctor', name || id)
  },

  async addAppointment(data) {
    const ref = await addDoc(collection(db, 'appointments'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Appointment', `${data.patientName} w/ ${data.doctorName}`)
    return ref
  },
  async updateAppointment(id, data) {
    await updateDoc(doc(db, 'appointments', id), stripMeta(data))
  },
  async deleteAppointment(id, label) {
    await deleteDoc(doc(db, 'appointments', id))
    logAudit('Deleted', 'Appointment', label || id)
  },

  async addDepartment(data) {
    const ref = await addDoc(collection(db, 'departments'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Department', data.name)
    return ref
  },
  async updateDepartment(id, data) {
    await updateDoc(doc(db, 'departments', id), stripMeta(data))
    logAudit('Updated', 'Department', data.name)
  },
  async deleteDepartment(id, name) {
    await deleteDoc(doc(db, 'departments', id))
    logAudit('Deleted', 'Department', name || id)
  },

  async addInventoryItem(data) {
    const ref = await addDoc(collection(db, 'inventory'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Inventory', data.name)
    return ref
  },
  async updateInventoryItem(id, data) {
    await updateDoc(doc(db, 'inventory', id), stripMeta(data))
    logAudit('Updated', 'Inventory', data.name)
  },
  async deleteInventoryItem(id, name) {
    await deleteDoc(doc(db, 'inventory', id))
    logAudit('Deleted', 'Inventory', name || id)
  },

  async deductInventoryForPrescription(prescriptionText) {
    if (!prescriptionText || !prescriptionText.trim()) return []
    const snap = await getDocs(collection(db, 'inventory'))
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const lower = prescriptionText.toLowerCase()
    const deducted = []
    for (const item of items) {
      if (item.name && lower.includes(item.name.toLowerCase()) && (item.stock || 0) > 0) {
        const newStock = Math.max(0, (item.stock || 0) - 1)
        await updateDoc(doc(db, 'inventory', item.id), { stock: newStock })
        logAudit('Deducted', 'Inventory', `${item.name} (Rx)`)
        deducted.push(item.name)
      }
    }
    return deducted
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
    logAudit('Role Changed', 'User', `${uid} → ${role}`)
  },

  async addMedicalRecord(data) {
    return addDoc(collection(db, 'medicalRecords'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateMedicalRecord(id, data) {
    await updateDoc(doc(db, 'medicalRecords', id), stripMeta(data))
  },
  async deleteMedicalRecord(id) {
    await deleteDoc(doc(db, 'medicalRecords', id))
  },

  async addInvoice(data) {
    const ref = await addDoc(collection(db, 'billing'), { ...data, createdAt: new Date().toISOString() })
    logAudit('Added', 'Invoice', `${data.patientName} - $${data.total}`)
    return ref
  },
  async updateInvoice(id, data) {
    await updateDoc(doc(db, 'billing', id), stripMeta(data))
  },
  async deleteInvoice(id, label) {
    await deleteDoc(doc(db, 'billing', id))
    logAudit('Deleted', 'Invoice', label || id)
  },

  async addShift(data) {
    return addDoc(collection(db, 'shifts'), { ...data, createdAt: new Date().toISOString() })
  },
  async updateShift(id, data) {
    await updateDoc(doc(db, 'shifts', id), stripMeta(data))
  },
  async deleteShift(id) {
    await deleteDoc(doc(db, 'shifts', id))
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
    patients:       state.patients,
    doctors:        state.doctors,
    appointments:   state.appointments,
    departments:    state.departments,
    inventory:      state.inventory,
    messages:       state.messages,
    users:          state.users,
    medicalRecords: state.medicalRecords,
    billing:        state.billing,
    shifts:         state.shifts,
    loading:        state.loading,
  }
}
