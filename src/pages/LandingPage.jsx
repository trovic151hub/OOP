import React, { useEffect, useState } from 'react'
import {
  Activity, ArrowRight, BarChart3, Building2, CalendarCheck, CheckCircle,
  ChevronRight, ClipboardCheck, ClipboardList, CreditCard, FileText, HeartPulse,
  HelpCircle, LockKeyhole, MapPin, Menu, MessageCircle, Moon, Pill, Search,
  ShieldCheck, Sparkles, Stethoscope, Sun, UserRoundSearch, Users, Video, X
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Modal from '../components/ui/Modal'
import heroImage from '../assets/medcore-landing-hero.jpg'

const QUICK_ACCESS = [
  { title: 'Find Care', text: 'Search doctors, departments, locations, and available services.', icon: Search, action: 'Explore modules' },
  { title: 'Book Online', text: 'Request visits, review appointment status, and manage changes.', icon: CalendarCheck, action: 'Request access' },
  { title: 'Patient Portal', text: 'View results, bills, prescriptions, documents, and care updates.', icon: HeartPulse, action: 'Create account' },
  { title: 'Pay Bills', text: 'Track invoices, payment status, insurance, and outstanding balances.', icon: CreditCard, action: 'View billing' },
]

const CARE_GROUPS = [
  { title: 'Get Care Now', icon: Video, items: ['Virtual visits', 'Today appointments', 'Waiting room queue', 'Doctor availability'] },
  { title: 'Plan Your Visit', icon: MapPin, items: ['Find a provider', 'Request an appointment', 'Upload documents', 'Prepare care details'] },
  { title: 'Manage Your Care', icon: ClipboardCheck, items: ['Patient portal', 'Lab results', 'Prescriptions', 'Pay bills online'] },
]

const FEATURES = [
  { title: 'Patient Flow', text: 'Queue, appointments, rooms, profiles, and clinical notes stay connected across the hospital.', icon: Users, tone: 'teal' },
  { title: 'Clinical Workflows', text: 'Doctors and nurses can manage prescriptions, lab results, documents, and care updates from one workspace.', icon: Stethoscope, tone: 'blue' },
  { title: 'Finance & Claims', text: 'Billing, payments, insurance claims, and expenses sit alongside operational reporting.', icon: BarChart3, tone: 'violet' },
  { title: 'Secure Portal', text: 'Patients can request appointments, view bills, upload documents, and track notifications from their own portal.', icon: LockKeyhole, tone: 'amber' },
]

const MODULES = [
  { label: 'Appointments', icon: CalendarCheck },
  { label: 'Patient Records', icon: FileText },
  { label: 'Prescriptions', icon: Pill },
  { label: 'Lab Results', icon: Activity },
  { label: 'Documents', icon: ClipboardList },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Departments', icon: Building2 },
  { label: 'Care Messages', icon: MessageCircle },
]

const JOURNEY = [
  { title: 'Create a portal account', text: 'Patients register securely while staff accounts remain admin-assigned.', icon: LockKeyhole },
  { title: 'Request an appointment', text: 'The front desk reviews requests, approves times, and sends updates.', icon: CalendarCheck },
  { title: 'Share documents', text: 'Insurance cards, referrals, and previous results can be uploaded for review.', icon: FileText },
  { title: 'Follow every update', text: 'Bills, prescriptions, lab results, and notifications stay visible after care.', icon: HeartPulse },
]

const ROLE_ROWS = [
  { role: 'Admin', focus: 'Users, security, reports, inventory, and configuration', value: 'System control' },
  { role: 'Receptionist', focus: 'Appointments, queues, rooms, billing, and patient intake', value: 'Front desk flow' },
  { role: 'Doctor', focus: 'Patient records, prescriptions, lab reviews, and schedules', value: 'Clinical decisions' },
  { role: 'Nurse', focus: 'Care coordination, shifts, patient updates, and clinical support', value: 'Care continuity' },
  { role: 'Patient', focus: 'Appointments, bills, documents, prescriptions, labs, and alerts', value: 'Self-service access' },
]

const DASHBOARD_ROWS = [
  ['Appointments Today', '42', '12 pending'],
  ['Checked In', '18', '5 waiting'],
  ['Pending Reviews', '9', 'docs + requests'],
  ['Billing Queue', '16', '4 overdue'],
]

const SERVICES = [
  { title: 'Emergency & Triage', text: 'Coordinate urgent arrivals, queue status, and care team handoff.', icon: HeartPulse, tone: 'teal' },
  { title: 'Outpatient Clinics', text: 'Manage visits, doctor availability, and patient follow-ups.', icon: CalendarCheck, tone: 'blue' },
  { title: 'Laboratory Services', text: 'Publish results, flag abnormal tests, and notify patients.', icon: Activity, tone: 'violet' },
  { title: 'Pharmacy', text: 'Connect prescriptions to medication fulfillment and stock awareness.', icon: Pill, tone: 'amber' },
  { title: 'Insurance Desk', text: 'Track claims, policy details, and billing support workflows.', icon: ShieldCheck, tone: 'teal' },
  { title: 'Records & Documents', text: 'Keep clinical files, referrals, uploads, and review notes together.', icon: FileText, tone: 'blue' },
]

const DOCTOR_RESULTS = [
  { name: 'Dr. Sarah Chen', specialty: 'Internal Medicine', availability: 'Today, 2:30 PM' },
  { name: 'Dr. Adewale Okafor', specialty: 'Cardiology', availability: 'Tomorrow, 10:00 AM' },
  { name: 'Dr. Mira Patel', specialty: 'Pediatrics', availability: 'Friday, 9:15 AM' },
]

const TRUST_ITEMS = [
  { value: '92%', label: 'faster request visibility', icon: Sparkles },
  { value: '4.8/5', label: 'patient portal experience', icon: HeartPulse },
  { value: '30k+', label: 'demo records coordinated', icon: ClipboardCheck },
]

const TESTIMONIALS = [
  { quote: 'The biggest difference is visibility. Appointment requests, documents, and billing updates no longer feel scattered.', name: 'Front Desk Lead', role: 'Reception Operations' },
  { quote: 'Doctors see the context they need without asking three different teams for the same patient information.', name: 'Clinical Director', role: 'Care Delivery' },
]

const FAQS = [
  { q: 'Can patients create their own account?', a: 'Yes. Patients can register from the public site and access only records linked to their patient profile.' },
  { q: 'How are staff roles assigned?', a: 'Staff accounts are created or promoted by an Admin. Doctor, Nurse, Receptionist, and Admin views are role-scoped.' },
  { q: 'Can patients request appointments?', a: 'Yes. Requests enter a staff review flow before they become confirmed appointments.' },
  { q: 'What can patients upload?', a: 'Patients can upload insurance cards, referrals, old lab results, IDs, and other supporting documents for review.' },
  { q: 'Does the system support bills and claims?', a: 'Yes. Billing, payment status, insurance claims, and expense reporting are part of the workspace.' },
  { q: 'Is this landing page connected to the app?', a: 'Yes. Sign-in opens the staff dashboard flow, while patient sign-up opens the patient registration flow.' },
]

const FOOTER_GROUPS = [
  { title: 'Patients', links: ['Create account', 'Request appointment', 'Pay bills', 'Upload documents'] },
  { title: 'Hospital Teams', links: ['Dashboard', 'Appointments', 'Documents', 'Reports'] },
  { title: 'Platform', links: ['Patient records', 'Lab results', 'Prescriptions', 'Insurance'] },
  { title: 'Support', links: ['Security', 'FAQ', 'Privacy', 'Terms'] },
]

const INFO_PANELS = {
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    body: [
      'MedCore is designed around protected patient workflows. Patient accounts are scoped to their linked profile, while staff access is based on assigned roles.',
      'This demo policy explains the intended product behavior and is not a substitute for a hospital-specific legal policy.',
    ],
  },
  terms: {
    title: 'Terms',
    icon: FileText,
    body: [
      'MedCore is a hospital management demo for appointment, record, billing, document, and portal workflows.',
      'Hospital staff should use accounts assigned by an administrator. Patients may create portal accounts for their own records and requests.',
    ],
  },
  status: {
    title: 'System Status',
    icon: Activity,
    body: [
      'Demo status: public landing page, authentication flow, patient portal, staff dashboard, and local realtime hooks are available in the development environment.',
      'External database availability depends on the configured MongoDB Atlas connection and network access.',
    ],
  },
  security: {
    title: 'Security Model',
    icon: LockKeyhole,
    body: [
      'Admins control staff role assignment. Patient records are scoped by linked patient ID, email, or profile details where available.',
      'Key record actions are designed to flow through audit and notification paths for clearer accountability.',
    ],
  },
  faq: {
    title: 'FAQ',
    icon: HelpCircle,
    body: FAQS.map(item => `${item.q} ${item.a}`),
  },
}

