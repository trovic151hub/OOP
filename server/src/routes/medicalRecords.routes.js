import MedicalRecord from '../models/MedicalRecord.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(MedicalRecord, {
  entity: 'Medical Record',
  key: 'medicalRecords',
  sort: { date: -1 },
  audit: { add: false, update: false, delete: false },
})

export default makeCrudRouter(controller)
