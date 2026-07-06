import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/env.js'
import { verifyAuth } from './middleware/auth.middleware.js'
import { verifyCsrf } from './middleware/csrf.middleware.js'
import { notFound, errorHandler } from './middleware/error.middleware.js'

import authRoutes from './routes/auth.routes.js'
import patientsRoutes from './routes/patients.routes.js'
import doctorsRoutes from './routes/doctors.routes.js'
import appointmentsRoutes from './routes/appointments.routes.js'
import departmentsRoutes from './routes/departments.routes.js'
import inventoryRoutes from './routes/inventory.routes.js'
import messagesRoutes from './routes/messages.routes.js'
import usersRoutes from './routes/users.routes.js'
import medicalRecordsRoutes from './routes/medicalRecords.routes.js'
import billingRoutes from './routes/billing.routes.js'
import shiftsRoutes from './routes/shifts.routes.js'
import roomsRoutes from './routes/rooms.routes.js'
import labResultsRoutes from './routes/labResults.routes.js'
import prescriptionsRoutes from './routes/prescriptions.routes.js'
import expensesRoutes from './routes/expenses.routes.js'
import documentsRoutes from './routes/documents.routes.js'
import claimsRoutes from './routes/claims.routes.js'
import pharmacyOrdersRoutes from './routes/pharmacyOrders.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import auditLogRoutes from './routes/auditlog.routes.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.clientOrigin, credentials: true }))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (req, res) => res.json({ ok: true }))

  // Auth endpoints are the entry point (no session cookie exists yet for
  // register/login), so CSRF's double-submit check doesn't apply to them.
  app.use('/api/auth', authRoutes)

  // Everything past this point requires a valid session + matching CSRF token.
  app.use('/api', verifyAuth, verifyCsrf)

  app.use('/api/patients', patientsRoutes)
  app.use('/api/doctors', doctorsRoutes)
  app.use('/api/appointments', appointmentsRoutes)
  app.use('/api/departments', departmentsRoutes)
  app.use('/api/inventory', inventoryRoutes)
  app.use('/api/messages', messagesRoutes)
  app.use('/api/users', usersRoutes)
  app.use('/api/medical-records', medicalRecordsRoutes)
  app.use('/api/billing', billingRoutes)
  app.use('/api/shifts', shiftsRoutes)
  app.use('/api/rooms', roomsRoutes)
  app.use('/api/lab-results', labResultsRoutes)
  app.use('/api/prescriptions', prescriptionsRoutes)
  app.use('/api/expenses', expensesRoutes)
  app.use('/api/documents', documentsRoutes)
  app.use('/api/claims', claimsRoutes)
  app.use('/api/pharmacy-orders', pharmacyOrdersRoutes)
  app.use('/api/settings', settingsRoutes)
  app.use('/api/audit-log', auditLogRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
