import { useDiagramStore } from '../../store/diagramStore'
import GroupRow from './GroupRow'

export default function ComponentTable() {
  const groups = useDiagramStore((s) => s.groups)
  const functions = useDiagramStore((s) => s.functions)
  const addGroup = useDiagramStore((s) => s.addGroup)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10 mb-2">
        <span className="text-white/50 text-[11px] uppercase tracking-wide">構成要素 / 機能</span>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            functions={functions.filter((f) => f.groupId === group.id)}
          />
        ))}
        {groups.length === 0 && (
          <p className="text-white/25 text-xs text-center py-6 leading-relaxed">
            構成要素を追加して<br />機能を入力してください
          </p>
        )}
      </div>

      {/* Add group button */}
      <div className="pt-2 border-t border-white/10">
        <button
          onClick={addGroup}
          className="w-full text-xs text-white/50 hover:text-white py-1.5 rounded hover:bg-white/10 transition-colors"
        >
          + 構成要素を追加
        </button>
      </div>
    </div>
  )
}
