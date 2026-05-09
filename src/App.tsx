import { ReactFlowProvider } from '@xyflow/react'
import Sidebar from './components/Sidebar/Sidebar'
import DiagramCanvas from './components/Diagram/DiagramCanvas'

export default function App() {
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
