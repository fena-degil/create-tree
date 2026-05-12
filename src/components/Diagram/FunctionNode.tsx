import { useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useDiagramStore } from '../../store/diagramStore'
import type { FunctionNodeData } from '../../types'

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1a2744' : '#ffffff'
}

export default function FunctionNode({ id, data, selected }: NodeProps) {
  const nodeData = data as FunctionNodeData
  const { label, number, color } = nodeData

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const updateNodeLabelAndSync = useDiagramStore((s) => s.updateNodeLabelAndSync)

  useEffect(() => {
    setDraft(label)
  }, [label])

  const commitEdit = useCallback(() => {
    setEditing(false)
    if (draft === label) return
    updateNodeLabelAndSync(id, draft)
  }, [draft, label, id, updateNodeLabelAndSync])

  const textColor = contrastColor(color)

  return (
    <div
      className="relative"
      onDoubleClick={() => {
        setEditing(true)
        setTimeout(() => inputRef.current?.focus(), 10)
      }}
    >
      {/* Number badge */}
      {number && (
        <div
          className="absolute -top-5 left-0 text-[10px] font-mono font-medium pointer-events-none select-none"
          style={{ color: '#94a3b8' }}
        >
          {number}
        </div>
      )}

      {/* Node body */}
      <div
        className="rounded-md px-2 w-[160px] shadow-md flex items-center justify-center overflow-hidden"
        style={{
          backgroundColor: color,
          height: editing ? 'auto' : '48px',
          minHeight: '48px',
          border: selected ? `2px solid rgba(255,255,255,0.4)` : '2px solid transparent',
          boxShadow: selected
            ? `0 0 0 2px ${color}88, 0 2px 8px rgba(0,0,0,0.5)`
            : '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        {editing ? (
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                commitEdit()
              }
              if (e.key === 'Escape') {
                setEditing(false)
                setDraft(label)
              }
            }}
            className="w-full bg-transparent text-xs font-medium resize-none outline-none leading-tight text-center py-1"
            style={{ color: textColor }}
            rows={2}
          />
        ) : (
          <div
            className="text-xs font-medium text-center leading-tight line-clamp-3 w-full px-1"
            style={{ color: textColor }}
          >
            {label || '機能を入力'}
          </div>
        )}
      </div>

      {/* Handles — open circles matching image style */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-[#0f172a] !border-2 !border-slate-400"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-[#0f172a] !border-2 !border-slate-400"
      />
    </div>
  )
}
