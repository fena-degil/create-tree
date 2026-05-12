import { useState, useRef, useEffect } from 'react'

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
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
        className="w-6 h-6 rounded-full border-2 border-white/30 shadow hover:border-white/60 transition-colors flex-shrink-0"
        style={{ backgroundColor: value }}
        title="色を選択"
      />

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-8 z-50 bg-[#1e293b] border border-white/20 rounded-xl p-3 shadow-2xl">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => { onChange(color); setOpen(false) }}
                className="w-9 h-9 rounded-full border-[3px] transition-transform hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: color,
                  borderColor: color === value ? 'white' : 'transparent',
                  boxShadow: color === value ? `0 0 0 1px ${color}` : 'none',
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
