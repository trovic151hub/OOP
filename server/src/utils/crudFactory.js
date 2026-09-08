import { logAudit } from './audit.js'
import { emitChanged } from './realtime.js'

// Builds list/create/update/delete handlers shared by the ~14 collections that
// follow the same CRUD + optional-audit-logging shape the old Firestore store
// methods used. Per-collection differences (sort order, which operations audit-log,
// how the audited label is derived, cascading deletes) are passed in via opts.
// `key` is the matching frontend store key (see src/store/useStore.js's
// COLLECTIONS list) — it's how a change here tells every other connected
// client which collection to refetch in real time.
export function makeCrudController(Model, opts = {}) {
  const {
    entity,
    key,
    sort = { createdAt: -1 },
    label = (doc) => doc.name || doc.title || String(doc._id),
    audit = { add: true, update: false, delete: true },
    cascadeOnDelete,
    listQuery = () => ({}),
    afterUpdate,
  } = opts

  function auditLabelFn(op) {
    const v = audit[op]
    if (!v) return null
    return typeof v === 'function' ? v : label
  }

  return {
    async list(req, res, next) {
      try {
        const docs = await Model.find(await listQuery(req)).sort(sort)
        res.json(docs)
      } catch (err) { next(err) }
    },

    async create(req, res, next) {
      try {
        const doc = await Model.create({ ...req.body, createdAt: new Date().toISOString() })
        const labelFn = auditLabelFn('add')
        if (labelFn) await logAudit(req, 'Added', entity, labelFn(doc))
        if (key) emitChanged(req, key)
        res.status(201).json(doc)
      } catch (err) { next(err) }
    },

    async update(req, res, next) {
      try {
        const body = { ...req.body }
        delete body.id
        delete body._id
        delete body.createdAt
        delete body.decisionKind
        const previous = afterUpdate ? await Model.findById(req.params.id) : null
        const doc = await Model.findByIdAndUpdate(req.params.id, body, { new: true })
        if (!doc) return res.status(404).json({ message: 'Not found' })
        if (afterUpdate) await afterUpdate(doc, previous, req)
        const labelFn = auditLabelFn('update')
        if (labelFn) await logAudit(req, 'Updated', entity, labelFn(doc))
        if (key) emitChanged(req, key)
        res.json(doc)
      } catch (err) { next(err) }
    },

    async remove(req, res, next) {
      try {
        const doc = await Model.findById(req.params.id)
        if (!doc) return res.status(404).json({ message: 'Not found' })
        if (cascadeOnDelete) await cascadeOnDelete(doc, req)
        await Model.findByIdAndDelete(req.params.id)
        const labelFn = auditLabelFn('delete')
        if (labelFn) await logAudit(req, 'Deleted', entity, labelFn(doc))
        if (key) emitChanged(req, key)
        res.status(204).end()
      } catch (err) { next(err) }
    },
  }
}
