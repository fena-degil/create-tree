import { useRef, useState } from 'react'
import { read, utils } from 'xlsx'
import { useDiagramStore } from '../../store/diagramStore'

export default function ExcelUploader() {
  const importFromExcel = useDiagramStore((s) => s.importFromExcel)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function parseFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = read(e.target?.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const json = utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

        if (json.length === 0) {
          setError('データがありません')
          return
        }

        const keys = Object.keys(json[0])
        const compKey = keys.find((k) => k.includes('構成要素')) ?? keys[0]
        const funcKey = keys.find((k) => k.includes('機能')) ?? keys[1]

        if (!compKey || !funcKey) {
          setError('「構成要素」「機能」列が必要です')
          return
        }

        const items = json
          .filter((r) => r[compKey] || r[funcKey])
          .map((r) => ({
            component: String(r[compKey] ?? '').trim(),
            functionText: String(r[funcKey] ?? '').trim(),
          }))
          .filter((i) => i.component && i.functionText)

        importFromExcel(items)
      } catch {
        setError('ファイルの読み込みに失敗しました')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="px-2 py-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f) }}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors text-xs
          ${dragging
            ? 'border-blue-400 bg-blue-400/10 text-blue-300'
            : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/60'
          }`}
      >
        <div className="text-lg mb-1">📂</div>
        <div>Excelをドロップ or クリック</div>
        <div className="text-white/25 mt-0.5">.xlsx / .xls（構成要素・機能列）</div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); e.target.value = '' }}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
  )
}
