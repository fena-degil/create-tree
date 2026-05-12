import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import type { ComponentGroup, FunctionItem, FunctionNodeData } from '../types'

const DEFAULT_COLORS = [
  '#1e3a5f',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#7c3aed',
]

export const ZONE_WIDTH = 220

function recalcNumbers(
  nodes: Node<FunctionNodeData>[],
  edges: Edge[]
): Node<FunctionNodeData>[] {
  const children: Record<string, string[]> = {}
  const hasParent = new Set<string>()
  for (const e of edges) {
    if (!children[e.source]) children[e.source] = []
    children[e.source].push(e.target)
    hasParent.add(e.target)
  }

  const roots = nodes
    .filter((n) => !hasParent.has(n.id))
    .sort((a, b) => a.position.y - b.position.y)

  const numberMap: Record<string, string> = {}

  function assign(nodeId: string, prefix: string) {
    numberMap[nodeId] = prefix
    const kids = (children[nodeId] ?? [])
      .map((id) => nodes.find((n) => n.id === id))
      .filter((n): n is Node<FunctionNodeData> => n !== undefined)
      .sort((a, b) => a.position.y - b.position.y)
    kids.forEach((kid, i) => assign(kid.id, `${prefix}-${i + 1}`))
  }

  roots.forEach((root, i) => assign(root.id, `F${i + 1}`))

  return nodes.map((n) => ({
    ...n,
    data: { ...n.data, number: numberMap[n.id] ?? '' },
  }))
}

// Remove nodes linked to given functionItemIds, and their edges
function removeLinkedNodes(
  functionItemIds: string[],
  nodes: Node<FunctionNodeData>[],
  edges: Edge[]
): { nodes: Node<FunctionNodeData>[]; edges: Edge[] } {
  const ids = new Set(functionItemIds)
  const removedNodeIds = new Set(
    nodes.filter((n) => ids.has(n.data.functionItemId)).map((n) => n.id)
  )
  return {
    nodes: nodes.filter((n) => !removedNodeIds.has(n.id)),
    edges: edges.filter(
      (e) => !removedNodeIds.has(e.source) && !removedNodeIds.has(e.target)
    ),
  }
}

interface DiagramState {
  groups: ComponentGroup[]
  functions: FunctionItem[]
  nodes: Node<FunctionNodeData>[]
  edges: Edge[]

  // Group actions
  addGroup: () => void
  updateGroup: (id: string, patch: Partial<ComponentGroup>) => void
  deleteGroup: (id: string) => void

  // Function actions (auto-syncs nodes)
  addFunction: (groupId: string) => void
  updateFunctionText: (id: string, text: string) => void
  deleteFunction: (id: string) => void

  // Node direct edit (syncs back to function item)
  updateNodeLabelAndSync: (nodeId: string, text: string) => void

  // React Flow handlers
  onNodesChange: OnNodesChange<Node<FunctionNodeData>>
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect

  // Standalone node (not linked to table)
  addStandaloneNode: () => void
  deleteSelectedNodes: () => void

  // Excel import
  importFromExcel: (items: Array<{ component: string; functionText: string }>) => void

  // Reset all data
  resetAll: () => void
}

