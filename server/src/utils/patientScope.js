import Patient from '../models/Patient.js'

export async function patientOwnedRecordQuery(user) {
  if (user.role !== 'Patient') return {}

  const patients = await Patient.find({
    $or: [
      { uid: user.id },
      { email: user.email },
      { name: user.name },
    ],
  })

  const patientIds = patients.map(p => p._id.toString())
  const patientNames = [...new Set([user.name, ...patients.map(p => p.name)].filter(Boolean))]
  const patientEmails = [...new Set([user.email, ...patients.map(p => p.email)].filter(Boolean))]

  return {
    $or: [
      { patientId: { $in: patientIds } },
      { patientName: { $in: patientNames } },
      { patientEmail: { $in: patientEmails } },
    ],
  }
}
