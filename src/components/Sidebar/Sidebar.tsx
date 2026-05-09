import { useState } from 'react'
import ComponentTable from './ComponentTable'
import ExcelUploader from '../Upload/ExcelUploader'

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <div
      className="flex flex-col h-full bg-[#1a2744] border-r border-white/10 transition-all duration-200 flex-shrink-0"
      style={{ width: open ? 320 : 48 }}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-white/10 flex-shrink-0">
        {open && (
          <span className="text-white/70 text-xs font-medium tracking-wide">構成要素・機能</span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto text-white/50 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          title={open ? 'サイドバーを閉じる' : 'サイドバーを開く'}
        >
          {open ? '◀' : '▶'}
        </button>
      </div>

      {open && (
        <div className="flex flex-col flex-1 overflow-hidden py-2 px-1">
          {/* Excel uploader */}
          <ExcelUploader />

          {/* Divider */}
          <div className="border-t border-white/10 my-2" />

          {/* Table */}
          <div className="flex-1 overflow-hidden px-1">
            <ComponentTable />
          </div>
        </div>
      )}
    </div>
  )
}
