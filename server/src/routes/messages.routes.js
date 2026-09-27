import { Router } from 'express'
import Message from '../models/Message.js'
import { requireRole, STAFF_ROLES } from '../middleware/role.middleware.js'
import { emitChanged } from '../utils/realtime.js'
import { deliverStaffNotification } from '../utils/notificationDelivery.js'

const router = Router()
const typingPresence = new Map()

function pruneTypingPresence() {
  const now = Date.now()
  for (const [key, value] of typingPresence.entries()) {
    if (value.expiresAt <= now) typingPresence.delete(key)
  }
}

// Broadcast messages (no recipientId) are visible to everyone; a private DM is
// only visible to its sender and its recipient.
router.use(requireRole(...STAFF_ROLES))

router.get('/typing', async (req, res) => {
  pruneTypingPresence()
  const active = [...typingPresence.values()]
    .filter(item => item.userId !== req.user.id)
    .filter(item => !item.recipientId || item.recipientId === req.user.id)
  res.json(active)
})

router.post('/typing', async (req, res) => {
  const { conversationKey, recipientId = null, isTyping } = req.body
  if (!conversationKey) return res.status(400).json({ message: 'Conversation key is required.' })

  const key = `${req.user.id}:${recipientId || 'general'}`
  if (!isTyping) {
    typingPresence.delete(key)
    return res.status(204).end()
  }

  typingPresence.set(key, {
    conversationKey,
    userId: req.user.id,
    userName: req.user.name || req.user.email || 'Someone',
    recipientId,
    isTyping: true,
    expiresAt: Date.now() + 3500,
  })
  res.status(204).end()
})

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

router.put('/read-conversation', async (req, res, next) => {
  try {
    const { conversationKey } = req.body
    if (!conversationKey) return res.status(400).json({ message: 'Conversation key is required.' })

    const scope = conversationKey === 'general'
      ? { recipientId: null }
      : {
          $or: [
            { senderId: req.user.id, recipientId: conversationKey },
            { senderId: conversationKey, recipientId: req.user.id },
          ],
        }

    const readAt = new Date().toISOString()
    await Message.updateMany(scope, { $pull: { readBy: { userId: req.user.id } } })
    await Message.updateMany(scope, { $addToSet: { readBy: { userId: req.user.id, readAt } } })
    emitChanged(req, 'messages')
    res.status(204).end()
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { text, senderName, senderRole, recipientId } = req.body
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required.' })
    const readAt = new Date().toISOString()
    const doc = await Message.create({
      text: text.trim(),
      senderId: req.user.id,
      senderName: senderName || req.user.name || 'User',
      senderRole: senderRole || 'Staff',
      recipientId: recipientId || null,
      readBy: [{ userId: req.user.id, readAt }],
      createdAt: readAt,
    })
    await deliverStaffNotification({
      recipientUserId: recipientId || '',
      recipientRoles: recipientId ? [] : ['Staff'],
      title: recipientId ? 'New private message' : 'New staff message',
      message: `${doc.senderName || 'A staff member'}: ${doc.text}`,
      type: 'messages',
      target: 'messages',
      targetEntityId: doc._id.toString(),
      conversationKey: recipientId ? req.user.id : 'general',
      priority: 'Normal',
      readBy: recipientId ? [] : [{ userId: req.user.id, readAt: new Date().toISOString() }],
    }, req)
    emitChanged(req, 'messages')
    res.status(201).json(doc)
  } catch (err) { next(err) }
})

export default router
