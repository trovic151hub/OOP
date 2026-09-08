import Appointment from '../models/Appointment.js'
import Patient from '../models/Patient.js'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'
import { deliverNotification } from '../utils/notificationDelivery.js'
import { logAudit } from '../utils/audit.js'

async function preparePatientAppointmentRequest(req, res, next) {
  try {
    if (req.user.role !== 'Patient') return next()
    const patient = await Patient.findOne({
      $or: [
        { uid: req.user.id },
        { email: req.user.email },
        { name: req.user.name },
      ],
    })
    if (!patient) return res.status(400).json({ message: 'No linked patient profile found.' })
    req.body = {
      patientId: patient._id.toString(),
      patientName: patient.name || req.user.name,
      patientEmail: patient.email || req.user.email,
      doctorName: req.body.doctorName || 'Any Available Doctor',
      type: req.body.type || 'Consultation',
      date: req.body.date || '',
      timeStart: req.body.timeStart || '',
      timeEnd: '',
      notes: req.body.notes || '',
      requestedBy: req.user.id,
      requestedAt: new Date().toISOString(),
      status: 'Requested',
    }
    next()
  } catch (err) { next(err) }
}

async function requireDeclineReason(req, res, next) {
  try {
    if (req.body?.staffNote) req.body.staffNote = String(req.body.staffNote).trim().slice(0, 500)
    const decisionKind = req.body?.decisionKind
    if (decisionKind !== 'decline') return next()
    const previous = await Appointment.findById(req.params.id)
    if (['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(previous?.status) && !req.body.staffNote) {
      return res.status(400).json({ message: 'Decline reason is required.' })
    }
    next()
  } catch (err) {
    next(err)
  }
}

const controller = makeCrudController(Appointment, {
  entity: 'Appointment',
  key: 'appointments',
  sort: { createdAt: -1 },
  label: (d) => `${d.patientName} w/ ${d.doctorName}`,
  audit: { add: true, update: false, delete: true },
  listQuery: (req) => patientOwnedRecordQuery(req.user),
  afterUpdate: async (doc, previous, req) => {
    if (!previous || !['Requested', 'Reschedule Requested', 'Cancel Requested'].includes(previous.status) || previous.status === doc.status || !['Scheduled', 'Cancelled'].includes(doc.status)) return
    const note = doc.staffNote ? ` Note: ${doc.staffNote}` : ''
    const declined = req.body?.decisionKind === 'decline'
    const title = previous.status === 'Reschedule Requested'
      ? (declined ? 'Reschedule declined' : 'Reschedule approved')
      : previous.status === 'Cancel Requested'
        ? (declined ? 'Cancellation declined' : 'Cancellation approved')
        : (declined ? 'Appointment declined' : 'Appointment confirmed')
    await deliverNotification({
      patientId: doc.patientId,
      patientEmail: doc.patientEmail,
      title,
      message: `${doc.type || 'Appointment'} with ${doc.doctorName || 'the hospital team'}${doc.date ? ` on ${doc.date}` : ''}.${note}`,
      type: 'appointments',
      target: 'appointments',
      createdAt: new Date().toISOString(),
    })
    await logAudit(req, title, 'Appointment', `${doc.patientName} w/ ${doc.doctorName}`)
  },
})

const router = makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES, 'Patient'),
  create: [requireRole(...STAFF_ROLES, 'Patient'), preparePatientAppointmentRequest],
  update: [requireRole(...STAFF_ROLES), requireDeclineReason],
  remove: requireRole(...STAFF_ROLES),
})

router.post('/:id/reschedule-request', requireRole('Patient'), async (req, res, next) => {
  try {
    const scope = await patientOwnedRecordQuery(req.user)
    const appointment = await Appointment.findOne({ _id: req.params.id, ...scope })
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })
    if (['Completed', 'Cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'This appointment cannot be rescheduled.' })
    }
    if (!req.body.date) return res.status(400).json({ message: 'Preferred date is required.' })

    appointment.previousStatus = appointment.status
    appointment.status = 'Reschedule Requested'
    appointment.requestedDate = req.body.date
    appointment.requestedTimeStart = req.body.timeStart || ''
    appointment.requestedTimeEnd = ''
    appointment.patientRequestNote = String(req.body.notes || '').trim().slice(0, 500)
    appointment.requestedAt = new Date().toISOString()
    await appointment.save()
    await logAudit(req, 'Requested Reschedule', 'Appointment', `${appointment.patientName} w/ ${appointment.doctorName}`)
    res.json(appointment)
  } catch (err) {
    next(err)
  }
})

router.post('/:id/cancel-request', requireRole('Patient'), async (req, res, next) => {
  try {
    const scope = await patientOwnedRecordQuery(req.user)
    const appointment = await Appointment.findOne({ _id: req.params.id, ...scope })
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })
    if (['Completed', 'Cancelled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'This appointment cannot be cancelled.' })
    }
    const reason = String(req.body.notes || '').trim().slice(0, 500)
    if (!reason) return res.status(400).json({ message: 'Cancellation reason is required.' })

    appointment.previousStatus = appointment.status
    appointment.status = 'Cancel Requested'
    appointment.patientRequestNote = reason
    appointment.requestedAt = new Date().toISOString()
    await appointment.save()
    await logAudit(req, 'Requested Cancellation', 'Appointment', `${appointment.patientName} w/ ${appointment.doctorName}`)
    res.json(appointment)
  } catch (err) {
    next(err)
  }
})

export default router
