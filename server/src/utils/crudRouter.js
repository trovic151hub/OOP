import { Router } from 'express'

function chain(...handlers) {
  return handlers.flat().filter(Boolean)
}

export function makeCrudRouter(controller, guards = {}) {
  const router = Router()
  router.get('/', ...chain(guards.all, guards.list), controller.list)
  router.post('/', ...chain(guards.all, guards.create), controller.create)
  router.put('/:id', ...chain(guards.all, guards.update), controller.update)
  router.delete('/:id', ...chain(guards.all, guards.remove), controller.remove)
  return router
}
