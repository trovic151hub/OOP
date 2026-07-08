import { useState } from 'react'

// Searchable text input with a filtered floating suggestion panel — replaces
// native <datalist> autocomplete, which browsers render with zero styling
// control and inconsistent behavior across Chrome/Firefox/Edge.
export default function Combobox({ value, onChange, options, getLabel, getSub, placeholder }) {
  const [open, setOpen] = useState(false)
  const filtered = value
    ? options.filter(o => getLabel(o).toLowerCase().includes(value.toLowerCase()))
    : options

  return (
    <div className="relative">
      <input
        className="input-field"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-[100] overflow-hidden max-h-52 overflow-y-auto py-1">
            {filtered.slice(0, 8).map((o, i) => (
              <button
                type="button"
                key={o.id || i}
                onClick={() => { onChange(getLabel(o)); setOpen(false) }}
                className="w-full text-left px-3.5 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">{getLabel(o)}</span>
                {getSub && <span className="text-xs text-slate-400 dark:text-slate-600 flex-shrink-0">{getSub(o)}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
