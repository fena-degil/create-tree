import { useDiagramStore } from '../../store/diagramStore'
import ColorPicker from './ColorPicker'
import type { ComponentGroup, FunctionItem } from '../../types'

interface GroupRowProps {
  group: ComponentGroup
  functions: FunctionItem[]
}

export default function GroupRow({ group, functions }: GroupRowProps) {
  const updateGroup = useDiagramStore((s) => s.updateGroup)
  const deleteGroup = useDiagramStore((s) => s.deleteGroup)
  const addFunction = useDiagramStore((s) => s.addFunction)
  const updateFunctionText = useDiagramStore((s) => s.updateFunctionText)
  const deleteFunction = useDiagramStore((s) => s.deleteFunction)

  return (
    <div className="mb-2">
      {/* Component group header */}
      <div className="group flex items-center gap-1.5 px-1 py-1 rounded hover:bg-white/5">
        <ColorPicker
          value={group.color}
          onChange={(color) => updateGroup(group.id, { color })}
        />
        <input
          type="text"
          value={group.component}
          onChange={(e) => updateGroup(group.id, { component: e.target.value })}
          placeholder="構成要素名"
          className="flex-1 bg-transparent text-white text-xs font-medium placeholder-white/30 focus:outline-none focus:bg-white/10 rounded px-1 py-0.5 min-w-0"
        />
        <button
          onClick={() => addFunction(group.id)}
          title="機能を追加"
          className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-blue-400 text-xs px-1 transition-all"
        >
          +
        </button>
        <button
          onClick={() => deleteGroup(group.id)}
          title="構成要素を削除"
          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 text-xs px-1 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Function items (indented) */}
      {functions.map((fn, idx) => (
        <div
          key={fn.id}
          className="group flex items-center gap-1 pl-5 pr-1 py-0.5 hover:bg-white/5 rounded"
        >
          <span className="text-white/20 text-xs flex-shrink-0 select-none">
            {idx === functions.length - 1 ? '└' : '├'}
          </span>
          <input
            type="text"
            value={fn.functionText}
            onChange={(e) => updateFunctionText(fn.id, e.target.value)}
            placeholder="機能名"
            className="flex-1 bg-transparent text-white/80 text-xs placeholder-white/25 focus:outline-none focus:bg-white/10 rounded px-1 py-0.5 min-w-0"
          />
          <button
            onClick={() => deleteFunction(fn.id)}
            className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 text-xs px-1 transition-all flex-shrink-0"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add function button (always visible when no functions yet) */}
      {functions.length === 0 && (
        <button
          onClick={() => addFunction(group.id)}
          className="pl-6 py-0.5 text-white/25 hover:text-white/60 text-xs transition-colors"
        >
          + 機能を追加
        </button>
      )}
    </div>
  )
}
