import { useRef, useState } from 'react'
import { useDiagramStore } from '../../store/diagramStore'

export default function JsonImporter() {
  const importFromJson = useDiagramStore((s) => s.importFromJson)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function parseFile(file: File) {
    setError(null)
    if (!file.name.endsWith('.json')) {
      setError('.json ファイルを選択してください')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const err = importFromJson(json)
        if (err) setError(err)
      } catch {
        setError('JSONの解析に失敗しました')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="px-2 pb-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f) }}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-colors text-xs
          ${dragging
            ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300'
            : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'
          }`}
      >
        <span className="mr-1">📂</span>
        JSON読み込み（.json）
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = '' }}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
  )
}
