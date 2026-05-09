export interface ComponentGroup {
  id: string
  component: string
  color: string
}

export interface FunctionItem {
  id: string
  groupId: string
  functionText: string
}

export interface FunctionNodeData {
  label: string
  number: string
  color: string
  functionItemId: string   // links to FunctionItem.id; empty for standalone nodes
  [key: string]: unknown
}
