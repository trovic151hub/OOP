export const STAFF_ROLES = ['Admin', 'Doctor', 'Nurse', 'Receptionist']
export const FRONT_DESK_ROLES = ['Admin', 'Receptionist']

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

export function requireSelfOrRole(paramName, ...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Forbidden' })
    if (roles.includes(req.user.role) || req.params[paramName] === req.user.id) {
      return next()
    }
    return res.status(403).json({ message: 'Forbidden' })
  }
}
