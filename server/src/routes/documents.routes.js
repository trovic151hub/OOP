import Document from '../models/Document.js'
import Patient from '../models/Patient.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeCrudController } from '../utils/crudFactory.js'
import { makeCrudRouter } from '../utils/crudRouter.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { patientOwnedRecordQuery } from '../utils/patientScope.js'
import { deliverNotification } from '../utils/notificationDelivery.js'
import { logAudit } from '../utils/audit.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'documents')
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

function sanitizeFilename(name = 'document') {
  return String(name).replace(/[^a-z0-9._-]/gi, '_').slice(0, 120) || 'document'
}

function fileExtension(filename, mimeType) {
  const ext = path.extname(filename)
  if (ext) return ext
  const map = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }
  return map[mimeType] || '.bin'
}

async function preparePatientDocument(req, res, next) {
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
      title: String(req.body.title || '').trim(),
      type: req.body.type || 'Other',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      description: String(req.body.description || '').trim(),
      url: String(req.body.url || '').trim(),
      uploadedBy: patient.name || req.user.name || 'Patient',
      uploadedByRole: 'Patient',
      patientUploaded: true,
      reviewStatus: 'Pending Review',
    }
    if (!req.body.title) return res.status(400).json({ message: 'Document title is required.' })
    next()
  } catch (err) {
    next(err)
  }
}

const controller = makeCrudController(Document, {
  entity: 'Document',
  key: 'documents',
  sort: { date: -1 },
  label: (d) => `${d.title} - ${d.patientName}`,
  audit: { add: true, update: true, delete: true },
  listQuery: (req) => patientOwnedRecordQuery(req.user),
})

const router = makeCrudRouter(controller, {
  list: requireRole(...STAFF_ROLES, 'Patient'),
  create: [requireRole(...STAFF_ROLES, 'Patient'), preparePatientDocument],
  update: requireRole(...STAFF_ROLES),
  remove: requireRole(...STAFF_ROLES),
})

router.post('/upload', requireRole('Patient'), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      $or: [
        { uid: req.user.id },
        { email: req.user.email },
        { name: req.user.name },
      ],
    })
    if (!patient) return res.status(400).json({ message: 'No linked patient profile found.' })

    const title = String(req.body.title || '').trim()
    if (!title) return res.status(400).json({ message: 'Document title is required.' })
    if (!req.body.fileData) return res.status(400).json({ message: 'Please attach a file.' })

    const mimeType = String(req.body.mimeType || 'application/octet-stream')
    const base64 = String(req.body.fileData).replace(/^data:[^;]+;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')
    if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
      return res.status(400).json({ message: 'File must be 5 MB or smaller.' })
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    const originalName = sanitizeFilename(req.body.fileName || title)
    const storedName = `${Date.now()}-${patient._id}-${sanitizeFilename(path.basename(originalName, path.extname(originalName)))}${fileExtension(originalName, mimeType)}`
    const storedPath = path.join(UPLOAD_DIR, storedName)
    await fs.writeFile(storedPath, buffer)

    const doc = await Document.create({
      patientId: patient._id.toString(),
      patientName: patient.name || req.user.name,
      patientEmail: patient.email || req.user.email,
      title,
      type: req.body.type || 'Other',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      description: String(req.body.description || '').trim(),
      url: `/api/documents/${storedName}/file`,
      storedName,
      originalName,
      mimeType,
      size: `${Math.ceil(buffer.length / 1024)} KB`,
      uploadedBy: patient.name || req.user.name || 'Patient',
      uploadedByRole: 'Patient',
      patientUploaded: true,
      reviewStatus: 'Pending Review',
      createdAt: new Date().toISOString(),
    })
    await logAudit(req, 'Uploaded', 'Document', `${doc.title} - ${doc.patientName}`)
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
})

router.get('/:storedName/file', requireRole(...STAFF_ROLES, 'Patient'), async (req, res, next) => {
  try {
    const scope = await patientOwnedRecordQuery(req.user)
    const query = req.user.role === 'Patient'
      ? { storedName: req.params.storedName, ...scope }
      : { storedName: req.params.storedName }
    const doc = await Document.findOne(query)
    if (!doc?.storedName) return res.status(404).json({ message: 'File not found' })
    const filePath = path.join(UPLOAD_DIR, sanitizeFilename(doc.storedName))
    res.type(doc.mimeType || 'application/octet-stream')
    res.download(filePath, doc.originalName || doc.title || 'document')
  } catch (err) {
    next(err)
  }
})

router.put('/:id/review', requireRole(...STAFF_ROLES), async (req, res, next) => {
  try {
    const reviewStatus = ['Reviewed', 'Rejected', 'Pending Review'].includes(req.body.reviewStatus)
      ? req.body.reviewStatus
      : 'Reviewed'
    const doc = await Document.findByIdAndUpdate(req.params.id, {
      reviewStatus,
      reviewNote: String(req.body.reviewNote || '').trim().slice(0, 500),
      reviewedBy: req.user.name || req.user.email,
      reviewedAt: new Date().toISOString(),
    }, { new: true })
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    await logAudit(req, reviewStatus === 'Rejected' ? 'Rejected' : 'Reviewed', 'Document', `${doc.title} - ${doc.patientName}`)

    await deliverNotification({
      patientId: doc.patientId,
      patientEmail: doc.patientEmail,
      title: reviewStatus === 'Rejected' ? 'Document needs attention' : 'Document reviewed',
      message: `${doc.title || 'Your document'} was marked ${reviewStatus.toLowerCase()}.${doc.reviewNote ? ` Note: ${doc.reviewNote}` : ''}`,
      type: 'documents',
      target: 'documents',
    })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

export default router