const MEGA_MENUS = {
  access: {
    label: 'Access',
    href: '#access',
    title: 'Start with the right action',
    text: 'Give patients and staff a fast route into appointments, records, billing, and daily operations.',
    cta: 'View access paths',
    columns: [
      {
        heading: 'Patient Actions',
        links: [
          { label: 'Create portal account', text: 'Register for appointment requests, bills, and documents.', icon: HeartPulse },
          { label: 'Request appointment', text: 'Send a visit request for staff review.', icon: CalendarCheck },
          { label: 'Pay bills', text: 'Track invoices and payment status.', icon: CreditCard },
        ],
      },
      {
        heading: 'Staff Entry',
        links: [
          { label: 'Staff dashboard', text: 'Open the main hospital command center.', icon: Activity },
          { label: 'Role assignment', text: 'Admins promote staff into the right workspace.', icon: ShieldCheck },
          { label: 'Daily queue', text: 'Coordinate waiting room and checked-in patients.', icon: Users },
        ],
      },
    ],
  },
  care: {
    label: 'Care',
    href: '#care',
    title: 'Guide people through care',
    text: 'Route visitors into immediate care, planned visits, and ongoing care management.',
    cta: 'Explore care paths',
    columns: [
      {
        heading: 'Get Care',
        links: [
          { label: 'Find doctors', text: 'Connect patients with the right provider.', icon: UserRoundSearch },
          { label: 'Virtual visits', text: 'Support remote and follow-up workflows.', icon: Video },
          { label: 'Departments', text: 'Organize services by specialty and unit.', icon: Building2 },
        ],
      },
      {
        heading: 'Manage Care',
        links: [
          { label: 'Lab results', text: 'Surface abnormal results and review status.', icon: Activity },
          { label: 'Prescriptions', text: 'Keep medications visible for patients and staff.', icon: Pill },
          { label: 'Care messages', text: 'Keep updates connected to the care team.', icon: MessageCircle },
        ],
      },
    ],
  },
  platform: {
    label: 'Platform',
    href: '#platform',
    title: 'Run the hospital from one workspace',
    text: 'Bring front desk, clinical, finance, pharmacy, inventory, and reporting work into a single system.',
    cta: 'See platform preview',
    columns: [
      {
        heading: 'Operations',
        links: [
          { label: 'Appointments', text: 'Schedule, approve, decline, and reschedule visits.', icon: CalendarCheck },
          { label: 'Rooms and beds', text: 'Track admissions and room status.', icon: Building2 },
          { label: 'Documents', text: 'Review uploads and patient files.', icon: FileText },
        ],
      },
      {
        heading: 'Management',
        links: [
          { label: 'Billing and claims', text: 'Manage invoices, payments, and insurance.', icon: CreditCard },
          { label: 'Reports', text: 'Monitor activity, revenue, and team performance.', icon: BarChart3 },
          { label: 'Inventory', text: 'Watch stock levels and reorder signals.', icon: ClipboardList },
        ],
      },
    ],
  },
  security: {
    label: 'Security',
    href: '#security',
    title: 'Protect access and accountability',
    text: 'A hospital system needs clear roles, patient scoping, review trails, and trusted workflows.',
    cta: 'Review security model',
    columns: [
      {
        heading: 'Access Control',
        links: [
          { label: 'Patient scoping', text: 'Patients see only records linked to their account.', icon: LockKeyhole },
          { label: 'Staff roles', text: 'Admin, Doctor, Nurse, Receptionist, and Patient views.', icon: ShieldCheck },
          { label: 'Admin governance', text: 'Only admins assign sensitive staff roles.', icon: UserRoundSearch },
        ],
      },
      {
        heading: 'Trust Signals',
        links: [
          { label: 'Audit history', text: 'Important changes are logged for review.', icon: ClipboardCheck },
          { label: 'Review queues', text: 'Patient uploads and appointment requests stay visible.', icon: ClipboardList },
          { label: 'Notifications', text: 'Care updates persist across the portal.', icon: CheckCircle },
        ],
      },
    ],
  },
}