export const useDiagramStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      groups: [],
      functions: [],
      nodes: [],
      edges: [],

      // ── Groups ────────────────────────────────────────────
      addGroup: () => {
        const { groups } = get()
        const usedColors = new Set(groups.map((g) => g.color))
        const color =
          DEFAULT_COLORS.find((c) => !usedColors.has(c)) ??
          DEFAULT_COLORS[groups.length % DEFAULT_COLORS.length]
        set((s) => ({
          groups: [...s.groups, { id: nanoid(), component: '', color }],
        }))
      },

      updateGroup: (id, patch) => {
        set((s) => {
          const groups = s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g))
          if (!patch.color) return { groups }
          // Sync color to all nodes belonging to this group's functions
          const groupFuncIds = new Set(
            s.functions.filter((f) => f.groupId === id).map((f) => f.id)
          )
          const nodes = s.nodes.map((n) =>
            groupFuncIds.has(n.data.functionItemId)
              ? { ...n, data: { ...n.data, color: patch.color! } }
              : n
          )
          return { groups, nodes }
        })
      },

      deleteGroup: (id) => {
        set((s) => {
          const funcIds = s.functions
            .filter((f) => f.groupId === id)
            .map((f) => f.id)
          const { nodes, edges } = removeLinkedNodes(funcIds, s.nodes, s.edges)
          return {
            groups: s.groups.filter((g) => g.id !== id),
            functions: s.functions.filter((f) => f.groupId !== id),
            nodes: recalcNumbers(nodes, edges),
            edges,
          }
        })
      },

      // ── Functions ─────────────────────────────────────────
      addFunction: (groupId) => {
        const { groups, functions, nodes, edges } = get()
        const group = groups.find((g) => g.id === groupId)
        if (!group) return

        const fi: FunctionItem = { id: nanoid(), groupId, functionText: '' }

        // Place below existing nodes of this group
        const groupFuncIds = new Set(
          functions.filter((f) => f.groupId === groupId).map((f) => f.id)
        )
        const groupNodes = nodes.filter((n) => groupFuncIds.has(n.data.functionItemId))
        const maxY = groupNodes.reduce((m, n) => Math.max(m, n.position.y), -60)
        const newY = maxY + 68

        const newNode: Node<FunctionNodeData> = {
          id: nanoid(),
          type: 'functionNode',
          position: { x: 0, y: newY },
          data: { label: '', number: '', color: group.color, functionItemId: fi.id },
        }

        set((s) => ({
          functions: [...s.functions, fi],
          nodes: recalcNumbers([...s.nodes, newNode], edges),
        }))
      },

      updateFunctionText: (id, text) => {
        set((s) => {
          const functions = s.functions.map((f) =>
            f.id === id ? { ...f, functionText: text } : f
          )
          const nodes = s.nodes.map((n) =>
            n.data.functionItemId === id
              ? { ...n, data: { ...n.data, label: text } }
              : n
          )
          return { functions, nodes }
        })
      },

      deleteFunction: (id) => {
        set((s) => {
          const { nodes, edges } = removeLinkedNodes([id], s.nodes, s.edges)
          return {
            functions: s.functions.filter((f) => f.id !== id),
            nodes: recalcNumbers(nodes, edges),
            edges,
          }
        })
      },

      // ── Node direct label edit → syncs back to table ──────
      updateNodeLabelAndSync: (nodeId, text) => {
        set((s) => {
          const node = s.nodes.find((n) => n.id === nodeId)
          if (!node) return {}
          const { functionItemId } = node.data
          const nodes = s.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, label: text } } : n
          )
          const functions = functionItemId
            ? s.functions.map((f) =>
                f.id === functionItemId ? { ...f, functionText: text } : f
              )
            : s.functions
          return { nodes: recalcNumbers(nodes, s.edges), functions }
        })
      },

      // ── React Flow handlers ───────────────────────────────
      onNodesChange: (changes) => {
        set((s) => ({
          nodes: recalcNumbers(
            applyNodeChanges(changes, s.nodes) as Node<FunctionNodeData>[],
            s.edges
          ),
        }))
      },

      onEdgesChange: (changes) => {
        set((s) => {
          const edges = applyEdgeChanges(changes, s.edges)
          return { edges, nodes: recalcNumbers(s.nodes, edges) }
        })
      },

      onConnect: (connection) => {
        set((s) => {
          const edges = addEdge({ ...connection, type: 'ortho' }, s.edges)
          return { edges, nodes: recalcNumbers(s.nodes, edges) }
        })
      },

      addStandaloneNode: () => {
        const { groups, nodes, edges } = get()
        const color = groups[0]?.color ?? '#2563eb'
        const newNode: Node<FunctionNodeData> = {
          id: nanoid(),
          type: 'functionNode',
          position: {
            x: ZONE_WIDTH * Math.floor(nodes.length / 5),
            y: (nodes.length % 5) * 80 + 40,
          },
          data: { label: '機能を入力', number: '', color, functionItemId: '' },
        }
        set({ nodes: recalcNumbers([...nodes, newNode], edges) })
      },

      deleteSelectedNodes: () => {
        set((s) => {
          const deletedIds = new Set(
            s.nodes.filter((n) => n.selected).map((n) => n.id)
          )
          const nodes = s.nodes.filter((n) => !deletedIds.has(n.id))
          const edges = s.edges.filter(
            (e) => !deletedIds.has(e.source) && !deletedIds.has(e.target)
          )
          return { nodes: recalcNumbers(nodes, edges), edges }
        })
      },

      // ── Excel import ──────────────────────────────────────
      importFromExcel: (items) => {
        set((s) => {
          // Build color map for existing components
          const colorMap: Record<string, string> = {}
          s.groups.forEach((g) => { colorMap[g.component] = g.color })

          // Assign colors for new components
          let colorIdx = s.groups.length
          const uniqueComponents = [...new Set(items.map((i) => i.component))]
          uniqueComponents.forEach((comp) => {
            if (!colorMap[comp]) {
              colorMap[comp] = DEFAULT_COLORS[colorIdx % DEFAULT_COLORS.length]
              colorIdx++
            }
          })

          // Create or reuse groups
          const groupMap: Record<string, string> = {} // component -> groupId
          s.groups.forEach((g) => { groupMap[g.component] = g.id })

          const newGroups: ComponentGroup[] = []
          uniqueComponents.forEach((comp) => {
            if (!groupMap[comp]) {
              const gid = nanoid()
              groupMap[comp] = gid
              newGroups.push({ id: gid, component: comp, color: colorMap[comp] })
            }
          })

          // Deduplicate: skip function items already in the store
          const existingKeys = new Set(
            s.functions.map((f) => {
              const g = s.groups.find((g) => g.id === f.groupId)
              return `${g?.component}::${f.functionText}`
            })
          )

          const newFunctions: FunctionItem[] = []
          const newNodes: Node<FunctionNodeData>[] = []
          const baseY = s.nodes.length * 80

          items.forEach((item, i) => {
            const key = `${item.component}::${item.functionText}`
            if (existingKeys.has(key)) return
            existingKeys.add(key)
            const fi: FunctionItem = {
              id: nanoid(),
              groupId: groupMap[item.component],
              functionText: item.functionText,
            }
            newFunctions.push(fi)
            newNodes.push({
              id: nanoid(),
              type: 'functionNode',
              position: { x: 0, y: baseY + i * 80 },
              data: {
                label: item.functionText,
                number: '',
                color: colorMap[item.component],
                functionItemId: fi.id,
              },
            })
          })

          const groups = [...s.groups, ...newGroups]
          const functions = [...s.functions, ...newFunctions]
          const nodes = recalcNumbers([...s.nodes, ...newNodes], s.edges)
          return { groups, functions, nodes }
        })
      },

      resetAll: () => {
        set({ groups: [], functions: [], nodes: [], edges: [] })
      },
    }),
    {
      name: 'vft-diagram-v2',
      partialize: (s) => ({
        groups: s.groups,
        functions: s.functions,
        nodes: s.nodes,
        edges: s.edges,
      }),
    }
  )
)
