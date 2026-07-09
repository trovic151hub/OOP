import { Router } from 'express'
import Message from '../models/Message.js'
import { emitChanged } from '../utils/realtime.js'

const router = Router()

// Broadcast messages (no recipientId) are visible to everyone; a private DM is
// only visible to its sender and its recipient.
router.get('/', async (req, res, next) => {
  try {
    const docs = await Message.find({
      $or: [
        { recipientId: null },
        { senderId: req.user.id },
        { recipientId: req.user.id },
      ],
    }).sort({ createdAt: 1 })
    res.json(docs)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { text, senderName, senderRole, recipientId } = req.body
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required.' })
    const doc = await Message.create({
      text: text.trim(),
      senderId: req.user.id,
      senderName: senderName || req.user.name || 'User',
      senderRole: senderRole || 'Staff',
      recipientId: recipientId || null,
      createdAt: new Date().toISOString(),
    })
    emitChanged(req, 'messages')
    res.status(201).json(doc)
  } catch (err) { next(err) }
})

export default router
