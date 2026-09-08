import Room from '../models/Room.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, FRONT_DESK_ROLES } from '../middleware/role.middleware.js'

const controller = makeCrudController(Room, {
  entity: 'Room',
  key: 'rooms',
  sort: { createdAt: -1 },
  label: (d) => d.roomNumber || d.name,
  audit: { add: true, update: true, delete: true },
})

export default makeCrudRouter(controller, {
  list: requireRole(...FRONT_DESK_ROLES),
  create: requireRole('Admin'),
  update: requireRole(...FRONT_DESK_ROLES),
  remove: requireRole('Admin'),
})
