import Document from '../models/Document.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Document, {
  entity: 'Document',
  sort: { date: -1 },
  label: (d) => `${d.title} - ${d.patientName}`,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller)
