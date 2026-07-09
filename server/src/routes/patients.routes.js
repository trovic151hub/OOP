import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import MedicalRecord from '../models/MedicalRecord.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Patient, {
  entity: 'Patient',
  key: 'patients',
  sort: { createdAt: -1 },
  label: (d) => d.name,
  audit: { add: true, update: true, delete: true },
  async cascadeOnDelete(patient) {
    await Appointment.deleteMany({ patientName: patient.name })
    await MedicalRecord.deleteMany({ patientId: patient._id.toString() })
  },
})

export default makeCrudRouter(controller)
