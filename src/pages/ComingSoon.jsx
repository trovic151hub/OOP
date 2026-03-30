import React from 'react'
import { Construction, ArrowLeft } from 'lucide-react'

const PAGE_INFO = {
  departments: { label: 'Departments', desc: 'Department management, staff breakdown, and room assignments are coming soon.' },
  calendar:    { label: 'Calendar',    desc: 'A full scheduling calendar with month, week, and day views is on its way.' },
  inventory:   { label: 'Inventory',   desc: 'Stock tracking, reorder alerts, and category breakdowns are coming soon.' },
  messages:    { label: 'Messages',    desc: 'Secure messaging between staff, doctors, and departments is coming soon.' },
}

export default function ComingSoon({ page, onNavigate }) {
  const info = PAGE_INFO[page] || { label: page, desc: 'This feature is coming soon.' }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5">
          <Construction size={36} className="text-teal-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{info.label}</h2>
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Coming Soon</p>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">{info.desc}</p>
        <button onClick={() => onNavigate('dashboard')} className="btn-ghost">
          <ArrowLeft size={15} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}
