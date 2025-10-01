import React from 'react'
import { Rect, Circle } from 'react-konva'
import { Shape } from '@/module_bindings'

interface DraggableShapeProps {
  shape: Shape
  isSelected: boolean
  isDraggable: boolean
  onSelect: (shapeId: number) => void
  onDragMove?: (shapeId: number, newX: number, newY: number) => void
  onDragEnd: (shapeId: number, newX: number, newY: number) => void
}

export default function DraggableShape({
  shape,
  isSelected,
  isDraggable,
  onSelect,
  onDragMove,
  onDragEnd
}: DraggableShapeProps) {
  const commonProps = {
    x: shape.x,
    y: shape.y,
    fill: shape.color || '#000000',
    stroke: isSelected ? '#0066cc' : undefined,
    strokeWidth: isSelected ? 2 : 0,
    draggable: isDraggable,
    onClick: () => onSelect(shape.id),
    onTap: () => onSelect(shape.id),
    onDragMove: onDragMove ? (e: any) => {
      onDragMove(shape.id, e.target.x(), e.target.y())
    } : undefined,
    onDragEnd: (e: any) => {
      onDragEnd(shape.id, e.target.x(), e.target.y())
    }
  }

  if (shape.type === 'rectangle') {
    return (
      <Rect
        {...commonProps}
        width={shape.width}
        height={shape.height}
      />
    )
  } else if (shape.type === 'circle') {
    return (
      <Circle
        {...commonProps}
        radius={Math.min(shape.width, shape.height) / 2}
        x={shape.x + shape.width / 2}
        y={shape.y + shape.height / 2}
      />
    )
  }

  return null
}