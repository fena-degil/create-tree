interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <label className="relative cursor-pointer flex-shrink-0">
      <span
        className="block w-5 h-5 rounded-full border border-white/30 shadow"
        style={{ backgroundColor: value }}
      />
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer"
      />
    </label>
  )
}
