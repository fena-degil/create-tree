import type { EdgeProps } from '@xyflow/react'

// Trunk X = midpoint between source and target, clamped to a min/max offset.
// This keeps the bracket visually centered regardless of node spacing,
// while all siblings from the same source share the same trunkX.
export default function OrthoEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps) {
  const gap = targetX - sourceX
  const trunkX = sourceX + Math.max(16, Math.min(gap * 0.4, 48))

  // Path: right from source → vertical to target row → right to target
  const d = `M ${sourceX} ${sourceY} H ${trunkX} V ${targetY} H ${targetX}`

  return (
    <>
      <path
        id={id}
        d={d}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
      {/* Invisible wider hit area for easier selection */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth={10}
        className="react-flow__edge-interaction"
      />
    </>
  )
}
