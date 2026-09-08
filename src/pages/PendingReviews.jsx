import React, { useState } from 'react'
import { Calendar, CheckCircle, FileText, XCircle } from 'lucide-react'
import { store, useStore } from '../store/useStore'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/helpers'

const REQUEST_STATUSES = ['Requested', 'Reschedule Requested', 'Cancel Requested']

function Section({ title, count, icon: Icon, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/12 text-teal-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-600">{count} waiting</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function PendingReviews() {
  const { appointments = [], documents = [] } = useStore()
  const showToast = useToast()
  const [busyId, setBusyId] = useState('')
  const [decision, setDecision] = useState(null)
  const [decisionNote, setDecisionNote] = useState('')
  const [decisionError, setDecisionError] = useState('')

  const appointmentRequests = appointments.filter(a => REQUEST_STATUSES.includes(a.status))
  const patientUploads = documents.filter(d => d.patientUploaded && (d.reviewStatus || 'Pending Review') === 'Pending Review')

  function approvalStatus(a) {
    return a.status === 'Cancel Requested' ? 'Cancelled' : 'Scheduled'
  }

  function declineStatus(a) {
    return ['Reschedule Requested', 'Cancel Requested'].includes(a.status) ? (a.previousStatus || 'Scheduled') : 'Cancelled'
  }

  function openAppointmentDecision(a, kind) {
    const approving = kind === 'approve'
    setDecision({
      type: 'appointment',
      item: a,
      action: kind,
      required: !approving,
      title: `${approving ? 'Approve' : 'Decline'} Appointment Request`,
      noteLabel: approving ? 'Note to patient (optional)' : 'Reason for decline',
      helperText: approving
        ? 'The patient will see this note with the appointment update.'
        : 'Decline reasons are shared with the patient and saved for audit history.',
    })
    setDecisionNote(a.staffNote || '')
    setDecisionError('')
  }

  function openDocumentDecision(doc, reviewStatus) {
    const rejecting = reviewStatus === 'Rejected'
    setDecision({
      type: 'document',
      item: doc,
      action: reviewStatus,
      required: rejecting,
      title: `${reviewStatus === 'Reviewed' ? 'Mark Document Reviewed' : 'Reject Document'}`,
      noteLabel: rejecting ? 'Reason for rejection' : 'Review note (optional)',
      helperText: rejecting
        ? 'Rejection reasons help the patient know what to upload next.'
        : 'Add a short note if staff should know anything about this review.',
    })
    setDecisionNote(doc.reviewNote || '')
    setDecisionError('')
  }

  async function decideAppointment(a, kind, note) {
    const approving = kind === 'approve'
    const status = approving ? approvalStatus(a) : declineStatus(a)
    setBusyId(`appt-${a.id}`)
    try {
      await store.updateAppointment(a.id, {
        status,
        date: status === 'Scheduled' && a.requestedDate ? a.requestedDate : a.date,
        timeStart: status === 'Scheduled' && a.requestedTimeStart ? a.requestedTimeStart : a.timeStart,
        timeEnd: status === 'Scheduled' && a.requestedTimeEnd ? a.requestedTimeEnd : a.timeEnd,
        staffNote: note.trim(),
        decisionKind: approving ? 'approve' : 'decline',
        previousStatus: '',
        requestedDate: '',
        requestedTimeStart: '',
        requestedTimeEnd: '',
        patientRequestNote: '',
        reviewedAt: new Date().toISOString(),
      })
      showToast(`Appointment request ${approving ? 'approved' : 'declined'}.`, approving ? 'success' : 'info')
    } catch (err) {
      showToast(err.message || 'Failed to update appointment request.', 'error')
    } finally {
      setBusyId('')
    }
  }

  async function reviewDocument(doc, reviewStatus, reviewNote) {
    setBusyId(`doc-${doc.id}`)
    try {
      await store.reviewDocument(doc.id, { reviewStatus, reviewNote: reviewNote.trim() })
      showToast(`Document marked ${reviewStatus.toLowerCase()}.`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to review document.', 'error')
    } finally {
      setBusyId('')
    }
  }

  async function submitDecision(e) {
    e.preventDefault()
    if (!decision) return
    const note = decisionNote.trim()
    if (decision.required && !note) {
      setDecisionError('A note is required for this action.')
      return
    }
    setDecisionError('')
    if (decision.type === 'appointment') {
      await decideAppointment(decision.item, decision.action, note)
    } else {
      await reviewDocument(decision.item, decision.action, note)
    }
    setDecision(null)
    setDecisionNote('')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Pending Reviews</h2>
        <p className="text-sm text-slate-400 dark:text-slate-600 mt-0.5">Review patient appointment requests and uploaded documents.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Section title="Appointment Requests" count={appointmentRequests.length} icon={Calendar}>
          {appointmentRequests.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-600">No appointment requests waiting.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {appointmentRequests.map(a => (
                <div key={a.id} className="p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={a.patientName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{a.patientName}</p>
                        <Badge status={a.status} />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                        {a.type || 'Appointment'} with {a.doctorName || 'Any Available Doctor'} · {a.date ? formatDate(a.date) : 'No date'}
                      </p>
                      {a.requestedDate && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Requested: {formatDate(a.requestedDate)}{a.requestedTimeStart ? ` at ${a.requestedTimeStart}` : ''}</p>}
                      {(a.patientRequestNote || a.notes) && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">{a.patientRequestNote || a.notes}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={busyId === `appt-${a.id}`} onClick={() => openAppointmentDecision(a, 'approve')} className="btn-primary text-xs flex-1 justify-center">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button disabled={busyId === `appt-${a.id}`} onClick={() => openAppointmentDecision(a, 'decline')} className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border bg-red-50 dark:bg-red-500/12 text-red-500 hover:bg-red-100 border-red-200 dark:border-red-500/30 transition-colors flex items-center justify-center gap-1.5">
                      <XCircle size={13} /> Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Patient Uploads" count={patientUploads.length} icon={FileText}>
          {patientUploads.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400 dark:text-slate-600">No patient uploads waiting.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {patientUploads.map(d => (
                <div key={d.id} className="p-5 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{d.title}</p>
                      <Badge status={d.reviewStatus || 'Pending Review'} />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">{d.patientName} · {d.type || 'Document'} · {d.date ? formatDate(d.date) : 'No date'}</p>
                    {d.description && <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{d.description}</p>}
                    {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-xs text-teal-600 font-semibold hover:underline mt-2 inline-block">Open document</a>}
                  </div>
                  <div className="flex gap-2">
                    <button disabled={busyId === `doc-${d.id}`} onClick={() => openDocumentDecision(d, 'Reviewed')} className="btn-primary text-xs flex-1 justify-center">
                      <CheckCircle size={13} /> Reviewed
                    </button>
                    <button disabled={busyId === `doc-${d.id}`} onClick={() => openDocumentDecision(d, 'Rejected')} className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg border bg-red-50 dark:bg-red-500/12 text-red-500 hover:bg-red-100 border-red-200 dark:border-red-500/30 transition-colors flex items-center justify-center gap-1.5">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <Modal
        open={!!decision}
        onClose={() => {
          if (busyId) return
          setDecision(null)
          setDecisionNote('')
          setDecisionError('')
        }}
        title={decision?.title || 'Review Decision'}
        icon={decision?.action === 'decline' || decision?.action === 'Rejected' ? XCircle : CheckCircle}
        accentColor={decision?.action === 'decline' || decision?.action === 'Rejected' ? 'red' : 'teal'}
        maxWidth="max-w-md"
        fullScreenOnMobile={false}
      >
        <form onSubmit={submitDecision} className="space-y-4">
          {decision?.item && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {decision.type === 'appointment' ? decision.item.patientName : decision.item.title}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                {decision.type === 'appointment'
                  ? `${decision.item.status} request`
                  : `${decision.item.patientName || 'Patient document'} - ${decision.item.type || 'Document'}`}
              </p>
            </div>
          )}
          <div>
            <label className="label">
              {decision?.noteLabel}
              {decision?.required && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={decisionNote}
              onChange={e => setDecisionNote(e.target.value)}
              placeholder="Write a short note"
            />
            {decision?.helperText && <p className="text-xs text-slate-400 dark:text-slate-600 mt-2">{decision.helperText}</p>}
            {decisionError && <p className="text-xs text-red-500 mt-2">{decisionError}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" disabled={!!busyId} onClick={() => setDecision(null)} className="btn-ghost flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={!!busyId} className={`${decision?.action === 'decline' || decision?.action === 'Rejected' ? 'btn-danger' : 'btn-primary'} flex-1 justify-center`}>
              {busyId ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
