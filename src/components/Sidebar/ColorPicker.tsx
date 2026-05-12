import { useState, useRef, useEffect } from 'react'

const PRESET_COLORS = [
  '#1e3a5f', // dark navy
  '#2563eb', // blue
  '#0ea5e9', // sky
  '#0891b2', // cyan
  '#0d9488', // teal
  '#059669', // emerald
  '#16a34a', // green
  '#65a30d', // lime
  '#d97706', // amber
  '#ea580c', // orange
  '#dc2626', // red
  '#db2777', // pink
  '#9333ea', // purple
  '#7c3aed', // violet
  '#475569', // slate
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-5 h-5 rounded-full border-2 border-white/30 shadow hover:border-white/60 transition-colors"
        style={{ backgroundColor: value }}
        title="色を選択"
      />

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-7 z-50 bg-[#1e293b] border border-white/20 rounded-lg p-2 shadow-xl">
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => { onChange(color); setOpen(false) }}
                className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: color === value ? 'white' : 'transparent',
                }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
