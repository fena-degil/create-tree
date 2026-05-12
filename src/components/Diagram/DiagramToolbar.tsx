import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { toPng } from 'html-to-image'
import { useDiagramStore } from '../../store/diagramStore'

export default function DiagramToolbar() {
  const addStandaloneNode = useDiagramStore((s) => s.addStandaloneNode)
  const deleteSelectedNodes = useDiagramStore((s) => s.deleteSelectedNodes)
  const exportToJson = useDiagramStore((s) => s.exportToJson)
  const { fitView } = useReactFlow()

  const handleExport = useCallback(async () => {
    const el = document.querySelector('.react-flow') as HTMLElement | null
    if (!el) return
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#0f172a',
        pixelRatio: 2,
      })
      const a = document.createElement('a')
      a.href = dataUrl
      const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
      a.download = `ve-diagram-${ts}.png`
      a.click()
    } catch (e) {
      console.error('Export failed', e)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2744] border-b border-white/10 flex-shrink-0">
      <button
        onClick={addStandaloneNode}
        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
      >
        <span>+</span>
        <span>ノード追加</span>
      </button>
      <button
        onClick={deleteSelectedNodes}
        className="flex items-center gap-1 text-xs bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-white px-3 py-1 rounded transition-colors"
      >
        <span>🗑</span>
        <span>削除</span>
      </button>
      <div className="flex-1" />
      <button
        onClick={() => fitView({ padding: 0.1 })}
        className="text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1 rounded transition-colors"
      >
        全体表示
      </button>
      <button
        onClick={exportToJson}
        className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1 rounded transition-colors"
      >
        <span>💾</span>
        <span>JSON保存</span>
      </button>
      <button
        onClick={handleExport}
        className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-3 py-1 rounded transition-colors"
      >
        <span>📷</span>
        <span>PNG保存</span>
      </button>
    </div>
  )
}