function ToneIcon({ icon: Icon, tone = 'teal' }) {
  const tones = {
    teal: 'bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-500/30',
    blue: 'bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/30',
    violet: 'bg-violet-50 dark:bg-violet-500/12 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-500/30',
    amber: 'bg-amber-50 dark:bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/30',
  }
  return (
    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${tones[tone]}`}>
      <Icon size={18} />
    </div>
  )
}

export default function LandingPage({ onLogin, onRegister }) {
  const { dark, toggle: toggleDark } = useTheme()
  const [activeMega, setActiveMega] = useState(null)
  const [activeSection, setActiveSection] = useState('access')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [infoPanel, setInfoPanel] = useState(null)
  const megaMenu = activeMega ? MEGA_MENUS[activeMega] : null
  const panel = infoPanel ? INFO_PANELS[infoPanel] : null

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== 'Escape') return
      setActiveMega(null)
      setMobileMenuOpen(false)
      setInfoPanel(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const sections = Object.keys(MEGA_MENUS)
      .map(id => document.getElementById(id))
      .filter(Boolean)
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) setActiveSection(visible.target.id)
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0.15, 0.3, 0.6] })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  function handleFooterLink(link) {
    if (link === 'Create account' || link === 'Request appointment') {
      onRegister()
      return
    }
    const key = link.toLowerCase().replace('system ', '').replace(' policy', '')
    if (INFO_PANELS[key]) {
      setInfoPanel(key)
      return
    }
    if (link === 'FAQ') {
      setInfoPanel('faq')
      return
    }
    if (link === 'Security') {
      setInfoPanel('security')
      return
    }
    onLogin()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header
        className="h-16 sticky top-0 z-30 bg-white/92 dark:bg-slate-950/92 backdrop-blur border-b border-slate-200 dark:border-slate-800"
        onMouseLeave={() => setActiveMega(null)}
      >
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Activity size={17} className="text-white" />
            </div>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">MedCore</span>
          </div>
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {Object.entries(MEGA_MENUS).map(([key, item]) => (
              <a
                key={key}
                href={item.href}
                onMouseEnter={() => setActiveMega(key)}
                onFocus={() => setActiveMega(key)}
                className={`px-3 py-2 rounded-lg transition-colors ${(activeMega === key || (!activeMega && activeSection === key)) ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400' : 'hover:text-teal-600 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleDark}
              className="hidden sm:flex w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={onLogin} className="btn-ghost hidden sm:inline-flex">Sign In</button>
            <button onClick={onRegister} className="btn-primary hidden sm:inline-flex">Patient Sign Up</button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              aria-label="Open navigation"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
        {megaMenu && (
          <div
            className="absolute top-full left-0 right-0 hidden lg:block border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl animate-landing-mega-in"
            onMouseEnter={() => setActiveMega(activeMega)}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-[0.75fr_1.25fr] gap-10">
              <div>
                <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">{megaMenu.label}</p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">{megaMenu.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{megaMenu.text}</p>
                <a href={megaMenu.href} onClick={() => setActiveMega(null)} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-400 hover:underline">
                  {megaMenu.cta} <ArrowRight size={15} />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {megaMenu.columns.map(column => (
                  <div key={column.heading}>
                    <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-600 mb-3">{column.heading}</p>
                    <div className="space-y-2">
                      {column.links.map(({ label, text, icon: Icon }) => (
                        <a
                          key={label}
                          href={megaMenu.href}
                          onClick={() => setActiveMega(null)}
                          className="flex items-start gap-3 rounded-lg border border-transparent p-3 hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{label}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">{text}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-landing-fade-in">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 cursor-default"
            aria-label="Close navigation"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[min(340px,100vw)] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto overscroll-contain touch-pan-y animate-landing-drawer-in">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Activity size={16} className="text-white" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">MedCore</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleDark}
                  className="w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center"
                  aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center" aria-label="Close navigation">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-4 space-y-3">
              {Object.values(MEGA_MENUS).map(item => (
                <div key={item.label} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <a href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-900">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{item.title}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                  </a>
                  <div className="p-2.5 grid gap-1.5">
                    {item.columns.flatMap(column => column.links.slice(0, 2)).map(({ label, icon: Icon }) => (
                      <a key={label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <Icon size={15} className="text-teal-600 dark:text-teal-400" />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button onClick={() => { setMobileMenuOpen(false); onLogin() }} className="btn-primary justify-center">Sign In</button>
                <button onClick={() => { setMobileMenuOpen(false); onRegister() }} className="btn-ghost justify-center">Patient Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="relative min-h-[calc(100svh-9rem)] sm:min-h-[calc(100svh-7rem)] overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-950/68 dark:bg-slate-950/78" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100svh-9rem)] sm:min-h-[calc(100svh-7rem)] flex items-center">
          <div className="max-w-3xl py-10 sm:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-teal-100 backdrop-blur">
              <HeartPulse size={13} /> Operations, care teams, and patient self-service
            </div>
            <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              MedCore Hospital Management System
            </h1>
            <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-lg leading-7 sm:leading-8 text-slate-200">
              A modern command center for appointment access, patient records, clinical work, billing, documents, analytics, and a secure patient portal.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button onClick={onLogin} className="btn-primary justify-center py-2.5 sm:py-3 px-5 text-sm sm:text-base">
                Access Dashboard <ArrowRight size={17} />
              </button>
              <button onClick={onRegister} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-lg bg-white text-slate-800 text-sm sm:text-base font-bold hover:bg-slate-100 transition-colors">
                Create Patient Account
              </button>
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl">
              {[
                ['20+', 'connected modules'],
                ['5', 'role-based workspaces'],
                ['24/7', 'patient access'],
              ].map(([value, label]) => (
                <div key={label} className="border border-white/15 bg-white/8 backdrop-blur rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                  <p className="text-xl sm:text-2xl font-extrabold text-white">{value}</p>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-300 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="relative -mt-5 sm:-mt-8 z-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {QUICK_ACCESS.map(({ title, text, icon: Icon, action }) => (
            <button key={title} onClick={title === 'Patient Portal' ? onRegister : onLogin} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 shadow-sm text-left hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <ToneIcon icon={Icon} />
                <ChevronRight size={16} className="text-slate-300 dark:text-slate-700 mt-2" />
              </div>
              <h2 className="mt-3 sm:mt-4 text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-500 dark:text-slate-400">{text}</p>
              <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs font-bold text-teal-600 dark:text-teal-400">{action}</p>
            </button>
          ))}
        </div>
      </section>

      <main>
        <section id="care" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-8">
            <div>
              <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">How Can We Help?</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Route every visitor to the right next step.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Leading hospital sites make common tasks obvious: get care, plan care, and manage existing care. MedCore uses the same idea, then connects those paths directly to the management system.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {CARE_GROUPS.map(({ title, icon: Icon, items }) => (
                <article key={title} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                  <ToneIcon icon={Icon} tone={title === 'Get Care Now' ? 'blue' : title === 'Plan Your Visit' ? 'violet' : 'teal'} />
                  <h3 className="mt-3 sm:mt-4 font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
                  <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                    {items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <CheckCircle size={15} className="text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-5 mb-6 sm:mb-8">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">Specialties & Services</p>
                <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Care services connected to the operational system behind them.</h2>
              </div>
              <button onClick={onLogin} className="btn-ghost justify-center">
                View All Services <ArrowRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SERVICES.map(service => (
                <article key={service.title} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-5 hover:border-teal-300 dark:hover:border-teal-500/50 transition-colors">
                  <ToneIcon icon={service.icon} tone={service.tone} />
                  <h3 className="mt-3 sm:mt-4 font-extrabold text-slate-900 dark:text-slate-100">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{service.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6 sm:gap-8 items-start">
            <div>
              <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Find A Doctor</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Make provider discovery feel real before sign-in.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Major hospital sites make doctor search a first-class path. This demo block previews that workflow and routes users into the dashboard or patient signup flow.
              </p>
              <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button onClick={onLogin} className="btn-primary justify-center">Search Directory</button>
                <button onClick={onRegister} className="btn-ghost justify-center">Request Appointment</button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600" />
                  <input className="input-field pl-10" value="cardiology, pediatrics, internal medicine" readOnly aria-label="Demo doctor search" />
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {DOCTOR_RESULTS.map(doctor => (
                  <button key={doctor.name} onClick={onRegister} className="w-full p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-500/12 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Stethoscope size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{doctor.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{doctor.specialty}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{doctor.availability}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-1">Next available</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-700" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 sm:gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Operational Command Center</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">A stronger public site backed by a working hospital dashboard.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                The landing page should not only advertise care. It should prove that the system handles the operational pressure behind care: scheduling, triage, records, reviews, billing, and reporting.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Live queue', 'Lab alerts', 'Billing', 'Audit'].map(label => (
                  <span key={label} className="rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 text-center">{label}</span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden">
              <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-slate-900 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-teal-300" />
                  <span className="text-xs font-bold text-white">MedCore Live Operations</span>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">Online</span>
              </div>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4">
                  {DASHBOARD_ROWS.map(([label, value, sub]) => (
                    <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 sm:p-4">
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{label}</p>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-2">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {['Dr. Sarah Chen confirmed a follow-up visit', 'Insurance card uploaded for review', 'Blood work result flagged for doctor review'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2">
                      <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-500/12 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-6 sm:gap-8">
            <div>
              <p className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400">Patient Portal Journey</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">A calmer experience after registration.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Patients should know exactly what the portal gives them before they sign up: appointments, documents, results, prescriptions, bills, and notifications.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {JOURNEY.map(({ title, text, icon: Icon }, index) => (
                <article key={title} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <ToneIcon icon={Icon} tone={index % 2 ? 'blue' : 'teal'} />
                    <span className="text-xs font-extrabold text-slate-300 dark:text-slate-700">0{index + 1}</span>
                  </div>
                  <h3 className="mt-3 sm:mt-4 font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-5 mb-6 sm:mb-8">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">Built Around Roles</p>
                <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Each team sees the work meant for them.</h2>
              </div>
              <button onClick={onLogin} className="btn-primary justify-center">
                Open Staff Dashboard <ArrowRight size={16} />
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              {ROLE_ROWS.map((row, index) => (
                <div key={row.role} className="grid grid-cols-1 md:grid-cols-[180px_1fr_180px] gap-2 md:gap-4 px-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <UserRoundSearch size={16} className={index % 2 ? 'text-blue-600 dark:text-blue-400' : 'text-teal-600 dark:text-teal-400'} />
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{row.role}</p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{row.focus}</p>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 md:text-right">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-2xl mb-6 sm:mb-8">
            <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">Feature Depth</p>
            <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">One organized system for staff and patients.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURES.map(feature => (
              <article key={feature.title} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                <ToneIcon icon={feature.icon} tone={feature.tone} />
                <h3 className="mt-3 sm:mt-4 font-extrabold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="modules" className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Complete Workspace</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">From front desk to clinical review.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                MedCore keeps repeated hospital work close together, so teams can move from patient intake to scheduling, care delivery, billing, and reporting without losing context.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Patient'].map(role => (
                  <span key={role} className="rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">{role}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {MODULES.map(({ label, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 sm:p-4 min-h-24 sm:min-h-28 flex flex-col justify-between">
                  <Icon size={20} className="text-teal-600 dark:text-teal-400" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-950 p-5 sm:p-8 lg:p-10 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 sm:gap-8 items-center">
              <div>
                <div className="w-11 h-11 rounded-lg bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
                  <ShieldCheck size={21} />
                </div>
                <h2 className="mt-3 sm:mt-4 text-xl sm:text-3xl font-extrabold">Designed around roles, records, and accountability.</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {['Patients see only their own portal records.', 'Staff roles are assigned by administrators.', 'Key changes are captured for audit review.', 'Notifications keep requests and reviews visible.'].map(item => (
                  <div key={item} className="flex items-start gap-3 rounded-lg bg-white/6 border border-white/10 p-3.5 sm:p-4">
                    <CheckCircle size={17} className="text-teal-300 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 sm:gap-8">
              <div>
                <p className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400">Trust Signals</p>
                <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Built to feel dependable before anyone signs in.</h2>
                <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                  A stronger hospital landing page needs confidence cues: visible workflows, clear security language, and proof that patients and staff have a path through the system.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TRUST_ITEMS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-5">
                    <Icon size={20} className="text-teal-600 dark:text-teal-400" />
                  <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-400 dark:text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>
              <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {TESTIMONIALS.map(item => (
                <article key={item.name} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-6">
                  <p className="text-base leading-8 text-slate-700 dark:text-slate-300">"{item.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">{item.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.7fr_1.3fr] gap-6 sm:gap-8">
            <div>
              <p className="text-xs font-bold uppercase text-violet-600 dark:text-violet-400">Questions</p>
              <h2 className="mt-2 text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">Common questions answered up front.</h2>
              <p className="mt-3 sm:mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
                Patients and staff should understand account access, role assignment, privacy, and workflow basics before entering the app.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {FAQS.map(item => (
                <article key={item.q} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <HelpCircle size={18} className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100">{item.q}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto rounded-lg border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/12 p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
            <div>
              <p className="text-xs font-bold uppercase text-teal-700 dark:text-teal-300">Ready To Continue</p>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Sign in as staff or create a patient portal account.</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onLogin} className="btn-primary justify-center">Sign In</button>
              <button onClick={onRegister} className="btn-ghost justify-center">Patient Sign Up</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-8 sm:gap-10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Activity size={18} className="text-white" />
                </div>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-200">MedCore</p>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
                Hospital management, patient access, and operational reporting in one workspace.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-sm text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-2"><MapPin size={15} className="text-teal-600 dark:text-teal-400" /> Hospital operations center</p>
                <p className="flex items-center gap-2"><MessageCircle size={15} className="text-teal-600 dark:text-teal-400" /> support@medcore.demo</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {FOOTER_GROUPS.map(group => (
                <div key={group.title}>
                  <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-600 mb-3">{group.title}</p>
                  <div className="space-y-2">
                    {group.links.map(link => (
                      <button
                        key={link}
                        onClick={() => handleFooterLink(link)}
                        className="block text-left text-sm text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-600">Copyright 2026 MedCore. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 dark:text-slate-600">
              <button onClick={() => setInfoPanel('privacy')} className="hover:text-teal-600">Privacy Policy</button>
              <button onClick={() => setInfoPanel('terms')} className="hover:text-teal-600">Terms</button>
              <button onClick={() => setInfoPanel('status')} className="hover:text-teal-600">System Status</button>
            </div>
          </div>
        </div>
      </footer>

      {panel && (
        <Modal open={!!panel} onClose={() => setInfoPanel(null)} title={panel.title} icon={panel.icon} accentColor="teal">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            {panel.body.map((paragraph, index) => (
              <p key={index} className="leading-7">{paragraph}</p>
            ))}
          </div>
          <button onClick={() => setInfoPanel(null)} className="btn-primary justify-center mt-5 w-full">Close</button>
        </Modal>
      )}
    </div>
  )
}
