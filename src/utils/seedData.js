import { collection, addDoc, setDoc, doc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}
function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}
function todayStr() { return new Date().toISOString().slice(0, 10) }
function ts(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() - offsetDays); return d.toISOString()
}
function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d); mon.setDate(diff)
  return mon.toISOString().slice(0, 10)
}

async function collectionEmpty(name) {
  const snap = await getDocs(collection(db, name))
  return snap.empty
}

async function addMany(col, items) {
  return Promise.all(items.map(item => addDoc(collection(db, col), item)))
}

export async function seedDatabase(showToast) {
  try {
    showToast?.('Seeding demo data…', 'info')

    const weekStart = getWeekStart()

    // ── SETTINGS ──────────────────────────────────────────────────
    await setDoc(doc(db, 'settings', 'hospital'), {
      hospitalName:        'MedCore General Hospital',
      tagline:             'Excellence in Healthcare, Compassion in Care',
      licenseNumber:       'MED-2024-00147',
      address:             '1250 Medical Center Drive, Houston, TX 77030',
      phone:               '+1 (713) 555-0192',
      email:               'info@medcorehospital.com',
      website:             'https://www.medcorehospital.com',
      emergencyPhone:      '+1 (713) 555-0911',
      timezone:            'America/Chicago',
      currency:            'USD',
      workingHoursStart:   '07:00',
      workingHoursEnd:     '20:00',
      appointmentDuration: 30,
      maxPatientsPerDay:   120,
      bedCapacity:         250,
      taxRate:             8.5,
      invoicePrefix:       'INV-',
      paymentTerms:        'Net 30',
      invoiceNotes:        'Thank you for choosing MedCore General Hospital. Please make payment within 30 days of invoice date. For billing inquiries call +1 (713) 555-0192 ext. 4.',
    }, { merge: true })

    // ── DEPARTMENTS ────────────────────────────────────────────────
    const deptEmpty = await collectionEmpty('departments')
    if (deptEmpty) {
      await addMany('departments', [
        { name: 'Emergency Medicine', head: 'Dr. Michael Torres', staffCount: 14, description: '24/7 emergency and trauma care for critical patients.', color: 'red',    createdAt: ts(30) },
        { name: 'Cardiology',         head: 'Dr. Sarah Chen',    staffCount: 11, description: 'Diagnosis and treatment of heart and cardiovascular diseases.', color: 'rose',  createdAt: ts(29) },
        { name: 'Neurology',          head: 'Dr. Emily Watson',  staffCount: 8,  description: 'Management of nervous system disorders and neurological conditions.', color: 'purple', createdAt: ts(28) },
        { name: 'Pediatrics',         head: 'Dr. James Okonkwo', staffCount: 9,  description: 'Comprehensive medical care for children from birth to adolescence.', color: 'blue',  createdAt: ts(27) },
        { name: 'Orthopedics',        head: 'Dr. David Kim',     staffCount: 7,  description: 'Treatment of musculoskeletal injuries, fractures and joint disorders.', color: 'amber', createdAt: ts(26) },
        { name: 'Radiology',          head: 'Dr. Priya Sharma',  staffCount: 6,  description: 'Diagnostic imaging including MRI, CT, X-Ray and ultrasound.', color: 'teal',  createdAt: ts(25) },
      ])
    }

    // ── DOCTORS ───────────────────────────────────────────────────
    const docEmpty = await collectionEmpty('doctors')
    if (docEmpty) {
      await addMany('doctors', [
        { name: 'Dr. Sarah Chen',    specialty: 'Cardiologist',          department: 'Cardiology',         email: 'sarah.chen@medcore.com',    phone: '+1 (713) 555-0201', availability: 'Available',   experience: '14 years', schedule: 'Mon-Fri  08:00–16:00', about: 'Board-certified cardiologist specialising in interventional cardiology and heart failure management.', createdAt: ts(29) },
        { name: 'Dr. Michael Torres',specialty: 'Emergency Physician',   department: 'Emergency Medicine',  email: 'm.torres@medcore.com',      phone: '+1 (713) 555-0202', availability: 'Busy',        experience: '10 years', schedule: 'Mon-Sat  07:00–19:00', about: 'Experienced emergency physician with expertise in trauma and critical care.', createdAt: ts(28) },
        { name: 'Dr. Emily Watson',  specialty: 'Neurologist',           department: 'Neurology',           email: 'e.watson@medcore.com',      phone: '+1 (713) 555-0203', availability: 'Available',   experience: '12 years', schedule: 'Tue-Sat  09:00–17:00', about: 'Specialist in epilepsy, migraine and neurodegenerative diseases.', createdAt: ts(27) },
        { name: 'Dr. James Okonkwo', specialty: 'Pediatrician',          department: 'Pediatrics',          email: 'j.okonkwo@medcore.com',     phone: '+1 (713) 555-0204', availability: 'Available',   experience: '9 years',  schedule: 'Mon-Fri  08:00–15:00', about: 'Dedicated pediatrician passionate about child health, vaccination and developmental care.', createdAt: ts(26) },
        { name: 'Dr. David Kim',     specialty: 'Orthopedic Surgeon',    department: 'Orthopedics',         email: 'd.kim@medcore.com',         phone: '+1 (713) 555-0205', availability: 'On Leave',    experience: '16 years', schedule: 'Mon–Thu 07:30–15:30', about: 'Fellowship-trained orthopedic surgeon specialising in sports injuries and joint replacement.', createdAt: ts(25) },
        { name: 'Dr. Priya Sharma',  specialty: 'Radiologist',           department: 'Radiology',           email: 'p.sharma@medcore.com',      phone: '+1 (713) 555-0206', availability: 'Available',   experience: '11 years', schedule: 'Mon-Fri  08:00–16:00', about: 'Expert in diagnostic imaging interpretation including MRI, CT and nuclear medicine.', createdAt: ts(24) },
      ])
    }

    // ── PATIENTS ──────────────────────────────────────────────────
    const patEmpty = await collectionEmpty('patients')
    if (patEmpty) {
      await addMany('patients', [
        { name: 'Marcus Johnson',   age: 45, gender: 'Male',   blood: 'O+',  condition: 'Hypertension',        status: 'Active',       patientType: 'Outpatient', location: 'Houston, TX',    phone: '+1 (713) 555-1001', email: 'marcus.j@email.com',   emergencyContact: 'Lisa Johnson +1 713-555-1002', allergies: 'Penicillin',   insurance: 'BlueCross BlueShield', notes: 'BP medication review every 3 months.', createdAt: ts(60) },
        { name: 'Elena Rodriguez',  age: 32, gender: 'Female', blood: 'A-',  condition: 'Asthma',              status: 'Active',       patientType: 'Outpatient', location: 'Houston, TX',    phone: '+1 (713) 555-1003', email: 'elena.r@email.com',    emergencyContact: 'Carlos Rodriguez +1 713-555-1004', allergies: 'Aspirin, Ibuprofen', insurance: 'Aetna', notes: 'Requires inhaler prescription refill monthly.', createdAt: ts(55) },
        { name: 'Benjamin Carter',  age: 68, gender: 'Male',   blood: 'B+',  condition: 'Type 2 Diabetes',     status: 'Admitted',     patientType: 'Inpatient',  location: 'Room 204',       phone: '+1 (713) 555-1005', email: 'ben.carter@email.com', emergencyContact: 'Ruth Carter +1 713-555-1006',  allergies: 'Sulfa drugs',    insurance: 'Medicare',             notes: 'Admitted for blood sugar regulation. Low sodium diet prescribed.', createdAt: ts(45) },
        { name: 'Olivia Park',      age: 25, gender: 'Female', blood: 'AB+', condition: 'Chronic Migraine',    status: 'Active',       patientType: 'Outpatient', location: 'Austin, TX',     phone: '+1 (512) 555-1007', email: 'olivia.p@email.com',   emergencyContact: 'Daniel Park +1 512-555-1008',  allergies: 'None',           insurance: 'UnitedHealth',         notes: 'Neurologist follow-up every 6 weeks.', createdAt: ts(40) },
        { name: 'Samuel Mensah',    age: 52, gender: 'Male',   blood: 'O-',  condition: 'Cardiac Arrhythmia',  status: 'In Treatment', patientType: 'Inpatient',  location: 'Room 312 – ICU', phone: '+1 (713) 555-1009', email: 's.mensah@email.com',   emergencyContact: 'Grace Mensah +1 713-555-1010', allergies: 'Latex',          insurance: 'Cigna',                notes: 'Continuous cardiac monitoring. Restricted visitors.', createdAt: ts(35) },
        { name: 'Grace Oduya',      age: 38, gender: 'Female', blood: 'A+',  condition: 'Tibia Fracture',      status: 'Active',       patientType: 'Outpatient', location: 'Houston, TX',    phone: '+1 (713) 555-1011', email: 'grace.o@email.com',    emergencyContact: 'Emeka Oduya +1 713-555-1012',  allergies: 'Codeine',        insurance: 'BlueCross BlueShield', notes: 'Post-surgery physiotherapy 3×/week.', createdAt: ts(30) },
        { name: 'Henry Wilson',     age: 71, gender: 'Male',   blood: 'B-',  condition: 'COPD',                status: 'Critical',     patientType: 'Inpatient',  location: 'Room 101 – ICU', phone: '+1 (713) 555-1013', email: 'henry.w@email.com',    emergencyContact: 'Margaret Wilson +1 713-555-1014', allergies: 'NSAIDs',      insurance: 'Medicare',             notes: 'On supplemental oxygen 2 L/min. DNR on file.', createdAt: ts(25) },
        { name: 'Amara Diallo',     age: 29, gender: 'Female', blood: 'O+',  condition: 'Iron Deficiency Anaemia', status: 'Active',   patientType: 'Outpatient', location: 'Katy, TX',       phone: '+1 (832) 555-1015', email: 'amara.d@email.com',    emergencyContact: 'Ibrahima Diallo +1 832-555-1016', allergies: 'None',        insurance: 'Aetna',                notes: 'Monthly iron infusion therapy. Follow CBC.', createdAt: ts(20) },
        { name: 'James O\'Brien',   age: 56, gender: 'Male',   blood: 'A+',  condition: 'Lumbar Disc Herniation', status: 'Active',    patientType: 'Outpatient', location: 'Sugar Land, TX', phone: '+1 (281) 555-1017', email: 'j.obrien@email.com',   emergencyContact: 'Patricia O\'Brien +1 281-555-1018', allergies: 'Penicillin',  insurance: 'Cigna',                notes: 'Physical therapy 2×/week. MRI ordered.', createdAt: ts(15) },
        { name: 'Sophia Turner',    age: 44, gender: 'Female', blood: 'AB-', condition: 'Generalised Anxiety',  status: 'Active',       patientType: 'Outpatient', location: 'Houston, TX',    phone: '+1 (713) 555-1019', email: 'sophia.t@email.com',   emergencyContact: 'Robert Turner +1 713-555-1020', allergies: 'None',         insurance: 'UnitedHealth',         notes: 'Weekly CBT sessions. Sertraline 50mg daily.', createdAt: ts(10) },
      ])
    }

    // ── APPOINTMENTS ──────────────────────────────────────────────
    const apptEmpty = await collectionEmpty('appointments')
    if (apptEmpty) {
      const t = todayStr()
      await addMany('appointments', [
        { patientName: 'Marcus Johnson',  doctorName: 'Dr. Sarah Chen',    type: 'Follow-up',          date: t,                    timeStart: '09:00', timeEnd: '09:30', status: 'Checked In',  notes: 'BP medication review and ECG.', requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Elena Rodriguez', doctorName: 'Dr. Emily Watson',  type: 'Consultation',       date: t,                    timeStart: '10:00', timeEnd: '10:30', status: 'In Progress', notes: 'Discuss new migraine prevention options.', requiresFollowUp: true, followUpDate: daysFromNow(14), createdAt: ts(2) },
        { patientName: 'Samuel Mensah',   doctorName: 'Dr. Sarah Chen',    type: 'Emergency',          date: t,                    timeStart: '11:30', timeEnd: '12:00', status: 'Scheduled',   notes: 'Cardiac monitoring review – ICU round.', requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Amara Diallo',    doctorName: 'Dr. James Okonkwo', type: 'Routine Check-up',   date: t,                    timeStart: '14:00', timeEnd: '14:30', status: 'Scheduled',   notes: 'Iron infusion therapy session 4.', requiresFollowUp: true, followUpDate: daysFromNow(30), createdAt: ts(3) },
        { patientName: 'Sophia Turner',   doctorName: 'Dr. Emily Watson',  type: 'Follow-up',          date: t,                    timeStart: '15:00', timeEnd: '15:30', status: 'Scheduled',   notes: 'Anxiety management — medication review.', requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Benjamin Carter', doctorName: 'Dr. Sarah Chen',    type: 'Follow-up',          date: daysFromNow(1),       timeStart: '09:30', timeEnd: '10:00', status: 'Scheduled',   notes: 'Blood glucose and A1C assessment.', requiresFollowUp: true, followUpDate: daysFromNow(45), createdAt: ts(2) },
        { patientName: 'Grace Oduya',     doctorName: 'Dr. David Kim',     type: 'Post-surgery Check', date: daysFromNow(2),       timeStart: '10:00', timeEnd: '10:30', status: 'Scheduled',   notes: 'Tibia fracture X-ray and wound inspection.', requiresFollowUp: false, createdAt: ts(5) },
        { patientName: 'James O\'Brien',  doctorName: 'Dr. David Kim',     type: 'Consultation',       date: daysFromNow(3),       timeStart: '13:00', timeEnd: '13:30', status: 'Scheduled',   notes: 'Review lumbar MRI results.', requiresFollowUp: false, createdAt: ts(4) },
        { patientName: 'Olivia Park',     doctorName: 'Dr. Emily Watson',  type: 'Follow-up',          date: daysFromNow(5),       timeStart: '11:00', timeEnd: '11:30', status: 'Scheduled',   notes: 'Migraine frequency diary review.', requiresFollowUp: false, createdAt: ts(3) },
        { patientName: 'Henry Wilson',    doctorName: 'Dr. Michael Torres', type: 'Emergency',          date: daysAgo(1),           timeStart: '02:15', timeEnd: '03:00', status: 'Completed',   notes: 'Acute COPD exacerbation – stabilised with bronchodilators and steroids.', requiresFollowUp: true, followUpDate: t, createdAt: ts(2) },
        { patientName: 'Marcus Johnson',  doctorName: 'Dr. Sarah Chen',    type: 'Consultation',       date: daysAgo(7),           timeStart: '09:00', timeEnd: '09:30', status: 'Completed',   notes: 'Initial hypertension assessment. Started lisinopril 10mg.', requiresFollowUp: true, followUpDate: t, createdAt: ts(10) },
        { patientName: 'Elena Rodriguez', doctorName: 'Dr. Emily Watson',  type: 'Routine Check-up',   date: daysAgo(14),          timeStart: '10:30', timeEnd: '11:00', status: 'Completed',   notes: 'Spirometry test performed. Results normal.', requiresFollowUp: false, createdAt: ts(16) },
        { patientName: 'Amara Diallo',    doctorName: 'Dr. Priya Sharma',  type: 'Lab / Imaging',      date: daysAgo(10),          timeStart: '08:00', timeEnd: '08:45', status: 'Completed',   notes: 'Abdominal ultrasound for anaemia workup.', requiresFollowUp: false, createdAt: ts(12) },
        { patientName: 'Samuel Mensah',   doctorName: 'Dr. Michael Torres', type: 'Emergency',         date: daysAgo(3),           timeStart: '22:40', timeEnd: '23:30', status: 'Completed',   notes: 'Arrhythmia episode, cardioversion performed. Admitted to ICU.', requiresFollowUp: false, createdAt: ts(4) },
      ])
    }

    // ── ROOMS ─────────────────────────────────────────────────────
    const roomEmpty = await collectionEmpty('rooms')
    if (roomEmpty) {
      await addMany('rooms', [
        { roomNumber: '101', type: 'ICU',            floor: '1', capacity: 1, status: 'Occupied',  patientName: 'Henry Wilson',    notes: 'O2 supply and cardiac monitor active.',    createdAt: ts(25) },
        { roomNumber: '102', type: 'ICU',            floor: '1', capacity: 1, status: 'Vacant',    patientName: '',               notes: 'Sanitised and ready.',                      createdAt: ts(25) },
        { roomNumber: '201', type: 'Private Room',   floor: '2', capacity: 1, status: 'Vacant',    patientName: '',               notes: 'En-suite bathroom, TV.',                    createdAt: ts(24) },
        { roomNumber: '204', type: 'Private Room',   floor: '2', capacity: 1, status: 'Occupied',  patientName: 'Benjamin Carter', notes: 'Diabetic diet tray arranged.',              createdAt: ts(45) },
        { roomNumber: '205', type: 'Private Room',   floor: '2', capacity: 1, status: 'Vacant',    patientName: '',               notes: '',                                          createdAt: ts(24) },
        { roomNumber: '301', type: 'General Ward',   floor: '3', capacity: 4, status: 'Occupied',  patientName: 'Shared — 2 of 4', notes: 'Two beds occupied post-op recovery.',      createdAt: ts(23) },
        { roomNumber: '312', type: 'ICU',            floor: '3', capacity: 1, status: 'Occupied',  patientName: 'Samuel Mensah',   notes: 'Cardiac telemetry, restricted access.',    createdAt: ts(35) },
        { roomNumber: '401', type: 'Operating Room', floor: '4', capacity: 1, status: 'Vacant',    patientName: '',               notes: 'Last sterilised Apr 15 2026.',              createdAt: ts(22) },
        { roomNumber: '402', type: 'Operating Room', floor: '4', capacity: 1, status: 'Maintenance', patientName: '',             notes: 'Anaesthesia equipment servicing in progress.', createdAt: ts(22) },
        { roomNumber: '501', type: 'General Ward',   floor: '5', capacity: 6, status: 'Occupied',  patientName: 'Shared — 3 of 6', notes: 'Post-operative recovery ward.',            createdAt: ts(20) },
      ])
    }

    // ── LAB RESULTS ───────────────────────────────────────────────
    const labEmpty = await collectionEmpty('labResults')
    if (labEmpty) {
      await addMany('labResults', [
        { patientName: 'Marcus Johnson',  testName: 'Lipid Panel',              result: 'LDL 162 mg/dL, HDL 38 mg/dL, TG 210 mg/dL', normalRange: 'LDL <130, HDL >40, TG <150', status: 'Abnormal',  orderedBy: 'Dr. Sarah Chen',    date: daysAgo(2),  notes: 'High LDL. Statin therapy initiated.',      createdAt: ts(3) },
        { patientName: 'Benjamin Carter', testName: 'HbA1c',                    result: '8.9%',                                        normalRange: '<5.7% (normal), <7% (diabetic goal)', status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',   date: daysAgo(5),  notes: 'Above target. Insulin adjustment required.', createdAt: ts(6) },
        { patientName: 'Elena Rodriguez', testName: 'Complete Blood Count',     result: 'WBC 7.2, RBC 4.5, Hgb 13.8, Plt 245',        normalRange: 'WBC 4-11, Hgb 12-16, Plt 150-400',  status: 'Normal',    orderedBy: 'Dr. Emily Watson',  date: daysAgo(14), notes: 'All values within normal limits.',          createdAt: ts(15) },
        { patientName: 'Samuel Mensah',   testName: 'Cardiac Troponin I',       result: '0.08 ng/mL',                                  normalRange: '<0.04 ng/mL',                         status: 'Abnormal',  orderedBy: 'Dr. Sarah Chen',    date: daysAgo(3),  notes: 'Elevated. Myocardial damage marker — monitor closely.', createdAt: ts(4) },
        { patientName: 'Amara Diallo',    testName: 'Serum Iron & Ferritin',    result: 'Iron 42 µg/dL, Ferritin 6 ng/mL',            normalRange: 'Iron 60-170, Ferritin 12-150',        status: 'Abnormal',  orderedBy: 'Dr. James Okonkwo', date: daysAgo(10), notes: 'Confirmed iron deficiency. IV iron therapy started.', createdAt: ts(11) },
        { patientName: 'Henry Wilson',    testName: 'Arterial Blood Gas',       result: 'pH 7.32, PaO2 58, PaCO2 51, HCO3 26',       normalRange: 'pH 7.35-7.45, PaO2 >80, PaCO2 35-45', status: 'Abnormal', orderedBy: 'Dr. Michael Torres', date: daysAgo(1),  notes: 'Hypercapnic respiratory failure — O2 therapy adjusted.', createdAt: ts(2) },
        { patientName: 'Olivia Park',     testName: 'Thyroid Function Panel',   result: 'TSH 2.1 mIU/L, T4 1.1 ng/dL',               normalRange: 'TSH 0.4-4.0, T4 0.8-1.8',             status: 'Normal',    orderedBy: 'Dr. Emily Watson',  date: daysAgo(7),  notes: 'Normal. Migraine not thyroid-related.',     createdAt: ts(8) },
        { patientName: 'Grace Oduya',     testName: 'X-Ray Right Tibia',        result: 'Callus formation present. Alignment good.',   normalRange: 'N/A',                                  status: 'Normal',    orderedBy: 'Dr. Priya Sharma',  date: daysAgo(6),  notes: 'Healing well. No hardware complications.', createdAt: ts(7) },
      ])
    }

    // ── BILLING ───────────────────────────────────────────────────
    const billEmpty = await collectionEmpty('billing')
    if (billEmpty) {
      await addMany('billing', [
        { patientName: 'Marcus Johnson',  doctorName: 'Dr. Sarah Chen',    description: 'Cardiology consultation + ECG',      total: 380.00,  date: daysAgo(7),  status: 'Paid',    paymentMethod: 'Insurance', createdAt: ts(8) },
        { patientName: 'Benjamin Carter', doctorName: 'Dr. Sarah Chen',    description: 'Inpatient diabetes management – 5 days', total: 4850.00, date: daysAgo(5),  status: 'Pending', paymentMethod: 'Medicare',  createdAt: ts(6) },
        { patientName: 'Elena Rodriguez', doctorName: 'Dr. Emily Watson',  description: 'Neurology consultation + spirometry', total: 520.00,  date: daysAgo(14), status: 'Paid',    paymentMethod: 'Insurance', createdAt: ts(15) },
        { patientName: 'Samuel Mensah',   doctorName: 'Dr. Sarah Chen',    description: 'Emergency cardiac care + ICU day 1',  total: 7200.00, date: daysAgo(3),  status: 'Pending', paymentMethod: 'Cigna',     createdAt: ts(4) },
        { patientName: 'Henry Wilson',    doctorName: 'Dr. Michael Torres', description: 'Emergency visit + ICU admission',    total: 6100.00, date: daysAgo(1),  status: 'Pending', paymentMethod: 'Medicare',  createdAt: ts(2) },
        { patientName: 'Amara Diallo',    doctorName: 'Dr. James Okonkwo', description: 'Iron infusion therapy × 3 sessions', total: 960.00,  date: daysAgo(10), status: 'Paid',    paymentMethod: 'Aetna',     createdAt: ts(11) },
        { patientName: 'Grace Oduya',     doctorName: 'Dr. David Kim',     description: 'Orthopedic surgery – tibia fixation',total: 9500.00, date: daysAgo(30), status: 'Paid',    paymentMethod: 'Insurance', createdAt: ts(31) },
        { patientName: 'Olivia Park',     doctorName: 'Dr. Emily Watson',  description: 'Neurology follow-up + MRI referral',  total: 290.00,  date: daysAgo(21), status: 'Overdue', paymentMethod: 'Self-pay',  createdAt: ts(22) },
      ])
    }

    // ── INVENTORY ─────────────────────────────────────────────────
    const invEmpty = await collectionEmpty('inventory')
    if (invEmpty) {
      await addMany('inventory', [
        { name: 'Paracetamol 500mg',        category: 'Medication',  quantity: 850, unit: 'tablets',  reorderLevel: 200, supplier: 'PharmaCo Ltd',       location: 'Pharmacy Shelf A1', status: 'In Stock',   createdAt: ts(60) },
        { name: 'Amoxicillin 250mg',         category: 'Medication',  quantity: 320, unit: 'capsules', reorderLevel: 100, supplier: 'PharmaCo Ltd',       location: 'Pharmacy Shelf A2', status: 'In Stock',   createdAt: ts(60) },
        { name: 'Insulin Glargine 100u/mL',  category: 'Medication',  quantity: 45,  unit: 'vials',    reorderLevel: 50,  supplier: 'SanofiMed',          location: 'Cold Storage C1',   status: 'Low Stock',  createdAt: ts(45) },
        { name: 'Salbutamol Inhaler',         category: 'Medication',  quantity: 60,  unit: 'pieces',   reorderLevel: 30,  supplier: 'GlaxoSupply',        location: 'Pharmacy Shelf B3', status: 'In Stock',   createdAt: ts(40) },
        { name: 'IV Normal Saline 0.9%',      category: 'Consumable',  quantity: 180, unit: 'bags',     reorderLevel: 80,  supplier: 'MedSupplies Inc.',   location: 'Store Room 2',      status: 'In Stock',   createdAt: ts(55) },
        { name: 'Disposable Syringes 5mL',    category: 'Consumable',  quantity: 12,  unit: 'boxes',    reorderLevel: 20,  supplier: 'MedSupplies Inc.',   location: 'Store Room 1',      status: 'Low Stock',  createdAt: ts(50) },
        { name: 'Surgical Gloves (M)',         category: 'Consumable',  quantity: 0,   unit: 'boxes',    reorderLevel: 15,  supplier: 'SafeGuard Corp.',    location: 'Store Room 1',      status: 'Out of Stock', createdAt: ts(48) },
        { name: 'Blood Pressure Monitor',      category: 'Equipment',   quantity: 8,   unit: 'pieces',   reorderLevel: 2,   supplier: 'OmronMed',           location: 'Cardiology Ward',   status: 'In Stock',   createdAt: ts(365) },
        { name: 'Pulse Oximeter',              category: 'Equipment',   quantity: 15,  unit: 'pieces',   reorderLevel: 5,   supplier: 'Nellcor Devices',    location: 'Nursing Station',   status: 'In Stock',   createdAt: ts(300) },
        { name: 'Oxygen Cylinder (E-size)',    category: 'Equipment',   quantity: 6,   unit: 'pieces',   reorderLevel: 4,   supplier: 'AirGas Medical',     location: 'ICU Bay 1',         status: 'In Stock',   createdAt: ts(90) },
        { name: 'Sterile Wound Dressing 10×10', category: 'Consumable', quantity: 220, unit: 'pieces',   reorderLevel: 100, supplier: 'MedSupplies Inc.',   location: 'Nursing Station',   status: 'In Stock',   createdAt: ts(30) },
        { name: 'Lidocaine Injection 1%',      category: 'Medication',  quantity: 28,  unit: 'vials',    reorderLevel: 30,  supplier: 'PharmaCo Ltd',       location: 'Cold Storage C2',   status: 'Low Stock',  createdAt: ts(20) },
      ])
    }

    // ── EXPENSES ──────────────────────────────────────────────────
    const expEmpty = await collectionEmpty('expenses')
    if (expEmpty) {
      await addMany('expenses', [
        { description: 'Medical Staff Salaries – March',     category: 'Salaries',    amount: 124000, date: daysAgo(46), status: 'Paid',    vendor: 'Internal Payroll',    recurring: true,  createdAt: ts(47) },
        { description: 'Electricity & Utilities – March',    category: 'Utilities',   amount: 8200,   date: daysAgo(46), status: 'Paid',    vendor: 'CenterPoint Energy',  recurring: true,  createdAt: ts(47) },
        { description: 'Medical Equipment Lease – Q2',       category: 'Equipment',   amount: 18500,  date: daysAgo(16), status: 'Paid',    vendor: 'Siemens Healthineers',recurring: false, createdAt: ts(17) },
        { description: 'Drug & Pharmaceutical Supplies',     category: 'Supplies',    amount: 14300,  date: daysAgo(10), status: 'Paid',    vendor: 'PharmaCo Ltd',        recurring: false, createdAt: ts(11) },
        { description: 'Medical Staff Salaries – April',     category: 'Salaries',    amount: 124000, date: daysAgo(16), status: 'Pending', vendor: 'Internal Payroll',    recurring: true,  createdAt: ts(17) },
        { description: 'Cleaning & Sanitation Services',     category: 'Maintenance', amount: 3400,   date: daysAgo(5),  status: 'Paid',    vendor: 'CleanMed Services',   recurring: true,  createdAt: ts(6) },
        { description: 'MRI Machine Annual Maintenance',     category: 'Equipment',   amount: 9800,   date: daysAgo(3),  status: 'Pending', vendor: 'GE Healthcare',       recurring: false, createdAt: ts(4) },
        { description: 'Office & Admin Supplies – April',    category: 'Supplies',    amount: 1200,   date: daysAgo(2),  status: 'Pending', vendor: 'Staples Business',    recurring: true,  createdAt: ts(3) },
      ])
    }

    // ── PRESCRIPTIONS ─────────────────────────────────────────────
    const rxEmpty = await collectionEmpty('prescriptions')
    if (rxEmpty) {
      await addMany('prescriptions', [
        { patientName: 'Marcus Johnson',  doctorName: 'Dr. Sarah Chen',    date: daysAgo(7),  status: 'Active',    notes: 'Take with food. Avoid alcohol. Monitor BP weekly.', medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '90 days' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once at night', duration: '90 days' }], createdAt: ts(8) },
        { patientName: 'Elena Rodriguez', doctorName: 'Dr. Emily Watson',  date: daysAgo(14), status: 'Active',    notes: 'Use rescue inhaler as needed. Keep on person at all times.', medications: [{ name: 'Salbutamol Inhaler', dosage: '100mcg/puff', frequency: 'As needed', duration: 'Ongoing' }, { name: 'Budesonide Inhaler', dosage: '200mcg', frequency: 'Twice daily', duration: '60 days' }], createdAt: ts(15) },
        { patientName: 'Benjamin Carter', doctorName: 'Dr. Sarah Chen',    date: daysAgo(5),  status: 'Active',    notes: 'Administer after meals. Monitor blood glucose 4×/day.', medications: [{ name: 'Insulin Glargine', dosage: '20 units', frequency: 'Once at bedtime', duration: 'Ongoing' }, { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' }], createdAt: ts(6) },
        { patientName: 'Olivia Park',     doctorName: 'Dr. Emily Watson',  date: daysAgo(21), status: 'Active',    notes: 'Avoid bright screens during migraine episodes.', medications: [{ name: 'Topiramate', dosage: '25mg', frequency: 'Once daily', duration: '60 days' }, { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed (max 2/day)', duration: '30 days' }], createdAt: ts(22) },
        { patientName: 'Sophia Turner',   doctorName: 'Dr. Emily Watson',  date: daysAgo(10), status: 'Active',    notes: 'Do not stop suddenly. Review in 4 weeks.', medications: [{ name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', duration: '60 days' }], createdAt: ts(11) },
        { patientName: 'Grace Oduya',     doctorName: 'Dr. David Kim',     date: daysAgo(30), status: 'Completed', notes: 'Post-surgical pain management. Complete full course.', medications: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'Three times daily', duration: '14 days' }, { name: 'Calcium + Vit D3', dosage: '600mg/400IU', frequency: 'Once daily', duration: '90 days' }], createdAt: ts(31) },
      ])
    }

    // ── INSURANCE CLAIMS ──────────────────────────────────────────
    const claimEmpty = await collectionEmpty('claims')
    if (claimEmpty) {
      await addMany('claims', [
        { patientName: 'Marcus Johnson',  insuranceProvider: 'BlueCross BlueShield', policyNumber: 'BCBS-2024-00721', coverageType: 'Full Cover',      claimAmount: 380.00,  approvedAmount: 342.00,  invoiceNumber: 'INV-0001', submittedDate: daysAgo(6),  status: 'Confirmed', notes: '90% reimbursement applied.', createdAt: ts(7) },
        { patientName: 'Elena Rodriguez', insuranceProvider: 'Aetna',                policyNumber: 'AET-2023-18842',  coverageType: 'Outpatient Only', claimAmount: 520.00,  approvedAmount: 468.00,  invoiceNumber: 'INV-0003', submittedDate: daysAgo(13), status: 'Confirmed', notes: 'Approved at 90%.', createdAt: ts(14) },
        { patientName: 'Benjamin Carter', insuranceProvider: 'Medicare',             policyNumber: 'MCR-TX-94847',    coverageType: 'Inpatient',       claimAmount: 4850.00, approvedAmount: null,    invoiceNumber: 'INV-0002', submittedDate: daysAgo(4),  status: 'Pending',   notes: 'Awaiting Medicare pre-authorisation.', createdAt: ts(5) },
        { patientName: 'Samuel Mensah',   insuranceProvider: 'Cigna',                policyNumber: 'CIG-2024-55103',  coverageType: 'Emergency',       claimAmount: 7200.00, approvedAmount: null,    invoiceNumber: 'INV-0004', submittedDate: daysAgo(2),  status: 'Pending',   notes: 'Submitted for emergency cardiac event.', createdAt: ts(3) },
        { patientName: 'Grace Oduya',     insuranceProvider: 'BlueCross BlueShield', policyNumber: 'BCBS-2024-01092', coverageType: 'Surgical',        claimAmount: 9500.00, approvedAmount: 8550.00, invoiceNumber: 'INV-0007', submittedDate: daysAgo(28), status: 'Confirmed', notes: '90% surgical cover approved.', createdAt: ts(29) },
      ])
    }

    // ── PHARMACY ORDERS ───────────────────────────────────────────
    const pharmEmpty = await collectionEmpty('pharmacyOrders')
    if (pharmEmpty) {
      await addMany('pharmacyOrders', [
        { patientName: 'Marcus Johnson',  doctorName: 'Dr. Sarah Chen',   medications: [{ name: 'Lisinopril 10mg', qty: 90 }, { name: 'Atorvastatin 20mg', qty: 90 }], status: 'Dispensed',  pharmacistName: 'Mark Owens',  dispensedAt: daysAgo(6),  advancePayment: 45.00,  notes: '3-month supply dispensed.',           createdAt: ts(7) },
        { patientName: 'Elena Rodriguez', doctorName: 'Dr. Emily Watson', medications: [{ name: 'Salbutamol Inhaler', qty: 2 }, { name: 'Budesonide Inhaler', qty: 1 }], status: 'Dispensed', pharmacistName: 'Linda Park',  dispensedAt: daysAgo(13), advancePayment: 32.00,  notes: 'Patient counselled on inhaler technique.', createdAt: ts(14) },
        { patientName: 'Benjamin Carter', doctorName: 'Dr. Sarah Chen',   medications: [{ name: 'Insulin Glargine', qty: 3 }, { name: 'Metformin 500mg', qty: 60 }], status: 'Ready',      pharmacistName: '',           dispensedAt: null,        advancePayment: 20.00,  notes: 'Insulin stored in cold room. Ready for collection.', createdAt: ts(2) },
        { patientName: 'Sophia Turner',   doctorName: 'Dr. Emily Watson', medications: [{ name: 'Sertraline 50mg', qty: 60 }], status: 'Pending',    pharmacistName: '',           dispensedAt: null,        advancePayment: 0,      notes: 'Awaiting stock replenishment.',       createdAt: ts(1) },
      ])
    }

    // ── SHIFTS (current week) ─────────────────────────────────────
    const shiftEmpty = await collectionEmpty('shifts')
    if (shiftEmpty) {
      await addMany('shifts', [
        { day: 'Monday',    shiftType: 'Morning',   doctorName: 'Dr. Sarah Chen',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Afternoon', doctorName: 'Dr. Michael Torres',doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Night',     doctorName: 'Dr. Emily Watson',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Morning',   doctorName: 'Dr. James Okonkwo', doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Afternoon', doctorName: 'Dr. Sarah Chen',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Night',     doctorName: 'Dr. Michael Torres',doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Morning',   doctorName: 'Dr. Emily Watson',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Afternoon', doctorName: 'Dr. Priya Sharma',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Night',     doctorName: 'Dr. James Okonkwo', doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Morning',   doctorName: 'Dr. Michael Torres',doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Afternoon', doctorName: 'Dr. Sarah Chen',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Morning',   doctorName: 'Dr. Sarah Chen',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Afternoon', doctorName: 'Dr. Emily Watson',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Night',     doctorName: 'Dr. Priya Sharma',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Saturday',  shiftType: 'Morning',   doctorName: 'Dr. Michael Torres',doctorId: '', weekStart, createdAt: ts(3) },
      ])
    }

    // ── MEDICAL RECORDS ───────────────────────────────────────────
    const medEmpty = await collectionEmpty('medicalRecords')
    if (medEmpty) {
      await addMany('medicalRecords', [
        { patientId: 'seed-1', patientName: 'Marcus Johnson',  date: daysAgo(7),  diagnosis: 'Essential Hypertension (I10)', notes: 'BP 162/98 on presentation. Started antihypertensive. Lifestyle modifications discussed.', doctor: 'Dr. Sarah Chen',    type: 'Consultation', vitals: { bp: '162/98', hr: 82, temp: 36.7, weight: 92 }, createdAt: ts(8) },
        { patientId: 'seed-2', patientName: 'Benjamin Carter', date: daysAgo(5),  diagnosis: 'Type 2 Diabetes Mellitus (E11)', notes: 'Admitted for glycaemic control. HbA1c 8.9%. Insulin regime adjusted. Dietitian referral.', doctor: 'Dr. Sarah Chen', type: 'Admission',    vitals: { bp: '140/88', hr: 76, temp: 37.1, weight: 88 }, createdAt: ts(6) },
        { patientId: 'seed-3', patientName: 'Samuel Mensah',   date: daysAgo(3),  diagnosis: 'Paroxysmal Atrial Fibrillation (I48.0)', notes: 'Acute AF episode. DC cardioversion successful. Anticoagulation initiated. Admitted ICU.', doctor: 'Dr. Michael Torres', type: 'Emergency', vitals: { bp: '118/74', hr: 144, temp: 37.0, weight: 79 }, createdAt: ts(4) },
        { patientId: 'seed-4', patientName: 'Henry Wilson',    date: daysAgo(1),  diagnosis: 'COPD Exacerbation (J44.1)',       notes: 'Acute exacerbation with hypercapnia. IV methylprednisolone + salbutamol nebulisation. ABG improved.', doctor: 'Dr. Michael Torres', type: 'Emergency', vitals: { bp: '138/82', hr: 110, temp: 38.2, weight: 66 }, createdAt: ts(2) },
        { patientId: 'seed-5', patientName: 'Grace Oduya',     date: daysAgo(30), diagnosis: 'Closed Tibial Shaft Fracture (S82.2)', notes: 'ORIF performed under spinal anaesthesia. Intramedullary nail placed. Post-op X-ray good alignment.', doctor: 'Dr. David Kim', type: 'Surgical',    vitals: { bp: '122/76', hr: 70, temp: 36.9, weight: 67 }, createdAt: ts(31) },
      ])
    }

    // ── DOCUMENTS ─────────────────────────────────────────────────
    const docDocEmpty = await collectionEmpty('documents')
    if (docDocEmpty) {
      await addMany('documents', [
        { patientName: 'Benjamin Carter', title: 'Admission Consent Form',           type: 'Consent Form',    date: daysAgo(5),  size: '248 KB', uploadedBy: 'Admin',           notes: 'Signed and witnessed. Diabetes management plan attached.', createdAt: ts(6) },
        { patientName: 'Samuel Mensah',   title: 'ICU Admission Report',             type: 'Medical Report',  date: daysAgo(3),  size: '512 KB', uploadedBy: 'Dr. Sarah Chen',  notes: 'Cardiac event summary and treatment protocol.', createdAt: ts(4) },
        { patientName: 'Grace Oduya',     title: 'Surgical Operation Report',        type: 'Medical Report',  date: daysAgo(30), size: '1.1 MB', uploadedBy: 'Dr. David Kim',   notes: 'ORIF tibia — detailed operative notes.', createdAt: ts(31) },
        { patientName: 'Marcus Johnson',  title: 'Insurance Pre-authorisation',      type: 'Insurance',       date: daysAgo(8),  size: '184 KB', uploadedBy: 'Admin',           notes: 'BCBS pre-auth for cardiology services.', createdAt: ts(9) },
        { patientName: 'Elena Rodriguez', title: 'Pulmonology Referral Letter',      type: 'Referral',        date: daysAgo(14), size: '96 KB',  uploadedBy: 'Dr. Emily Watson', notes: 'Referral to pulmonologist for spirometry follow-up.', createdAt: ts(15) },
      ])
    }

    showToast?.('Demo data loaded successfully!', 'success')
    return true
  } catch (err) {
    console.error('Seed error:', err)
    showToast?.('Failed to seed data: ' + err.message, 'error')
    return false
  }
}
