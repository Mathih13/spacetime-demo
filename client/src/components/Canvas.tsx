import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer, Circle, Text } from "react-konva";
import { Identity } from "spacetimedb";
import { Shape, User, DbConnection } from "@/module_bindings";
import DraggableShape from "./DraggableShape";

interface CanvasProps {
  width: number;
  height: number;
  selectedTool: "rectangle" | "circle" | "select";
  selectedColor: string;
  shapes: readonly Shape[];
  users: readonly User[];
  currentUserIdentity: Identity;
  conn: DbConnection;
}

export default function Canvas({
  width,
  height,
  selectedTool,
  selectedColor,
  shapes,
  users,
  currentUserIdentity,
  conn,
}: CanvasProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const stageRef = useRef<any>(null);

  const handleMouseMove = useCallback(
    (e: any) => {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        conn.reducers.updateCursor(pos.x, pos.y);
      }
    },
    [conn]
  );

  const handleStageClick = useCallback(
    (e: any) => {
      // Don't create shapes when clicking on draggable shapes (Rect/Circle that are actual shapes)
      const targetClassName = e.target.getClassName();
      const isClickingOnShape =
        (targetClassName === "Rect" || targetClassName === "Circle") &&
        e.target.attrs &&
        e.target.attrs.draggable !== undefined;

      if (isClickingOnShape) {
        return;
      }

      if (selectedTool === "select") {
        // Deselect any selected shape when clicking on empty area
        setSelectedId(null);
        return;
      }

      // Create new shape - allow creation when clicking on Stage, Layer, or other user cursors
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      const defaultSize = 50;
      conn.reducers.createShape(
        selectedTool,
        pos.x - defaultSize / 2,
        pos.y - defaultSize / 2,
        defaultSize,
        defaultSize,
        selectedColor
      );
    },
    [selectedTool, selectedColor, conn]
  );

  const handleShapeSelect = useCallback(
    (shapeId: number) => {
      if (selectedTool === "select") {
        setSelectedId(shapeId);
      }
    },
    [selectedTool]
  );

  const handleShapeDragMove = useCallback(
    (shapeId: number, newX: number, newY: number) => {
      conn.reducers.moveShape(shapeId, newX, newY);
      // Update cursor position to the center of the shape being dragged
      const draggedShape = shapes.find((s) => s.id === shapeId);
      if (draggedShape) {
        const centerX = newX + draggedShape.width / 2;
        const centerY = newY + draggedShape.height / 2;
        conn.reducers.updateCursor(centerX, centerY);
      }
    },
    [conn, shapes]
  );

  const handleShapeDragEnd = useCallback(
    (shapeId: number, newX: number, newY: number) => {
      conn.reducers.moveShape(shapeId, newX, newY);
      // Update cursor position to the final position of the dragged shape
      const draggedShape = shapes.find((s) => s.id === shapeId);
      if (draggedShape) {
        const centerX = newX + draggedShape.width / 2;
        const centerY = newY + draggedShape.height / 2;
        conn.reducers.updateCursor(centerX, centerY);
      }
    },
    [conn, shapes]
  );

  const renderShape = (shape: Shape) => {
    return (
      <DraggableShape
        key={shape.id}
        shape={shape}
        isSelected={shape.id === selectedId}
        isDraggable={selectedTool === "select"}
        onSelect={handleShapeSelect}
        onDragMove={handleShapeDragMove}
        onDragEnd={handleShapeDragEnd}
      />
    );
  };

  const renderUserCursors = () => {
    return users
      .filter(
        (user) =>
          user.online &&
          user.cursorX !== undefined &&
          user.cursorY !== undefined &&
          !user.identity.isEqual(currentUserIdentity) // Filter out current user
      )
      .map((user) => (
        <React.Fragment key={user.identity.toHexString()}>
          <Circle
            x={user.cursorX}
            y={user.cursorY}
            radius={5}
            fill="#ff6b6b"
            stroke="#ffffff"
            strokeWidth={2}
          />
          {user.name && (
            <Text
              x={user.cursorX + 10}
              y={user.cursorY - 5}
              text={user.name}
              fontSize={12}
              fill="#333"
              padding={4}
            />
          )}
        </React.Fragment>
      ));
  };

  return (
    <div className="border border-gray-300 rounded-lg ">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
        className="bg-slate-50"
      >
        <Layer>
          {shapes.map(renderShape)}
          {renderUserCursors()}
        </Layer>
      </Stage>
    </div>
  );
}
