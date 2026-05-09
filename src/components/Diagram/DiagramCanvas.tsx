import { useMemo, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/base.css'
import { useDiagramStore } from '../../store/diagramStore'
import FunctionNode from './FunctionNode'
import OrthoEdge from './OrthoEdge'
import DiagramToolbar from './DiagramToolbar'
import type { FunctionNodeData } from '../../types'

export default function DiagramCanvas() {
  const nodes = useDiagramStore((s) => s.nodes)
  const edges = useDiagramStore((s) => s.edges)
  const onNodesChange = useDiagramStore((s) => s.onNodesChange)
  const onEdgesChange = useDiagramStore((s) => s.onEdgesChange)
  const onConnect = useDiagramStore((s) => s.onConnect)
  const deleteSelectedNodes = useDiagramStore((s) => s.deleteSelectedNodes)

  const nodeTypes = useMemo(() => ({ functionNode: FunctionNode }), [])
  const edgeTypes = useMemo(() => ({ ortho: OrthoEdge }), [])

  // Keyboard delete
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        deleteSelectedNodes()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteSelectedNodes])

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <DiagramToolbar />
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes as Node<FunctionNodeData>[]}
          edges={edges as Edge[]}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{ type: 'ortho' }}
          snapToGrid
          snapGrid={[20, 20]}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode={null}
          className="bg-[#0f172a]"
        >
          <Background color="#1e293b" gap={20} size={1.5} />
          <Controls className="!bg-[#1a2744] !border-white/10" />
          <MiniMap
            nodeColor={(n) => (n.data as FunctionNodeData).color ?? '#2563eb'}
            className="!bg-[#1a2744] !border-white/10"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
