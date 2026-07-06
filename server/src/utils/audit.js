import AuditLog from '../models/AuditLog.js'

export async function logAudit(req, action, entity, entityName) {
  try {
    if (!req.user) return
    await AuditLog.create({
      action,
      entity,
      entityName: entityName || 'Unknown',
      userId:     req.user.id,
      userName:   req.user.name || req.user.email || 'System',
      timestamp:  new Date().toISOString(),
    })
  } catch (_) {}
}
