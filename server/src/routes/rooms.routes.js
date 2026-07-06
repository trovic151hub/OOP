import Room from '../models/Room.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'

const controller = makeCrudController(Room, {
  entity: 'Room',
  sort: { createdAt: -1 },
  label: (d) => d.roomNumber || d.name,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller)
