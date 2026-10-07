import React from 'react'
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, XCircle } from 'lucide-react'
import Modal from './Modal'

const VARIANTS = {
  error: {
    icon: XCircle,
    accentColor: 'red',
    ring: 'bg-red-50 dark:bg-red-500/12 border-red-100 dark:border-red-500/20',
    iconClass: 'text-red-500',
    button: 'btn-danger',
  },
  warning: {
    icon: AlertTriangle,
    accentColor: 'red',
    ring: 'bg-amber-50 dark:bg-amber-500/12 border-amber-100 dark:border-amber-500/20',
    iconClass: 'text-amber-500',
    button: 'btn-primary',
  },
  info: {
    icon: Info,
    accentColor: 'teal',
    ring: 'bg-teal-50 dark:bg-teal-500/12 border-teal-100 dark:border-teal-500/20',
    iconClass: 'text-teal-600',
    button: 'btn-primary',
  },
  success: {
    icon: CheckCircle2,
    accentColor: 'teal',
    ring: 'bg-emerald-50 dark:bg-emerald-500/12 border-emerald-100 dark:border-emerald-500/20',
    iconClass: 'text-emerald-600',
    button: 'btn-primary',
  },
  permission: {
    icon: ShieldAlert,
    accentColor: 'red',
    ring: 'bg-red-50 dark:bg-red-500/12 border-red-100 dark:border-red-500/20',
    iconClass: 'text-red-500',
    button: 'btn-danger',
  },
}

export default function AlertModal({
  open,
  onClose,
  title = 'Something went wrong',
  message = 'Please try again.',
  variant = 'error',
  actionLabel = 'OK',
}) {
  const cfg = VARIANTS[variant] || VARIANTS.error
  const Icon = cfg.icon

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      icon={Icon}
      accentColor={cfg.accentColor}
      maxWidth="max-w-sm"
      fullScreenOnMobile={false}
    >
      <div className="text-center">
        <div className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-4 ${cfg.ring}`}>
          <Icon size={24} className={cfg.iconClass} />
        </div>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
        <button onClick={onClose} className={`${cfg.button} justify-center mt-6 w-full`}>
          {actionLabel}
        </button>
      </div>
    </Modal>
  )
}
