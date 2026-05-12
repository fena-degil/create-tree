import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Sidebar from './components/Sidebar/Sidebar'
import DiagramCanvas from './components/Diagram/DiagramCanvas'
import { useDiagramStore } from './store/diagramStore'

export default function App() {
  const resetAll = useDiagramStore((s) => s.resetAll)
  const [confirming, setConfirming] = useState(false)

  function handleReset() {
    if (confirming) {
      resetAll()
      setConfirming(false)
    } else {
      setConfirming(true)
      // Auto-cancel after 3 seconds if not confirmed
      setTimeout(() => setConfirming(false), 3000)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 h-12 bg-[#1a2744] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-bold text-sm">VE</span>
          <span className="text-white/80 text-sm font-medium">機能系統図ツール</span>
        </div>
        <div className="flex-1" />
        <span className="text-white/30 text-xs">データは自動保存されます</span>

        {/* Reset button — two-tap confirmation */}
        <button
          onClick={handleReset}
          className={`text-xs px-3 py-1 rounded border transition-colors ${
            confirming
              ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'border-white/15 text-white/35 hover:text-white/60 hover:border-white/30'
          }`}
        >
          {confirming ? '本当にリセット？' : '🗑 全削除'}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ReactFlowProvider>
          <DiagramCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}
