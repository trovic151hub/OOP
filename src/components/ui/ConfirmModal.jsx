import React from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title = 'Delete Record', message = 'This action cannot be undone.' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} icon={AlertTriangle} accentColor="red" maxWidth="max-w-sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <p className="text-sm text-slate-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={() => { onConfirm(); onClose() }} className="btn-danger flex-1 justify-center">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}
