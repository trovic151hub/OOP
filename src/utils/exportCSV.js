export function exportCSV(headers, rows, filename = 'export.csv') {
  const escape = val => {
    const str = String(val ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(','))
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportPatients(patients) {
  exportCSV(
    ['ID', 'Name', 'Age', 'Gender', 'Blood Type', 'Condition', 'Status', 'Patient Type', 'Location', 'Phone', 'Notes', 'Registered'],
    patients.map(p => [
      p.id?.slice(-6).toUpperCase(), p.name, p.age, p.gender, p.blood,
      p.condition, p.status, p.patientType, p.location, p.phone, p.notes,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
    ]),
    `patients_${new Date().toISOString().slice(0, 10)}.csv`
  )
}

export function exportDoctors(doctors) {
  exportCSV(
    ['Name', 'Specialty', 'Department', 'Phone', 'Email', 'Availability', 'Experience', 'Schedule'],
    doctors.map(d => [
      d.name, d.specialty, d.department, d.phone, d.email,
      d.availability, d.experience, d.schedule
    ]),
    `doctors_${new Date().toISOString().slice(0, 10)}.csv`
  )
}

export function exportAppointments(appointments) {
  exportCSV(
    ['ID', 'Patient', 'Doctor', 'Date', 'Start Time', 'End Time', 'Type', 'Status', 'Notes'],
    appointments.map(a => [
      a.id?.slice(-6).toUpperCase(), a.patientName, a.doctorName,
      a.date, a.timeStart, a.timeEnd, a.type, a.status, a.notes
    ]),
    `appointments_${new Date().toISOString().slice(0, 10)}.csv`
  )
}

export function exportInventory(inventory) {
  exportCSV(
    ['Name', 'Category', 'Quantity', 'Unit', 'Reorder Level', 'Supplier', 'Location', 'Notes'],
    inventory.map(i => [
      i.name, i.category, i.quantity, i.unit, i.reorderLevel,
      i.supplier, i.location, i.notes
    ]),
    `inventory_${new Date().toISOString().slice(0, 10)}.csv`
  )
}
