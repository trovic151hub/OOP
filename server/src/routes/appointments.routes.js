import Appointment from '../models/Appointment.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Appointment, {
  entity: 'Appointment',
  key: 'appointments',
  sort: { createdAt: -1 },
  label: (d) => `${d.patientName} w/ ${d.doctorName}`,
  audit: { add: true, update: false, delete: true },
})

export default makeCrudRouter(controller)
