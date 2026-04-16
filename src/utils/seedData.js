import { collection, addDoc, setDoc, doc, getDocs, deleteDoc } from 'firebase/firestore'
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

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

async function addMany(col, items) {
  return Promise.all(items.map(item => addDoc(collection(db, col), item)))
}

export async function seedDatabase(showToast) {
  try {
    showToast?.('Seeding demo data…', 'info')
    const weekStart = getWeekStart()
    const t = todayStr()

    // ── SETTINGS ──────────────────────────────────────────────────
    await setDoc(doc(db, 'settings', 'hospital'), {
      hospitalName:        'MedCore General Hospital',
      tagline:             'Excellence in Healthcare, Compassion in Care',
      licenseNumber:       'MED-2024-00392',
      address:             '14 Ahmadu Bello Way, Victoria Island, Lagos 101241',
      phone:               '+234 (1) 463-5000',
      email:               'info@medcorehospital.ng',
      website:             'https://www.medcorehospital.ng',
      emergencyPhone:      '+234 (1) 463-5911',
      timezone:            'Africa/Lagos',
      currency:            'NGN',
      workingHoursStart:   '07:00',
      workingHoursEnd:     '20:00',
      appointmentDuration: 30,
      maxPatientsPerDay:   150,
      bedCapacity:         320,
      taxRate:             7.5,
      invoicePrefix:       'MCH-',
      paymentTerms:        'Due on receipt',
      invoiceNotes:        'Thank you for choosing MedCore General Hospital. All payments should be made at the billing desk or via bank transfer. Account: MedCore General Hospital | GTBank | 0123456789. For enquiries: billing@medcorehospital.ng',
    }, { merge: true })

    // ── DEPARTMENTS ────────────────────────────────────────────────
    await clearCollection('departments')
      await addMany('departments', [
        { name: 'Emergency Medicine',      head: 'Dr. Michael Torres',  staffCount: 18, description: '24/7 emergency and trauma care for critical and life-threatening conditions.',     color: 'red',    createdAt: ts(90) },
        { name: 'Cardiology',              head: 'Dr. Sarah Chen',      staffCount: 13, description: 'Diagnosis and management of heart diseases, arrhythmias and vascular conditions.',  color: 'rose',   createdAt: ts(88) },
        { name: 'Neurology',               head: 'Dr. Emily Watson',    staffCount: 9,  description: 'Treatment of nervous system disorders including stroke, epilepsy and migraine.',    color: 'purple', createdAt: ts(86) },
        { name: 'Paediatrics',             head: 'Dr. James Okonkwo',   staffCount: 11, description: 'Comprehensive medical care for children from birth through adolescence.',           color: 'blue',   createdAt: ts(84) },
        { name: 'Orthopaedics',            head: 'Dr. David Kim',       staffCount: 8,  description: 'Surgical and non-surgical treatment of bones, joints and musculoskeletal injuries.',color: 'amber',  createdAt: ts(82) },
        { name: 'Radiology',               head: 'Dr. Priya Sharma',    staffCount: 7,  description: 'Diagnostic imaging: MRI, CT scan, X-ray, ultrasound and nuclear medicine.',        color: 'teal',   createdAt: ts(80) },
        { name: 'Internal Medicine',       head: 'Dr. Adaeze Nwosu',    staffCount: 14, description: 'General internal medicine covering infectious diseases, diabetes and hypertension.', color: 'green',  createdAt: ts(78) },
        { name: 'Surgery',                 head: 'Dr. Biodun Afolabi',  staffCount: 10, description: 'General, laparoscopic and elective surgical procedures.',                           color: 'orange', createdAt: ts(76) },
        { name: 'Obstetrics & Gynaecology',head: 'Dr. Kemi Oladapo',   staffCount: 12, description: 'Maternal health, antenatal care, labour management and gynaecological surgery.',    color: 'pink',   createdAt: ts(74) },
        { name: 'Psychiatry',              head: 'Dr. Tunde Balogun',   staffCount: 6,  description: 'Mental health assessment, counselling and pharmacological treatment.',              color: 'indigo', createdAt: ts(72) },
      ])

    // ── DOCTORS ───────────────────────────────────────────────────
    await clearCollection('doctors')
      await addMany('doctors', [
        { name: 'Dr. Sarah Chen',      specialty: 'Cardiologist',              department: 'Cardiology',               email: 'sarah.chen@medcore.ng',      phone: '+234 803 555 0201', availability: 'Available',  experience: '14 years', schedule: 'Mon–Fri  08:00–16:00', about: 'Board-certified cardiologist specialising in interventional cardiology and heart failure management.', createdAt: ts(90) },
        { name: 'Dr. Michael Torres',  specialty: 'Emergency Physician',       department: 'Emergency Medicine',       email: 'm.torres@medcore.ng',        phone: '+234 808 555 0202', availability: 'Busy',       experience: '10 years', schedule: 'Mon–Sat  07:00–19:00', about: 'Experienced emergency physician with expertise in trauma, resuscitation and critical care.', createdAt: ts(88) },
        { name: 'Dr. Emily Watson',    specialty: 'Neurologist',               department: 'Neurology',                email: 'e.watson@medcore.ng',        phone: '+234 805 555 0203', availability: 'Available',  experience: '12 years', schedule: 'Tue–Sat  09:00–17:00', about: 'Specialist in epilepsy, stroke, migraine and neurodegenerative diseases.', createdAt: ts(86) },
        { name: 'Dr. James Okonkwo',   specialty: 'Paediatrician',             department: 'Paediatrics',              email: 'j.okonkwo@medcore.ng',       phone: '+234 809 555 0204', availability: 'Available',  experience: '9 years',  schedule: 'Mon–Fri  08:00–15:00', about: 'Dedicated paediatrician focused on child health, immunisation and developmental care.', createdAt: ts(84) },
        { name: 'Dr. David Kim',       specialty: 'Orthopaedic Surgeon',       department: 'Orthopaedics',             email: 'd.kim@medcore.ng',           phone: '+234 802 555 0205', availability: 'On Leave',   experience: '16 years', schedule: 'Mon–Thu  07:30–15:30', about: 'Fellowship-trained orthopaedic surgeon specialising in joint replacement and sports injuries.', createdAt: ts(82) },
        { name: 'Dr. Priya Sharma',    specialty: 'Radiologist',               department: 'Radiology',                email: 'p.sharma@medcore.ng',        phone: '+234 806 555 0206', availability: 'Available',  experience: '11 years', schedule: 'Mon–Fri  08:00–16:00', about: 'Expert in diagnostic imaging: MRI, CT, ultrasound and nuclear medicine interpretation.', createdAt: ts(80) },
        { name: 'Dr. Adaeze Nwosu',    specialty: 'Internist',                 department: 'Internal Medicine',        email: 'a.nwosu@medcore.ng',         phone: '+234 807 555 0207', availability: 'Available',  experience: '8 years',  schedule: 'Mon–Fri  08:00–17:00', about: 'Internal medicine specialist with a focus on infectious diseases, malaria and diabetes.', createdAt: ts(78) },
        { name: 'Dr. Biodun Afolabi',  specialty: 'General Surgeon',           department: 'Surgery',                  email: 'b.afolabi@medcore.ng',       phone: '+234 810 555 0208', availability: 'Busy',       experience: '13 years', schedule: 'Mon–Fri  07:00–16:00', about: 'General and laparoscopic surgeon with expertise in appendicectomy, hernia and bowel surgery.', createdAt: ts(76) },
        { name: 'Dr. Kemi Oladapo',    specialty: 'Obstetrician & Gynaecologist', department: 'Obstetrics & Gynaecology', email: 'k.oladapo@medcore.ng', phone: '+234 804 555 0209', availability: 'Available',  experience: '10 years', schedule: 'Mon–Sat  08:00–16:00', about: 'OB/GYN specialising in high-risk pregnancies, antenatal care and gynaecological oncology.', createdAt: ts(74) },
        { name: 'Dr. Tunde Balogun',   specialty: 'Psychiatrist',              department: 'Psychiatry',               email: 't.balogun@medcore.ng',       phone: '+234 811 555 0210', availability: 'Available',  experience: '7 years',  schedule: 'Tue–Sat  09:00–17:00', about: 'Psychiatrist specialising in anxiety, depression, bipolar disorder and addiction medicine.', createdAt: ts(72) },
        { name: 'Dr. Ngozi Obi',       specialty: 'Dermatologist',             department: 'Internal Medicine',        email: 'n.obi@medcore.ng',           phone: '+234 803 555 0211', availability: 'Available',  experience: '6 years',  schedule: 'Mon–Fri  09:00–15:00', about: 'Skin specialist treating acne, eczema, psoriasis, hyperpigmentation and skin infections.', createdAt: ts(70) },
        { name: 'Dr. Femi Adeleke',    specialty: 'Urologist',                 department: 'Surgery',                  email: 'f.adeleke@medcore.ng',       phone: '+234 809 555 0212', availability: 'Available',  experience: '9 years',  schedule: 'Mon–Thu  08:00–15:00', about: 'Urologist with expertise in kidney stones, prostate conditions and bladder disorders.', createdAt: ts(68) },
      ])

    // ── PATIENTS ──────────────────────────────────────────────────
    await clearCollection('patients')
      await addMany('patients', [
        { name: 'Chukwuemeka Obi',      age: 34, gender: 'Male',   blood: 'O+',  condition: 'Malaria (Severe)',            status: 'Admitted',     patientType: 'Inpatient',  location: 'Room 301',       phone: '+234 803 111 0001', email: 'c.obi@email.com',       emergencyContact: 'Ngozi Obi +234 803 111 0002',    allergies: 'None',         insurance: 'NHIS',                  notes: 'IV artesunate commenced. Repeat RDT in 48h.', createdAt: ts(3) },
        { name: 'Fatima Al-Hassan',      age: 48, gender: 'Female', blood: 'A+',  condition: 'Hypertensive Crisis',         status: 'Admitted',     patientType: 'Inpatient',  location: 'Room 205',       phone: '+234 806 111 0003', email: 'f.alhassan@email.com',  emergencyContact: 'Musa Al-Hassan +234 806 111 0004', allergies: 'ACE Inhibitors', insurance: 'AIICO',                 notes: 'BP 210/118 on admission. IV labetalol started.', createdAt: ts(2) },
        { name: 'Taiwo Adeyemi',         age: 22, gender: 'Male',   blood: 'SS',  condition: 'Sickle Cell Crisis',          status: 'In Treatment', patientType: 'Inpatient',  location: 'Room 308',       phone: '+234 807 111 0005', email: 't.adeyemi@email.com',   emergencyContact: 'Kehinde Adeyemi +234 807 111 0006', allergies: 'Aspirin',     insurance: 'Leadway Health',        notes: 'Vaso-occlusive crisis. IV fluids + analgesics.', createdAt: ts(4) },
        { name: 'Ngozi Eze',             age: 29, gender: 'Female', blood: 'B+',  condition: 'Gestational Diabetes',        status: 'Active',       patientType: 'Outpatient', location: 'Abuja, FCT',     phone: '+234 808 111 0007', email: 'n.eze@email.com',       emergencyContact: 'Ifeanyi Eze +234 808 111 0008',   allergies: 'None',         insurance: 'Hygeia HMO',            notes: '28 weeks pregnant. 2-hour OGTT positive. Diet modification + monitoring.', createdAt: ts(10) },
        { name: 'Babatunde Olatunde',    age: 41, gender: 'Male',   blood: 'O-',  condition: 'Appendicitis (Post-op)',      status: 'Admitted',     patientType: 'Inpatient',  location: 'Room 402',       phone: '+234 809 111 0009', email: 'b.olatunde@email.com',  emergencyContact: 'Yemisi Olatunde +234 809 111 0010', allergies: 'Penicillin',  insurance: 'Reliance HMO',          notes: 'Laparoscopic appendicectomy done. Day 1 post-op.', createdAt: ts(1) },
        { name: 'Yetunde Okafor',        age: 31, gender: 'Female', blood: 'A-',  condition: 'Typhoid Fever',               status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 802 111 0011', email: 'y.okafor@email.com',    emergencyContact: 'Chidi Okafor +234 802 111 0012',  allergies: 'Sulfonamides', insurance: 'NHIS',                  notes: 'Widal test positive 1:160. Ciprofloxacin 500mg BD × 7 days.', createdAt: ts(5) },
        { name: 'Chidera Nwachukwu',     age: 58, gender: 'Male',   blood: 'B-',  condition: 'Pneumonia (Severe)',           status: 'Critical',     patientType: 'Inpatient',  location: 'ICU Room 103',   phone: '+234 805 111 0013', email: 'c.nwachukwu@email.com', emergencyContact: 'Ada Nwachukwu +234 805 111 0014',  allergies: 'NSAIDs',       insurance: 'Axamansard',            notes: 'On high-flow O2. SpO2 84% on admission. Broad-spectrum antibiotics started.', createdAt: ts(2) },
        { name: 'Adaeze Okonkwo',        age: 37, gender: 'Female', blood: 'AB+', condition: 'Nephrolithiasis (Kidney Stones)', status: 'Active',  patientType: 'Outpatient', location: 'Enugu',          phone: '+234 810 111 0015', email: 'a.okonkwo@email.com',   emergencyContact: 'Obiora Okonkwo +234 810 111 0016', allergies: 'None',        insurance: 'Hygeia HMO',            notes: 'CT KUB: 7mm ureteric stone. Pain management + high fluid intake.', createdAt: ts(8) },
        { name: 'Emmanuel Abubakar',     age: 26, gender: 'Male',   blood: 'O+',  condition: 'Malaria + Iron-deficiency Anaemia', status: 'Admitted', patientType: 'Inpatient', location: 'Room 303',      phone: '+234 811 111 0017', email: 'e.abubakar@email.com',  emergencyContact: 'Fatima Abubakar +234 811 111 0018', allergies: 'None',       insurance: 'NHIS',                  notes: 'Hgb 6.8 g/dL. Blood transfusion in progress.', createdAt: ts(3) },
        { name: 'Ifeoma Adeleke',        age: 9,  gender: 'Female', blood: 'A+',  condition: 'Asthma (Paediatric)',          status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 803 111 0019', email: 'parent.adeleke@email.com', emergencyContact: 'Femi Adeleke +234 803 111 0020', allergies: 'Dust, Pet Dander', insurance: 'Leadway Health', notes: 'School-age asthma. Preventer inhaler daily. Rescue PRN.', createdAt: ts(14) },
        { name: 'Marcus Johnson',        age: 45, gender: 'Male',   blood: 'O+',  condition: 'Hypertension',                status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 813 111 0021', email: 'marcus.j@email.com',    emergencyContact: 'Lisa Johnson +234 813 111 0022',  allergies: 'Penicillin',   insurance: 'AIICO',                 notes: 'BP reviewed monthly. Lisinopril 10mg + Atorvastatin 20mg.', createdAt: ts(60) },
        { name: 'Elena Rodriguez',       age: 32, gender: 'Female', blood: 'A-',  condition: 'Chronic Asthma',              status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 805 111 0023', email: 'elena.r@email.com',     emergencyContact: 'Carlos Rodriguez +234 805 111 0024', allergies: 'Aspirin',   insurance: 'Axamansard',            notes: 'Monthly inhaler refill. Spirometry last reviewed 2 weeks ago.', createdAt: ts(55) },
        { name: 'Benjamin Carter',       age: 68, gender: 'Male',   blood: 'B+',  condition: 'Type 2 Diabetes',             status: 'Admitted',     patientType: 'Inpatient',  location: 'Room 204',       phone: '+234 802 111 0025', email: 'ben.carter@email.com',  emergencyContact: 'Ruth Carter +234 802 111 0026',   allergies: 'Sulfa drugs',  insurance: 'NHIS',                  notes: 'Admitted for glycaemic control. HbA1c 8.9%. Low sodium diet prescribed.', createdAt: ts(45) },
        { name: 'Olivia Park',           age: 25, gender: 'Female', blood: 'AB+', condition: 'Chronic Migraine',            status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 808 111 0027', email: 'olivia.p@email.com',    emergencyContact: 'Daniel Park +234 808 111 0028',   allergies: 'None',         insurance: 'Hygeia HMO',            notes: 'Neurologist review every 6 weeks. Migraine diary maintained.', createdAt: ts(40) },
        { name: 'Samuel Mensah',         age: 52, gender: 'Male',   blood: 'O-',  condition: 'Cardiac Arrhythmia',          status: 'In Treatment', patientType: 'Inpatient',  location: 'ICU Room 312',   phone: '+234 807 111 0029', email: 's.mensah@email.com',    emergencyContact: 'Grace Mensah +234 807 111 0030',  allergies: 'Latex',        insurance: 'Reliance HMO',          notes: 'Continuous cardiac monitoring. Restricted visitors.', createdAt: ts(35) },
        { name: 'Grace Oduya',           age: 38, gender: 'Female', blood: 'A+',  condition: 'Tibia Fracture Recovery',     status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 804 111 0031', email: 'grace.o@email.com',     emergencyContact: 'Emeka Oduya +234 804 111 0032',   allergies: 'Codeine',      insurance: 'AIICO',                 notes: 'Post-ORIF physiotherapy 3×/week. X-ray follow-up next week.', createdAt: ts(30) },
        { name: 'Henry Wilson',          age: 71, gender: 'Male',   blood: 'B-',  condition: 'COPD',                        status: 'Critical',     patientType: 'Inpatient',  location: 'ICU Room 101',   phone: '+234 809 111 0033', email: 'henry.w@email.com',     emergencyContact: 'Margaret Wilson +234 809 111 0034', allergies: 'NSAIDs',     insurance: 'Axamansard',            notes: 'On supplemental O2 2 L/min. DNR on file.', createdAt: ts(25) },
        { name: 'Amara Diallo',          age: 29, gender: 'Female', blood: 'O+',  condition: 'Iron-deficiency Anaemia',     status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 811 111 0035', email: 'amara.d@email.com',     emergencyContact: 'Ibrahima Diallo +234 811 111 0036', allergies: 'None',       insurance: 'NHIS',                  notes: 'Monthly iron infusion therapy. Follow CBC.', createdAt: ts(20) },
        { name: 'James O\'Brien',        age: 56, gender: 'Male',   blood: 'A+',  condition: 'Lumbar Disc Herniation',      status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 802 111 0037', email: 'j.obrien@email.com',    emergencyContact: 'Patricia O\'Brien +234 802 111 0038', allergies: 'Penicillin', insurance: 'Leadway Health',       notes: 'MRI ordered. Physio 2×/week.', createdAt: ts(15) },
        { name: 'Sophia Turner',         age: 44, gender: 'Female', blood: 'AB-', condition: 'Generalised Anxiety',         status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 810 111 0039', email: 'sophia.t@email.com',    emergencyContact: 'Robert Turner +234 810 111 0040',  allergies: 'None',         insurance: 'Hygeia HMO',            notes: 'Weekly CBT sessions. Sertraline 50mg daily.', createdAt: ts(10) },
        { name: 'Aisha Musa',            age: 19, gender: 'Female', blood: 'O+',  condition: 'Urinary Tract Infection',     status: 'Active',       patientType: 'Outpatient', location: 'Kano',           phone: '+234 803 111 0041', email: 'aisha.m@email.com',     emergencyContact: 'Ibrahim Musa +234 803 111 0042',   allergies: 'None',         insurance: 'NHIS',                  notes: 'Urine MCS sent. Nitrofurantoin prescribed.', createdAt: ts(6) },
        { name: 'Olumide Bakare',        age: 62, gender: 'Male',   blood: 'B+',  condition: 'Benign Prostatic Hyperplasia', status: 'Active',      patientType: 'Outpatient', location: 'Ibadan',         phone: '+234 805 111 0043', email: 'o.bakare@email.com',    emergencyContact: 'Funke Bakare +234 805 111 0044',   allergies: 'None',         insurance: 'Reliance HMO',          notes: 'PSA 4.8 ng/mL. On tamsulosin. Urology referral made.', createdAt: ts(12) },
        { name: 'Precious Anozie',       age: 23, gender: 'Female', blood: 'A+',  condition: 'Peptic Ulcer Disease',        status: 'Active',       patientType: 'Outpatient', location: 'Lagos',          phone: '+234 806 111 0045', email: 'p.anozie@email.com',    emergencyContact: 'Emeka Anozie +234 806 111 0046',   allergies: 'Ibuprofen',    insurance: 'AIICO',                 notes: 'H. pylori positive. Triple therapy initiated.', createdAt: ts(9) },
        { name: 'Damilola Ogunleye',     age: 55, gender: 'Male',   blood: 'O+',  condition: 'Ischaemic Heart Disease',     status: 'In Treatment', patientType: 'Inpatient',  location: 'Room 211',       phone: '+234 808 111 0047', email: 'd.ogunleye@email.com',  emergencyContact: 'Sola Ogunleye +234 808 111 0048',  allergies: 'Clopidogrel',  insurance: 'Axamansard',            notes: 'Post-PCI day 2. Dual antiplatelet therapy. Cardiac rehab planned.', createdAt: ts(2) },
      ])

    // ── APPOINTMENTS ──────────────────────────────────────────────
    await clearCollection('appointments')
      await addMany('appointments', [
        // ── TODAY — Checked In ──
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',     type: 'Follow-up',        date: t, timeStart: '07:30', timeEnd: '08:00', status: 'Checked In',  notes: 'BP medication review and ECG.',                         requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Fatima Al-Hassan',   doctorName: 'Dr. Adaeze Nwosu',   type: 'Follow-up',        date: t, timeStart: '08:00', timeEnd: '08:30', status: 'Checked In',  notes: 'Hypertensive crisis — BP monitoring post IV therapy.',   requiresFollowUp: true, followUpDate: daysFromNow(2), createdAt: ts(1) },
        { patientName: 'Yetunde Okafor',     doctorName: 'Dr. Adaeze Nwosu',   type: 'Consultation',     date: t, timeStart: '08:30', timeEnd: '09:00', status: 'Checked In',  notes: 'Typhoid review — day 3 of ciprofloxacin.',              requiresFollowUp: false, createdAt: ts(2) },
        { patientName: 'Ifeoma Adeleke',     doctorName: 'Dr. James Okonkwo',  type: 'Routine Check-up', date: t, timeStart: '09:00', timeEnd: '09:30', status: 'Checked In',  notes: 'Paediatric asthma review. Growth chart update.',        requiresFollowUp: false, createdAt: ts(3) },
        { patientName: 'Ngozi Eze',          doctorName: 'Dr. Kemi Oladapo',   type: 'Antenatal',        date: t, timeStart: '09:30', timeEnd: '10:00', status: 'Checked In',  notes: '28-week antenatal visit. GDM monitoring.',             requiresFollowUp: true, followUpDate: daysFromNow(14), createdAt: ts(2) },

        // ── TODAY — In Progress ──
        { patientName: 'Chidera Nwachukwu',  doctorName: 'Dr. Michael Torres', type: 'Emergency',        date: t, timeStart: '07:00', timeEnd: '08:00', status: 'In Progress', notes: 'Severe pneumonia — resuscitation and stabilisation.',   requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Samuel Mensah',      doctorName: 'Dr. Sarah Chen',     type: 'ICU Round',        date: t, timeStart: '08:00', timeEnd: '08:30', status: 'In Progress', notes: 'Cardiac arrhythmia monitoring — ICU ward round.',       requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Taiwo Adeyemi',      doctorName: 'Dr. Adaeze Nwosu',   type: 'Follow-up',        date: t, timeStart: '09:00', timeEnd: '09:30', status: 'In Progress', notes: 'Sickle cell crisis — pain scoring and fluid balance.',  requiresFollowUp: true, followUpDate: daysFromNow(1), createdAt: ts(1) },
        { patientName: 'Damilola Ogunleye',  doctorName: 'Dr. Sarah Chen',     type: 'Post-procedure',   date: t, timeStart: '10:00', timeEnd: '10:30', status: 'In Progress', notes: 'Post-PCI round — vitals, ECG and wound check.',        requiresFollowUp: false, createdAt: ts(1) },

        // ── TODAY — Completed ──
        { patientName: 'Henry Wilson',       doctorName: 'Dr. Michael Torres', type: 'ICU Round',        date: t, timeStart: '07:00', timeEnd: '07:30', status: 'Completed',   notes: 'COPD: SpO2 improving on O2 therapy. ABG repeat ordered.', requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Emmanuel Abubakar',  doctorName: 'Dr. Adaeze Nwosu',   type: 'Follow-up',        date: t, timeStart: '07:30', timeEnd: '08:00', status: 'Completed',   notes: 'Transfusion complete. Hgb risen to 9.2. Continues oral iron.', requiresFollowUp: true, followUpDate: daysFromNow(7), createdAt: ts(1) },
        { patientName: 'Chukwuemeka Obi',    doctorName: 'Dr. Adaeze Nwosu',   type: 'Ward Round',       date: t, timeStart: '08:00', timeEnd: '08:30', status: 'Completed',   notes: 'Malaria: parasitaemia clearing. IV artesunate day 2.', requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Babatunde Olatunde', doctorName: 'Dr. Biodun Afolabi', type: 'Post-surgery',     date: t, timeStart: '08:30', timeEnd: '09:00', status: 'Completed',   notes: 'Post-appendicectomy day 1 — wound clean, mobilising.', requiresFollowUp: true, followUpDate: daysFromNow(5), createdAt: ts(1) },
        { patientName: 'Aisha Musa',         doctorName: 'Dr. Adaeze Nwosu',   type: 'Consultation',     date: t, timeStart: '09:00', timeEnd: '09:30', status: 'Completed',   notes: 'UTI — MSU sent. Nitrofurantoin prescribed. Review if no improvement in 48h.', requiresFollowUp: false, createdAt: ts(2) },
        { patientName: 'Precious Anozie',    doctorName: 'Dr. Adaeze Nwosu',   type: 'Consultation',     date: t, timeStart: '10:30', timeEnd: '11:00', status: 'Completed',   notes: 'PUD — H. pylori confirmed. Triple therapy started.', requiresFollowUp: true, followUpDate: daysFromNow(30), createdAt: ts(2) },

        // ── TODAY — Scheduled (upcoming) ──
        { patientName: 'Olivia Park',        doctorName: 'Dr. Emily Watson',   type: 'Follow-up',        date: t, timeStart: '11:00', timeEnd: '11:30', status: 'Scheduled',   notes: 'Migraine frequency review — 6-week follow-up.',        requiresFollowUp: false, createdAt: ts(3) },
        { patientName: 'Elena Rodriguez',    doctorName: 'Dr. Emily Watson',   type: 'Consultation',     date: t, timeStart: '11:30', timeEnd: '12:00', status: 'Scheduled',   notes: 'Discuss new preventive options for asthma.',           requiresFollowUp: true, followUpDate: daysFromNow(14), createdAt: ts(3) },
        { patientName: 'Adaeze Okonkwo',     doctorName: 'Dr. Femi Adeleke',   type: 'Consultation',     date: t, timeStart: '12:00', timeEnd: '12:30', status: 'Scheduled',   notes: 'Kidney stone: CT urogram review.',                     requiresFollowUp: false, createdAt: ts(4) },
        { patientName: 'Sophia Turner',      doctorName: 'Dr. Tunde Balogun',  type: 'Follow-up',        date: t, timeStart: '13:00', timeEnd: '13:30', status: 'Scheduled',   notes: 'Anxiety — medication review. Sertraline response.',    requiresFollowUp: false, createdAt: ts(2) },
        { patientName: 'Olumide Bakare',     doctorName: 'Dr. Femi Adeleke',   type: 'Consultation',     date: t, timeStart: '13:30', timeEnd: '14:00', status: 'Scheduled',   notes: 'BPH: PSA and uroflowmetry results.',                   requiresFollowUp: true, followUpDate: daysFromNow(30), createdAt: ts(5) },
        { patientName: 'Grace Oduya',        doctorName: 'Dr. David Kim',      type: 'Post-surgery',     date: t, timeStart: '14:00', timeEnd: '14:30', status: 'Scheduled',   notes: 'Tibia X-ray review — 6-week post ORIF.',               requiresFollowUp: false, createdAt: ts(6) },
        { patientName: 'Amara Diallo',       doctorName: 'Dr. Adaeze Nwosu',   type: 'Procedure',        date: t, timeStart: '14:30', timeEnd: '15:00', status: 'Scheduled',   notes: 'Iron infusion session 5.',                             requiresFollowUp: true, followUpDate: daysFromNow(28), createdAt: ts(3) },
        { patientName: 'James O\'Brien',     doctorName: 'Dr. David Kim',      type: 'Consultation',     date: t, timeStart: '15:00', timeEnd: '15:30', status: 'Scheduled',   notes: 'Lumbar MRI results review.',                           requiresFollowUp: false, createdAt: ts(4) },
        { patientName: 'Benjamin Carter',    doctorName: 'Dr. Sarah Chen',     type: 'Follow-up',        date: t, timeStart: '15:30', timeEnd: '16:00', status: 'Scheduled',   notes: 'Blood glucose A1C assessment.',                        requiresFollowUp: true, followUpDate: daysFromNow(45), createdAt: ts(2) },
        { patientName: 'Damilola Ogunleye',  doctorName: 'Dr. Sarah Chen',     type: 'Cardiology',       date: t, timeStart: '16:00', timeEnd: '16:30', status: 'Scheduled',   notes: 'Post-PCI echo and stress test planning.',              requiresFollowUp: false, createdAt: ts(1) },

        // ── UPCOMING ──
        { patientName: 'Fatima Al-Hassan',   doctorName: 'Dr. Sarah Chen',     type: 'Follow-up',        date: daysFromNow(1), timeStart: '09:00', timeEnd: '09:30', status: 'Scheduled', notes: 'BP control post-crisis review.',          requiresFollowUp: false, createdAt: ts(1) },
        { patientName: 'Taiwo Adeyemi',      doctorName: 'Dr. Adaeze Nwosu',   type: 'Follow-up',        date: daysFromNow(1), timeStart: '10:00', timeEnd: '10:30', status: 'Scheduled', notes: 'Sickle cell discharge planning.',          requiresFollowUp: false, createdAt: ts(2) },
        { patientName: 'Ngozi Eze',          doctorName: 'Dr. Kemi Oladapo',   type: 'Antenatal',        date: daysFromNow(3), timeStart: '11:00', timeEnd: '11:30', status: 'Scheduled', notes: '30-week scan + GDM review.',               requiresFollowUp: false, createdAt: ts(3) },
        { patientName: 'Ifeoma Adeleke',     doctorName: 'Dr. James Okonkwo',  type: 'Follow-up',        date: daysFromNow(7), timeStart: '09:00', timeEnd: '09:30', status: 'Scheduled', notes: 'Paediatric asthma control assessment.',    requiresFollowUp: false, createdAt: ts(4) },
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',     type: 'Follow-up',        date: daysFromNow(14), timeStart: '09:00', timeEnd: '09:30', status: 'Scheduled', notes: 'Lipid panel re-check after statin.',      requiresFollowUp: false, createdAt: ts(5) },
        { patientName: 'Precious Anozie',    doctorName: 'Dr. Adaeze Nwosu',   type: 'Follow-up',        date: daysFromNow(30), timeStart: '10:00', timeEnd: '10:30', status: 'Scheduled', notes: 'H. pylori eradication check.',             requiresFollowUp: false, createdAt: ts(6) },

        // ── PAST COMPLETED ──
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',     type: 'Consultation',     date: daysAgo(7),  timeStart: '09:00', timeEnd: '09:30', status: 'Completed', notes: 'Initial hypertension assessment. Started lisinopril.', requiresFollowUp: true, followUpDate: t, createdAt: ts(8) },
        { patientName: 'Elena Rodriguez',    doctorName: 'Dr. Emily Watson',   type: 'Check-up',         date: daysAgo(14), timeStart: '10:30', timeEnd: '11:00', status: 'Completed', notes: 'Spirometry normal. Inhaler technique reviewed.', requiresFollowUp: false, createdAt: ts(16) },
        { patientName: 'Amara Diallo',       doctorName: 'Dr. Priya Sharma',   type: 'Imaging',          date: daysAgo(10), timeStart: '08:00', timeEnd: '08:45', status: 'Completed', notes: 'Abdominal ultrasound — anaemia workup.', requiresFollowUp: false, createdAt: ts(12) },
        { patientName: 'Samuel Mensah',      doctorName: 'Dr. Michael Torres', type: 'Emergency',        date: daysAgo(3),  timeStart: '22:40', timeEnd: '23:30', status: 'Completed', notes: 'AF episode. Cardioversion done. Admitted ICU.', requiresFollowUp: false, createdAt: ts(4) },
        { patientName: 'Sophia Turner',      doctorName: 'Dr. Tunde Balogun',  type: 'Consultation',     date: daysAgo(21), timeStart: '14:00', timeEnd: '14:30', status: 'Completed', notes: 'Initial anxiety assessment. Sertraline started.', requiresFollowUp: true, followUpDate: t, createdAt: ts(22) },
        { patientName: 'Olumide Bakare',     doctorName: 'Dr. Adaeze Nwosu',   type: 'Consultation',     date: daysAgo(12), timeStart: '11:00', timeEnd: '11:30', status: 'Completed', notes: 'BPH symptoms, PSA ordered. Tamsulosin started.', requiresFollowUp: true, followUpDate: t, createdAt: ts(13) },
        { patientName: 'Grace Oduya',        doctorName: 'Dr. David Kim',      type: 'Post-surgery',     date: daysAgo(30), timeStart: '10:00', timeEnd: '10:30', status: 'Completed', notes: 'ORIF tibia — operative notes documented.', requiresFollowUp: true, followUpDate: t, createdAt: ts(31) },
      ])

    // ── ROOMS ─────────────────────────────────────────────────────
    await clearCollection('rooms')
      await addMany('rooms', [
        { roomNumber: '101', type: 'ICU',            floor: '1', capacity: 1, status: 'Occupied',    patientName: 'Henry Wilson',        notes: 'O2 supply and cardiac monitor active.',                     createdAt: ts(25) },
        { roomNumber: '102', type: 'ICU',            floor: '1', capacity: 1, status: 'Occupied',    patientName: 'Chidera Nwachukwu',   notes: 'High-flow O2 + IV antibiotics.',                            createdAt: ts(2) },
        { roomNumber: '103', type: 'ICU',            floor: '1', capacity: 1, status: 'Vacant',      patientName: '',                    notes: 'Sanitised and ready for admission.',                         createdAt: ts(1) },
        { roomNumber: '204', type: 'Private Room',   floor: '2', capacity: 1, status: 'Occupied',    patientName: 'Benjamin Carter',     notes: 'Diabetic diet tray. IV access in place.',                   createdAt: ts(45) },
        { roomNumber: '205', type: 'Private Room',   floor: '2', capacity: 1, status: 'Occupied',    patientName: 'Fatima Al-Hassan',    notes: 'BP monitoring q4h. Restricted salt diet.',                  createdAt: ts(2) },
        { roomNumber: '211', type: 'Private Room',   floor: '2', capacity: 1, status: 'Occupied',    patientName: 'Damilola Ogunleye',   notes: 'Post-PCI. Cardiac monitor, dual antiplatelet therapy.',     createdAt: ts(2) },
        { roomNumber: '215', type: 'Private Room',   floor: '2', capacity: 1, status: 'Vacant',      patientName: '',                    notes: 'En-suite bathroom.',                                         createdAt: ts(24) },
        { roomNumber: '301', type: 'General Ward',   floor: '3', capacity: 4, status: 'Occupied',    patientName: 'Shared — 3 of 4',    notes: 'Chukwuemeka Obi, Taiwo Adeyemi and one other.',             createdAt: ts(10) },
        { roomNumber: '303', type: 'General Ward',   floor: '3', capacity: 4, status: 'Occupied',    patientName: 'Shared — 2 of 4',    notes: 'Emmanuel Abubakar and one other.',                           createdAt: ts(3) },
        { roomNumber: '308', type: 'Private Room',   floor: '3', capacity: 1, status: 'Occupied',    patientName: 'Taiwo Adeyemi',       notes: 'Sickle cell protocol — analgesia and IV fluids.',           createdAt: ts(4) },
        { roomNumber: '312', type: 'ICU',            floor: '3', capacity: 1, status: 'Occupied',    patientName: 'Samuel Mensah',       notes: 'Cardiac telemetry, restricted access.',                     createdAt: ts(35) },
        { roomNumber: '402', type: 'General Ward',   floor: '4', capacity: 4, status: 'Occupied',    patientName: 'Babatunde Olatunde',  notes: 'Post-appendicectomy. Wound care daily.',                    createdAt: ts(1) },
        { roomNumber: '501', type: 'Operating Room', floor: '5', capacity: 1, status: 'Vacant',      patientName: '',                    notes: 'Last sterilised today.',                                     createdAt: ts(1) },
        { roomNumber: '502', type: 'Operating Room', floor: '5', capacity: 1, status: 'Maintenance', patientName: '',                    notes: 'Anaesthesia machine service in progress.',                   createdAt: ts(2) },
      ])

    // ── LAB RESULTS ───────────────────────────────────────────────
    await clearCollection('labResults')
      await addMany('labResults', [
        { patientName: 'Marcus Johnson',     testName: 'Lipid Panel',              result: 'LDL 162 mg/dL, HDL 38 mg/dL, TG 210 mg/dL',    normalRange: 'LDL <130, HDL >40, TG <150',          status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',     date: daysAgo(2),  notes: 'High LDL. Atorvastatin 20mg started.', createdAt: ts(3) },
        { patientName: 'Benjamin Carter',    testName: 'HbA1c',                    result: '8.9%',                                           normalRange: '<5.7% normal, <7% diabetic target',   status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',     date: daysAgo(5),  notes: 'Above target. Insulin adjustment.', createdAt: ts(6) },
        { patientName: 'Chukwuemeka Obi',    testName: 'Malaria RDT',              result: 'Positive — P. falciparum',                       normalRange: 'Negative',                             status: 'Abnormal', orderedBy: 'Dr. Adaeze Nwosu',   date: daysAgo(3),  notes: 'Severe malaria confirmed. IV artesunate commenced.', createdAt: ts(4) },
        { patientName: 'Samuel Mensah',      testName: 'Cardiac Troponin I',       result: '0.08 ng/mL',                                     normalRange: '<0.04 ng/mL',                          status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',     date: daysAgo(3),  notes: 'Elevated. Myocardial damage — close monitoring.', createdAt: ts(4) },
        { patientName: 'Emmanuel Abubakar',  testName: 'Full Blood Count',         result: 'Hgb 6.8 g/dL, WBC 9.2, Plt 188',                normalRange: 'Hgb 13-17, WBC 4-11, Plt 150-400',    status: 'Abnormal', orderedBy: 'Dr. Adaeze Nwosu',   date: daysAgo(3),  notes: 'Severe anaemia. Transfusion started.', createdAt: ts(4) },
        { patientName: 'Taiwo Adeyemi',      testName: 'Haemoglobin Electrophoresis', result: 'HbSS — Sickle Cell Disease confirmed',       normalRange: 'HbAA',                                 status: 'Abnormal', orderedBy: 'Dr. Adaeze Nwosu',   date: daysAgo(60), notes: 'Previously established diagnosis.', createdAt: ts(60) },
        { patientName: 'Fatima Al-Hassan',   testName: 'Renal Function Test',      result: 'Creatinine 1.4 mg/dL, eGFR 52 mL/min',          normalRange: 'Creatinine 0.7-1.2, eGFR >60',        status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',     date: daysAgo(2),  notes: 'Mild renal impairment — monitor closely.', createdAt: ts(3) },
        { patientName: 'Henry Wilson',       testName: 'Arterial Blood Gas',       result: 'pH 7.32, PaO2 58, PaCO2 51',                    normalRange: 'pH 7.35-7.45, PaO2 >80, PaCO2 35-45',status: 'Abnormal', orderedBy: 'Dr. Michael Torres',  date: daysAgo(1),  notes: 'Hypercapnic failure. O2 adjusted.', createdAt: ts(2) },
        { patientName: 'Chidera Nwachukwu',  testName: 'Chest X-Ray',              result: 'Right lower lobe consolidation',                 normalRange: 'Clear lung fields',                    status: 'Abnormal', orderedBy: 'Dr. Michael Torres',  date: daysAgo(2),  notes: 'Consistent with lobar pneumonia.', createdAt: ts(3) },
        { patientName: 'Ngozi Eze',          testName: 'Oral Glucose Tolerance',   result: '2h glucose 8.9 mmol/L',                          normalRange: '<7.8 mmol/L',                          status: 'Abnormal', orderedBy: 'Dr. Kemi Oladapo',   date: daysAgo(10), notes: 'GDM confirmed. Dietary management started.', createdAt: ts(11) },
        { patientName: 'Amara Diallo',       testName: 'Serum Iron & Ferritin',    result: 'Iron 42 µg/dL, Ferritin 6 ng/mL',               normalRange: 'Iron 60-170, Ferritin 12-150',         status: 'Abnormal', orderedBy: 'Dr. Adaeze Nwosu',   date: daysAgo(10), notes: 'Iron deficiency confirmed. IV iron therapy.', createdAt: ts(11) },
        { patientName: 'Olivia Park',        testName: 'Thyroid Function',         result: 'TSH 2.1 mIU/L, T4 1.1 ng/dL',                   normalRange: 'TSH 0.4-4.0, T4 0.8-1.8',             status: 'Normal',   orderedBy: 'Dr. Emily Watson',   date: daysAgo(7),  notes: 'Normal. Migraine not thyroid-related.', createdAt: ts(8) },
        { patientName: 'Grace Oduya',        testName: 'X-Ray Right Tibia',        result: 'Callus formation, good alignment',                normalRange: 'N/A',                                  status: 'Normal',   orderedBy: 'Dr. Priya Sharma',   date: daysAgo(6),  notes: 'Healing well. Hardware intact.', createdAt: ts(7) },
        { patientName: 'Damilola Ogunleye',  testName: 'Coronary Angiogram',       result: 'LAD 90% stenosis — stent placed',                normalRange: 'N/A',                                  status: 'Abnormal', orderedBy: 'Dr. Sarah Chen',     date: daysAgo(3),  notes: 'Successful PCI. Dual antiplatelet commenced.', createdAt: ts(4) },
      ])

    // ── BILLING ───────────────────────────────────────────────────
    await clearCollection('billing')
      await addMany('billing', [
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',     description: 'Cardiology consultation + ECG + lipid panel',        total: 45000,   date: daysAgo(7),  status: 'Paid',    paymentMethod: 'AIICO Insurance',    createdAt: ts(8) },
        { patientName: 'Benjamin Carter',    doctorName: 'Dr. Sarah Chen',     description: 'Inpatient diabetes management — 5 days',             total: 680000,  date: daysAgo(5),  status: 'Pending', paymentMethod: 'NHIS',               createdAt: ts(6) },
        { patientName: 'Chukwuemeka Obi',    doctorName: 'Dr. Adaeze Nwosu',   description: 'Malaria admission + IV artesunate 3 days',           total: 185000,  date: daysAgo(3),  status: 'Pending', paymentMethod: 'NHIS',               createdAt: ts(4) },
        { patientName: 'Samuel Mensah',      doctorName: 'Dr. Sarah Chen',     description: 'Emergency cardiac care + ICU Day 1 + cardioversion', total: 950000,  date: daysAgo(3),  status: 'Pending', paymentMethod: 'Reliance HMO',       createdAt: ts(4) },
        { patientName: 'Henry Wilson',       doctorName: 'Dr. Michael Torres', description: 'Emergency COPD + ICU admission + O2 therapy',        total: 820000,  date: daysAgo(1),  status: 'Pending', paymentMethod: 'Axamansard',         createdAt: ts(2) },
        { patientName: 'Amara Diallo',       doctorName: 'Dr. Adaeze Nwosu',   description: 'Iron infusion therapy × 4 sessions',                 total: 128000,  date: daysAgo(10), status: 'Paid',    paymentMethod: 'NHIS',               createdAt: ts(11) },
        { patientName: 'Grace Oduya',        doctorName: 'Dr. David Kim',      description: 'ORIF tibia surgery + anaesthesia + implant',         total: 1450000, date: daysAgo(30), status: 'Paid',    paymentMethod: 'AIICO Insurance',    createdAt: ts(31) },
        { patientName: 'Olivia Park',        doctorName: 'Dr. Emily Watson',   description: 'Neurology consultation + MRI referral',              total: 38500,   date: daysAgo(21), status: 'Overdue', paymentMethod: 'Self-pay',           createdAt: ts(22) },
        { patientName: 'Fatima Al-Hassan',   doctorName: 'Dr. Adaeze Nwosu',   description: 'Hypertensive crisis admission + IV labetalol',       total: 265000,  date: daysAgo(2),  status: 'Pending', paymentMethod: 'AIICO Insurance',    createdAt: ts(3) },
        { patientName: 'Taiwo Adeyemi',      doctorName: 'Dr. Adaeze Nwosu',   description: 'Sickle cell crisis — fluids + analgesics 4 days',    total: 320000,  date: daysAgo(4),  status: 'Pending', paymentMethod: 'Leadway Health',     createdAt: ts(5) },
        { patientName: 'Babatunde Olatunde', doctorName: 'Dr. Biodun Afolabi', description: 'Laparoscopic appendicectomy + anaesthesia',          total: 780000,  date: daysAgo(1),  status: 'Pending', paymentMethod: 'Reliance HMO',       createdAt: ts(2) },
        { patientName: 'Damilola Ogunleye',  doctorName: 'Dr. Sarah Chen',     description: 'PCI (coronary stenting) + ICU 2 days',               total: 2100000, date: daysAgo(2),  status: 'Pending', paymentMethod: 'Axamansard',         createdAt: ts(3) },
        { patientName: 'Emmanuel Abubakar',  doctorName: 'Dr. Adaeze Nwosu',   description: 'Blood transfusion 2 units + malaria treatment',      total: 210000,  date: daysAgo(3),  status: 'Paid',    paymentMethod: 'Cash',               createdAt: ts(4) },
        { patientName: 'Ngozi Eze',          doctorName: 'Dr. Kemi Oladapo',   description: 'Antenatal GDM workup + OGTT',                        total: 52000,   date: daysAgo(10), status: 'Paid',    paymentMethod: 'Hygeia HMO',         createdAt: ts(11) },
      ])

    // ── INVENTORY ─────────────────────────────────────────────────
    await clearCollection('inventory')
      await addMany('inventory', [
        { name: 'Artesunate Injection 60mg',    category: 'Medication',  quantity: 120, unit: 'vials',    reorderLevel: 50,  supplier: 'Emzor Pharma',          location: 'Pharmacy Store A',  status: 'In Stock',     createdAt: ts(30) },
        { name: 'Ciprofloxacin 500mg Tabs',     category: 'Medication',  quantity: 600, unit: 'tablets',  reorderLevel: 200, supplier: 'May & Baker Nigeria',   location: 'Pharmacy Shelf B1', status: 'In Stock',     createdAt: ts(60) },
        { name: 'Insulin Glargine 100u/mL',     category: 'Medication',  quantity: 38,  unit: 'vials',    reorderLevel: 50,  supplier: 'Sanofi Nigeria',        location: 'Cold Storage C1',   status: 'Low Stock',    createdAt: ts(45) },
        { name: 'Salbutamol Inhaler 100mcg',    category: 'Medication',  quantity: 72,  unit: 'pieces',   reorderLevel: 30,  supplier: 'GlaxoSmithKline',       location: 'Pharmacy Shelf B3', status: 'In Stock',     createdAt: ts(40) },
        { name: 'Amlodipine 5mg Tabs',          category: 'Medication',  quantity: 900, unit: 'tablets',  reorderLevel: 300, supplier: 'Fidson Healthcare',     location: 'Pharmacy Shelf A2', status: 'In Stock',     createdAt: ts(50) },
        { name: 'Metformin 500mg Tabs',         category: 'Medication',  quantity: 750, unit: 'tablets',  reorderLevel: 250, supplier: 'Emzor Pharma',          location: 'Pharmacy Shelf A3', status: 'In Stock',     createdAt: ts(55) },
        { name: 'IV Normal Saline 0.9% 1L',     category: 'Consumable',  quantity: 220, unit: 'bags',     reorderLevel: 100, supplier: 'Spectralink Med',       location: 'Store Room 2',      status: 'In Stock',     createdAt: ts(55) },
        { name: 'Disposable Syringes 5mL',      category: 'Consumable',  quantity: 14,  unit: 'boxes',    reorderLevel: 20,  supplier: 'Medline Nigeria',       location: 'Store Room 1',      status: 'Low Stock',    createdAt: ts(50) },
        { name: 'Surgical Gloves Medium',       category: 'Consumable',  quantity: 0,   unit: 'boxes',    reorderLevel: 15,  supplier: 'SafeGuard Corp.',       location: 'Store Room 1',      status: 'Out of Stock', createdAt: ts(48) },
        { name: 'Blood Pressure Monitor',       category: 'Equipment',   quantity: 12,  unit: 'pieces',   reorderLevel: 3,   supplier: 'Omron Medical',         location: 'Nursing Station',   status: 'In Stock',     createdAt: ts(365) },
        { name: 'Pulse Oximeter',               category: 'Equipment',   quantity: 18,  unit: 'pieces',   reorderLevel: 5,   supplier: 'Nellcor Devices',       location: 'Nursing Station',   status: 'In Stock',     createdAt: ts(300) },
        { name: 'Oxygen Cylinder (E-size)',      category: 'Equipment',   quantity: 8,   unit: 'pieces',   reorderLevel: 4,   supplier: 'AirGas Nigeria',        location: 'ICU Bay',           status: 'In Stock',     createdAt: ts(90) },
        { name: 'Rapid Diagnostic Test (RDT)',  category: 'Consumable',  quantity: 180, unit: 'kits',     reorderLevel: 100, supplier: 'Chemed',                location: 'Lab Store',         status: 'In Stock',     createdAt: ts(30) },
        { name: 'Sterile Wound Dressing 10×10', category: 'Consumable',  quantity: 310, unit: 'pieces',   reorderLevel: 120, supplier: 'Medline Nigeria',       location: 'Nursing Station',   status: 'In Stock',     createdAt: ts(30) },
        { name: 'Lidocaine Injection 1%',       category: 'Medication',  quantity: 24,  unit: 'vials',    reorderLevel: 30,  supplier: 'May & Baker Nigeria',   location: 'Cold Storage C2',   status: 'Low Stock',    createdAt: ts(20) },
        { name: 'Hydroxyurea 500mg Caps',       category: 'Medication',  quantity: 150, unit: 'capsules', reorderLevel: 60,  supplier: 'Emzor Pharma',          location: 'Pharmacy Shelf D1', status: 'In Stock',     createdAt: ts(25) },
      ])

    // ── EXPENSES ──────────────────────────────────────────────────
    await clearCollection('expenses')
      await addMany('expenses', [
        { description: 'Medical Staff Salaries — March',     category: 'Salaries',    amount: 18400000, date: daysAgo(46), status: 'Paid',    vendor: 'Internal Payroll',          recurring: true,  createdAt: ts(47) },
        { description: 'Electricity & EKEDC Bills — March', category: 'Utilities',   amount: 1250000,  date: daysAgo(46), status: 'Paid',    vendor: 'Eko Electricity DISCOM',    recurring: true,  createdAt: ts(47) },
        { description: 'Generator Fuel (AGO) — March',      category: 'Utilities',   amount: 980000,   date: daysAgo(44), status: 'Paid',    vendor: 'TotalEnergies Nigeria',     recurring: true,  createdAt: ts(45) },
        { description: 'Medical Equipment Lease — Q2',      category: 'Equipment',   amount: 2800000,  date: daysAgo(16), status: 'Paid',    vendor: 'Siemens Healthineers',      recurring: false, createdAt: ts(17) },
        { description: 'Drug & Pharma Supplies — April',    category: 'Supplies',    amount: 2100000,  date: daysAgo(10), status: 'Paid',    vendor: 'Emzor Pharma / May & Baker',recurring: false, createdAt: ts(11) },
        { description: 'Medical Staff Salaries — April',    category: 'Salaries',    amount: 18400000, date: daysAgo(16), status: 'Pending', vendor: 'Internal Payroll',          recurring: true,  createdAt: ts(17) },
        { description: 'Cleaning & Waste Disposal',         category: 'Maintenance', amount: 420000,   date: daysAgo(5),  status: 'Paid',    vendor: 'CleanMed Services Ltd',     recurring: true,  createdAt: ts(6) },
        { description: 'MRI Machine Preventive Maintenance',category: 'Equipment',   amount: 1500000,  date: daysAgo(3),  status: 'Pending', vendor: 'GE Healthcare Nigeria',     recurring: false, createdAt: ts(4) },
        { description: 'Laundry & Linen Services',          category: 'Maintenance', amount: 185000,   date: daysAgo(2),  status: 'Paid',    vendor: 'CleanMed Services Ltd',     recurring: true,  createdAt: ts(3) },
        { description: 'Office & Admin Supplies — April',   category: 'Supplies',    amount: 165000,   date: daysAgo(2),  status: 'Pending', vendor: 'Jumia Business',            recurring: true,  createdAt: ts(3) },
      ])

    // ── PRESCRIPTIONS ─────────────────────────────────────────────
    await clearCollection('prescriptions')
      await addMany('prescriptions', [
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',    date: daysAgo(7),  status: 'Active',    notes: 'Take with food. Avoid alcohol. Monitor BP weekly.',          medications: [{ name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '90 days' }, { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once at night', duration: '90 days' }], createdAt: ts(8) },
        { patientName: 'Elena Rodriguez',    doctorName: 'Dr. Emily Watson',  date: daysAgo(14), status: 'Active',    notes: 'Use rescue inhaler as needed. Carry at all times.',           medications: [{ name: 'Salbutamol Inhaler', dosage: '100mcg/puff', frequency: 'As needed', duration: 'Ongoing' }, { name: 'Budesonide Inhaler', dosage: '200mcg', frequency: 'Twice daily', duration: '60 days' }], createdAt: ts(15) },
        { patientName: 'Benjamin Carter',    doctorName: 'Dr. Sarah Chen',    date: daysAgo(5),  status: 'Active',    notes: 'Administer after meals. Monitor blood glucose 4×/day.',       medications: [{ name: 'Insulin Glargine', dosage: '20 units', frequency: 'Once at bedtime', duration: 'Ongoing' }, { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' }], createdAt: ts(6) },
        { patientName: 'Olivia Park',        doctorName: 'Dr. Emily Watson',  date: daysAgo(21), status: 'Active',    notes: 'Avoid bright screens during migraine episodes.',              medications: [{ name: 'Topiramate', dosage: '25mg', frequency: 'Once daily', duration: '60 days' }, { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed (max 2/day)', duration: '30 days' }], createdAt: ts(22) },
        { patientName: 'Sophia Turner',      doctorName: 'Dr. Tunde Balogun', date: daysAgo(10), status: 'Active',    notes: 'Do not stop suddenly. Review in 4 weeks.',                   medications: [{ name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', duration: '60 days' }], createdAt: ts(11) },
        { patientName: 'Chukwuemeka Obi',    doctorName: 'Dr. Adaeze Nwosu',  date: daysAgo(3),  status: 'Active',    notes: 'IV therapy in progress. Oral transition on day 4.',           medications: [{ name: 'Artesunate', dosage: '60mg', frequency: 'IV at 0, 12, 24, 48h', duration: '3 days' }, { name: 'Artesunate-Lumefantrine', dosage: '4 tabs', frequency: 'Twice daily', duration: '3 days (oral follow-up)' }], createdAt: ts(4) },
        { patientName: 'Yetunde Okafor',     doctorName: 'Dr. Adaeze Nwosu',  date: daysAgo(5),  status: 'Active',    notes: 'Complete the full 7-day course even if feeling better.',      medications: [{ name: 'Ciprofloxacin', dosage: '500mg', frequency: 'Twice daily', duration: '7 days' }, { name: 'Oral Rehydration Salts', dosage: '1 sachet', frequency: 'After every loose stool', duration: '5 days' }], createdAt: ts(6) },
        { patientName: 'Taiwo Adeyemi',      doctorName: 'Dr. Adaeze Nwosu',  date: daysAgo(4),  status: 'Active',    notes: 'Ensure adequate hydration. Hydroxyurea long-term.',           medications: [{ name: 'Hydroxyurea', dosage: '500mg', frequency: 'Once daily', duration: 'Ongoing' }, { name: 'Folic Acid', dosage: '5mg', frequency: 'Once daily', duration: 'Ongoing' }, { name: 'Tramadol', dosage: '50mg', frequency: 'Every 6h PRN pain', duration: '5 days' }], createdAt: ts(5) },
        { patientName: 'Ngozi Eze',          doctorName: 'Dr. Kemi Oladapo',  date: daysAgo(10), status: 'Active',    notes: 'Low GI diet. Monitor fasting + post-meal glucose daily.',    medications: [{ name: 'Metformin', dosage: '500mg', frequency: 'With meals (BD)', duration: '90 days' }, { name: 'Folic Acid', dosage: '5mg', frequency: 'Once daily', duration: 'Until delivery' }], createdAt: ts(11) },
        { patientName: 'Fatima Al-Hassan',   doctorName: 'Dr. Adaeze Nwosu',  date: daysAgo(2),  status: 'Active',    notes: 'Monitor BP q4h. Reduce salt intake.',                        medications: [{ name: 'Amlodipine', dosage: '10mg', frequency: 'Once daily', duration: '90 days' }, { name: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily (morning)', duration: '90 days' }], createdAt: ts(3) },
        { patientName: 'Ifeoma Adeleke',     doctorName: 'Dr. James Okonkwo', date: daysAgo(14), status: 'Active',    notes: 'Preventer daily, rescue only when needed. Record peak flow.', medications: [{ name: 'Budesonide Inhaler', dosage: '100mcg/puff', frequency: 'Two puffs twice daily', duration: 'Ongoing' }, { name: 'Salbutamol Inhaler', dosage: '100mcg/puff', frequency: 'As needed', duration: 'Ongoing' }], createdAt: ts(15) },
        { patientName: 'Grace Oduya',        doctorName: 'Dr. David Kim',     date: daysAgo(30), status: 'Completed', notes: 'Post-surgical pain management. Completed full course.',        medications: [{ name: 'Diclofenac', dosage: '75mg', frequency: 'Twice daily (with food)', duration: '14 days' }, { name: 'Calcium + Vitamin D3', dosage: '600mg/400IU', frequency: 'Once daily', duration: '90 days' }], createdAt: ts(31) },
      ])

    // ── INSURANCE CLAIMS ──────────────────────────────────────────
    await clearCollection('claims')
      await addMany('claims', [
        { patientName: 'Marcus Johnson',     insuranceProvider: 'AIICO Insurance',  policyNumber: 'AIICO-2024-00721', coverageType: 'Outpatient',  claimAmount: 45000,   approvedAmount: 40500,  invoiceNumber: 'MCH-0001', submittedDate: daysAgo(6),  status: 'Confirmed', notes: '90% outpatient cover approved.',                   createdAt: ts(7) },
        { patientName: 'Benjamin Carter',    insuranceProvider: 'NHIS',             policyNumber: 'NHIS-TX-94847',    coverageType: 'Inpatient',   claimAmount: 680000,  approvedAmount: null,   invoiceNumber: 'MCH-0002', submittedDate: daysAgo(4),  status: 'Pending',   notes: 'Awaiting NHIS pre-authorisation for extended stay.',createdAt: ts(5) },
        { patientName: 'Samuel Mensah',      insuranceProvider: 'Reliance HMO',     policyNumber: 'REL-2024-55103',   coverageType: 'Emergency',   claimAmount: 950000,  approvedAmount: null,   invoiceNumber: 'MCH-0004', submittedDate: daysAgo(2),  status: 'Pending',   notes: 'Emergency cardiac event — awaiting HMO approval.', createdAt: ts(3) },
        { patientName: 'Grace Oduya',        insuranceProvider: 'AIICO Insurance',  policyNumber: 'AIICO-2024-01092', coverageType: 'Surgical',    claimAmount: 1450000, approvedAmount: 1305000,invoiceNumber: 'MCH-0007', submittedDate: daysAgo(28), status: 'Confirmed', notes: '90% surgical cover. Balance ₦145,000 by patient.',  createdAt: ts(29) },
        { patientName: 'Henry Wilson',       insuranceProvider: 'Axamansard',       policyNumber: 'AXA-2024-77821',   coverageType: 'Emergency',   claimAmount: 820000,  approvedAmount: null,   invoiceNumber: 'MCH-0005', submittedDate: daysAgo(1),  status: 'Pending',   notes: 'ICU emergency claim. Awaiting AXA authorisation.',  createdAt: ts(2) },
        { patientName: 'Amara Diallo',       insuranceProvider: 'NHIS',             policyNumber: 'NHIS-2024-33210',  coverageType: 'Outpatient',  claimAmount: 128000,  approvedAmount: 115200, invoiceNumber: 'MCH-0006', submittedDate: daysAgo(9),  status: 'Confirmed', notes: 'Iron infusion 90% approved by NHIS.',               createdAt: ts(10) },
        { patientName: 'Taiwo Adeyemi',      insuranceProvider: 'Leadway Health',   policyNumber: 'LW-2024-12345',    coverageType: 'Inpatient',   claimAmount: 320000,  approvedAmount: null,   invoiceNumber: 'MCH-0010', submittedDate: daysAgo(3),  status: 'Pending',   notes: 'Sickle cell crisis claim submitted.',               createdAt: ts(4) },
        { patientName: 'Babatunde Olatunde', insuranceProvider: 'Reliance HMO',     policyNumber: 'REL-2024-88765',   coverageType: 'Surgical',    claimAmount: 780000,  approvedAmount: null,   invoiceNumber: 'MCH-0011', submittedDate: daysAgo(1),  status: 'Pending',   notes: 'Appendicectomy surgical claim. Pre-auth in progress.',createdAt: ts(2) },
        { patientName: 'Damilola Ogunleye',  insuranceProvider: 'Axamansard',       policyNumber: 'AXA-2024-99102',   coverageType: 'Cardiac',     claimAmount: 2100000, approvedAmount: null,   invoiceNumber: 'MCH-0012', submittedDate: daysAgo(2),  status: 'Pending',   notes: 'PCI procedure — high-value claim. Specialist review.',createdAt: ts(3) },
        { patientName: 'Ngozi Eze',          insuranceProvider: 'Hygeia HMO',       policyNumber: 'HYG-2024-56781',   coverageType: 'Antenatal',   claimAmount: 52000,   approvedAmount: 46800,  invoiceNumber: 'MCH-0014', submittedDate: daysAgo(9),  status: 'Confirmed', notes: 'GDM workup approved at 90%.',                       createdAt: ts(10) },
      ])

    // ── PHARMACY ORDERS ───────────────────────────────────────────
    await clearCollection('pharmacyOrders')
      await addMany('pharmacyOrders', [
        { patientName: 'Marcus Johnson',     doctorName: 'Dr. Sarah Chen',    medications: [{ name: 'Lisinopril 10mg', qty: 90 }, { name: 'Atorvastatin 20mg', qty: 90 }],                             status: 'Dispensed', pharmacistName: 'Pharm. Mark Owens',  dispensedAt: daysAgo(6),  advancePayment: 8500,   notes: '3-month supply dispensed.', createdAt: ts(7) },
        { patientName: 'Elena Rodriguez',    doctorName: 'Dr. Emily Watson',  medications: [{ name: 'Salbutamol Inhaler', qty: 2 }, { name: 'Budesonide Inhaler', qty: 1 }],                          status: 'Dispensed', pharmacistName: 'Pharm. Linda Park',  dispensedAt: daysAgo(13), advancePayment: 6200,   notes: 'Patient counselled on inhaler technique.', createdAt: ts(14) },
        { patientName: 'Benjamin Carter',    doctorName: 'Dr. Sarah Chen',    medications: [{ name: 'Insulin Glargine', qty: 3 }, { name: 'Metformin 500mg', qty: 60 }],                              status: 'Ready',     pharmacistName: '',                   dispensedAt: null,        advancePayment: 4000,   notes: 'Insulin stored in cold room.', createdAt: ts(2) },
        { patientName: 'Sophia Turner',      doctorName: 'Dr. Tunde Balogun', medications: [{ name: 'Sertraline 50mg', qty: 60 }],                                                                    status: 'Pending',   pharmacistName: '',                   dispensedAt: null,        advancePayment: 0,      notes: 'Awaiting stock.', createdAt: ts(1) },
        { patientName: 'Chukwuemeka Obi',    doctorName: 'Dr. Adaeze Nwosu',  medications: [{ name: 'Artesunate 60mg', qty: 4 }, { name: 'Artesunate-Lumefantrine', qty: 6 }],                       status: 'Dispensed', pharmacistName: 'Pharm. Tobi Alabi',  dispensedAt: daysAgo(3),  advancePayment: 12000,  notes: 'IV stock used from ward. Oral handover at discharge.', createdAt: ts(4) },
        { patientName: 'Yetunde Okafor',     doctorName: 'Dr. Adaeze Nwosu',  medications: [{ name: 'Ciprofloxacin 500mg', qty: 14 }, { name: 'ORS Sachets', qty: 5 }],                             status: 'Dispensed', pharmacistName: 'Pharm. Mark Owens',  dispensedAt: daysAgo(5),  advancePayment: 3500,   notes: 'Full course given. Patient counselled.', createdAt: ts(6) },
        { patientName: 'Taiwo Adeyemi',      doctorName: 'Dr. Adaeze Nwosu',  medications: [{ name: 'Hydroxyurea 500mg', qty: 30 }, { name: 'Folic Acid 5mg', qty: 30 }, { name: 'Tramadol 50mg', qty: 20 }], status: 'Dispensed', pharmacistName: 'Pharm. Linda Park', dispensedAt: daysAgo(4), advancePayment: 9500, notes: 'Long-term sickle cell medications dispensed.', createdAt: ts(5) },
        { patientName: 'Fatima Al-Hassan',   doctorName: 'Dr. Adaeze Nwosu',  medications: [{ name: 'Amlodipine 10mg', qty: 30 }, { name: 'Hydrochlorothiazide 25mg', qty: 30 }],                    status: 'Ready',     pharmacistName: '',                   dispensedAt: null,        advancePayment: 2800,   notes: 'Ready for collection.', createdAt: ts(1) },
        { patientName: 'Ifeoma Adeleke',     doctorName: 'Dr. James Okonkwo', medications: [{ name: 'Budesonide Inhaler 100mcg', qty: 2 }, { name: 'Salbutamol Inhaler', qty: 1 }],                  status: 'Dispensed', pharmacistName: 'Pharm. Tobi Alabi',  dispensedAt: daysAgo(14), advancePayment: 5200,   notes: 'Parent counselled on paediatric inhaler use.', createdAt: ts(15) },
        { patientName: 'Ngozi Eze',          doctorName: 'Dr. Kemi Oladapo',  medications: [{ name: 'Metformin 500mg', qty: 60 }, { name: 'Folic Acid 5mg', qty: 90 }],                              status: 'Dispensed', pharmacistName: 'Pharm. Mark Owens',  dispensedAt: daysAgo(10), advancePayment: 3000,   notes: 'GDM management + antenatal vitamins.', createdAt: ts(11) },
      ])

    // ── SHIFTS (current week) ─────────────────────────────────────
    await clearCollection('shifts')
      await addMany('shifts', [
        { day: 'Monday',    shiftType: 'Morning',   doctorName: 'Dr. Sarah Chen',      doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Morning',   doctorName: 'Dr. Adaeze Nwosu',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Afternoon', doctorName: 'Dr. Michael Torres',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Afternoon', doctorName: 'Dr. Biodun Afolabi',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Night',     doctorName: 'Dr. Emily Watson',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Monday',    shiftType: 'Night',     doctorName: 'Dr. Kemi Oladapo',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Morning',   doctorName: 'Dr. James Okonkwo',   doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Morning',   doctorName: 'Dr. Ngozi Obi',       doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Afternoon', doctorName: 'Dr. Sarah Chen',      doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Afternoon', doctorName: 'Dr. Tunde Balogun',   doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Tuesday',   shiftType: 'Night',     doctorName: 'Dr. Michael Torres',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Morning',   doctorName: 'Dr. Emily Watson',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Morning',   doctorName: 'Dr. Femi Adeleke',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Afternoon', doctorName: 'Dr. Priya Sharma',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Afternoon', doctorName: 'Dr. Adaeze Nwosu',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Wednesday', shiftType: 'Night',     doctorName: 'Dr. James Okonkwo',   doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Morning',   doctorName: 'Dr. Michael Torres',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Morning',   doctorName: 'Dr. Kemi Oladapo',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Afternoon', doctorName: 'Dr. Sarah Chen',      doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Afternoon', doctorName: 'Dr. Biodun Afolabi',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Thursday',  shiftType: 'Night',     doctorName: 'Dr. Ngozi Obi',       doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Morning',   doctorName: 'Dr. Sarah Chen',      doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Morning',   doctorName: 'Dr. Adaeze Nwosu',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Afternoon', doctorName: 'Dr. Emily Watson',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Afternoon', doctorName: 'Dr. Tunde Balogun',   doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Friday',    shiftType: 'Night',     doctorName: 'Dr. Priya Sharma',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Saturday',  shiftType: 'Morning',   doctorName: 'Dr. Michael Torres',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Saturday',  shiftType: 'Morning',   doctorName: 'Dr. Kemi Oladapo',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Saturday',  shiftType: 'Afternoon', doctorName: 'Dr. Femi Adeleke',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Saturday',  shiftType: 'Night',     doctorName: 'Dr. James Okonkwo',   doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Sunday',    shiftType: 'Morning',   doctorName: 'Dr. Adaeze Nwosu',    doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Sunday',    shiftType: 'Afternoon', doctorName: 'Dr. Michael Torres',  doctorId: '', weekStart, createdAt: ts(3) },
        { day: 'Sunday',    shiftType: 'Night',     doctorName: 'Dr. Emily Watson',    doctorId: '', weekStart, createdAt: ts(3) },
      ])

    // ── MEDICAL RECORDS ───────────────────────────────────────────
    await clearCollection('medicalRecords')
      await addMany('medicalRecords', [
        { patientId: 'seed-1',  patientName: 'Marcus Johnson',     date: daysAgo(7),  diagnosis: 'Essential Hypertension (I10)',              notes: 'BP 162/98 on presentation. Lisinopril started. Lifestyle modifications advised.',           doctor: 'Dr. Sarah Chen',     type: 'Consultation', vitals: { bp: '162/98', hr: 82, temp: 36.7, weight: 92 },  createdAt: ts(8) },
        { patientId: 'seed-2',  patientName: 'Benjamin Carter',    date: daysAgo(5),  diagnosis: 'Type 2 Diabetes Mellitus (E11)',            notes: 'Admitted for glycaemic control. HbA1c 8.9%. Insulin regime and dietitian referral.',        doctor: 'Dr. Sarah Chen',     type: 'Admission',    vitals: { bp: '140/88', hr: 76, temp: 37.1, weight: 88 },  createdAt: ts(6) },
        { patientId: 'seed-3',  patientName: 'Samuel Mensah',      date: daysAgo(3),  diagnosis: 'Paroxysmal Atrial Fibrillation (I48.0)',    notes: 'Acute AF episode. DC cardioversion successful. Anticoagulation initiated. ICU admission.',    doctor: 'Dr. Michael Torres', type: 'Emergency',    vitals: { bp: '118/74', hr: 144, temp: 37.0, weight: 79 }, createdAt: ts(4) },
        { patientId: 'seed-4',  patientName: 'Henry Wilson',       date: daysAgo(1),  diagnosis: 'COPD Exacerbation (J44.1)',                 notes: 'Hypercapnic failure. IV methylprednisolone + salbutamol nebulisation. ABG improved.',         doctor: 'Dr. Michael Torres', type: 'Emergency',    vitals: { bp: '138/82', hr: 110, temp: 38.2, weight: 66 }, createdAt: ts(2) },
        { patientId: 'seed-5',  patientName: 'Grace Oduya',        date: daysAgo(30), diagnosis: 'Closed Tibial Shaft Fracture (S82.2)',      notes: 'ORIF under spinal anaesthesia. Intramedullary nail placed. Post-op X-ray good.',             doctor: 'Dr. David Kim',      type: 'Surgical',     vitals: { bp: '122/76', hr: 70, temp: 36.9, weight: 67 },  createdAt: ts(31) },
        { patientId: 'seed-6',  patientName: 'Chukwuemeka Obi',    date: daysAgo(3),  diagnosis: 'Severe Malaria — P. falciparum (B50.0)',    notes: 'RDT positive. IV artesunate started. Parasitaemia >5%. Fluid resuscitation.',                 doctor: 'Dr. Adaeze Nwosu',   type: 'Admission',    vitals: { bp: '100/60', hr: 118, temp: 39.4, weight: 74 }, createdAt: ts(4) },
        { patientId: 'seed-7',  patientName: 'Taiwo Adeyemi',      date: daysAgo(4),  diagnosis: 'Sickle Cell Disease — Vaso-occlusive Crisis', notes: 'Pain crisis in limbs and chest. IV fluids + analgesia. O2 supplementation.',              doctor: 'Dr. Adaeze Nwosu',   type: 'Admission',    vitals: { bp: '108/68', hr: 102, temp: 37.8, weight: 60 }, createdAt: ts(5) },
        { patientId: 'seed-8',  patientName: 'Damilola Ogunleye',  date: daysAgo(3),  diagnosis: 'Ischaemic Heart Disease — LAD Stenosis (I25.1)', notes: 'Successful PCI. Drug-eluting stent in LAD. DAPT commenced. Cardiac rehab arranged.',    doctor: 'Dr. Sarah Chen',     type: 'Surgical',     vitals: { bp: '130/84', hr: 88, temp: 36.8, weight: 83 },  createdAt: ts(4) },
        { patientId: 'seed-9',  patientName: 'Babatunde Olatunde', date: daysAgo(1),  diagnosis: 'Acute Appendicitis (K37)',                  notes: 'Laparoscopic appendicectomy under GA. No perforation. Drain placed. Day 1 post-op stable.',  doctor: 'Dr. Biodun Afolabi', type: 'Surgical',     vitals: { bp: '116/72', hr: 84, temp: 37.3, weight: 78 },  createdAt: ts(2) },
        { patientId: 'seed-10', patientName: 'Ngozi Eze',          date: daysAgo(10), diagnosis: 'Gestational Diabetes Mellitus (O24.4)',     notes: '28 weeks. OGTT 8.9 mmol/L at 2h. Dietary advice given. Metformin started.',                 doctor: 'Dr. Kemi Oladapo',   type: 'Consultation', vitals: { bp: '112/70', hr: 78, temp: 36.6, weight: 72 },  createdAt: ts(11) },
      ])

    // ── DOCUMENTS ─────────────────────────────────────────────────
    await clearCollection('documents')
      await addMany('documents', [
        { patientName: 'Benjamin Carter',    title: 'Admission Consent Form',             type: 'Consent Form',   date: daysAgo(5),  size: '248 KB', uploadedBy: 'Admin',              notes: 'Signed and witnessed. Diabetes management plan attached.',          createdAt: ts(6) },
        { patientName: 'Samuel Mensah',      title: 'ICU Admission & Treatment Report',   type: 'Medical Report', date: daysAgo(3),  size: '512 KB', uploadedBy: 'Dr. Sarah Chen',     notes: 'Cardiac event summary and cardioversion protocol.',                  createdAt: ts(4) },
        { patientName: 'Grace Oduya',        title: 'Operative Report — Tibia ORIF',      type: 'Medical Report', date: daysAgo(30), size: '1.1 MB', uploadedBy: 'Dr. David Kim',      notes: 'Detailed operative notes including implant details.',                createdAt: ts(31) },
        { patientName: 'Marcus Johnson',     title: 'AIICO Insurance Pre-auth Letter',    type: 'Insurance',      date: daysAgo(8),  size: '184 KB', uploadedBy: 'Admin',              notes: 'Pre-authorisation for cardiology outpatient services.',              createdAt: ts(9) },
        { patientName: 'Elena Rodriguez',    title: 'Referral Letter — Pulmonologist',    type: 'Referral',       date: daysAgo(14), size: '96 KB',  uploadedBy: 'Dr. Emily Watson',   notes: 'Referral for spirometry follow-up and asthma management review.',    createdAt: ts(15) },
        { patientName: 'Chukwuemeka Obi',    title: 'Malaria Admission Consent',          type: 'Consent Form',   date: daysAgo(3),  size: '220 KB', uploadedBy: 'Admin',              notes: 'Consent for IV artesunate therapy.',                                createdAt: ts(4) },
        { patientName: 'Damilola Ogunleye',  title: 'PCI Procedure Consent & Report',     type: 'Medical Report', date: daysAgo(3),  size: '2.3 MB', uploadedBy: 'Dr. Sarah Chen',     notes: 'Coronary angiogram and stenting full report.',                       createdAt: ts(4) },
        { patientName: 'Babatunde Olatunde', title: 'Surgical Consent — Appendicectomy',  type: 'Consent Form',   date: daysAgo(1),  size: '190 KB', uploadedBy: 'Admin',              notes: 'Signed pre-operative consent including anaesthesia risks.',          createdAt: ts(2) },
        { patientName: 'Ngozi Eze',          title: 'Antenatal GDM Care Plan',            type: 'Medical Report', date: daysAgo(10), size: '310 KB', uploadedBy: 'Dr. Kemi Oladapo',  notes: 'GDM management plan with dietary guidelines and monitoring schedule.',createdAt: ts(11) },
        { patientName: 'Taiwo Adeyemi',      title: 'Sickle Cell Disease Management Plan',type: 'Medical Report', date: daysAgo(4),  size: '265 KB', uploadedBy: 'Dr. Adaeze Nwosu',  notes: 'Long-term management plan including hydroxyurea therapy.',           createdAt: ts(5) },
        { patientName: 'Henry Wilson',       title: 'COPD Exacerbation Summary',          type: 'Medical Report', date: daysAgo(1),  size: '420 KB', uploadedBy: 'Dr. Michael Torres', notes: 'Emergency presentation, ABG, treatment and ICU placement.',          createdAt: ts(2) },
        { patientName: 'Fatima Al-Hassan',   title: 'Hypertension Discharge Summary',     type: 'Medical Report', date: daysAgo(2),  size: '175 KB', uploadedBy: 'Dr. Adaeze Nwosu',  notes: 'Hypertensive crisis admission — treatment and discharge plan.',      createdAt: ts(3) },
      ])

    showToast?.('Demo data loaded successfully!', 'success')
    return true
  } catch (err) {
    console.error('Seed error:', err)
    showToast?.('Failed to seed data: ' + err.message, 'error')
    return false
  }
}
