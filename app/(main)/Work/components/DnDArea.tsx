"use client";

import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  closestCorners,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Droppable from "@/app/components/dnd/Droppable";
import { Sortable } from "@/app/components/dnd/Sortable";
import { SortableItem } from "@/app/components/dnd/SortableItem";
import { ProjectDetail } from "@/app/components/type/ticket";

type DnDAreaProps = {
  projectData: ProjectDetail;
  deleteMode: boolean;
  activeId: UniqueIdentifier | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDelete: (listId: string, ticketId: number) => void;
  onEdit: (listId: string, ticketId: number) => void;
};

const DnDArea: React.FC<DnDAreaProps> = ({
  projectData,
  deleteMode,
  activeId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDelete,
  onEdit,
}) => {
  const customClosestCorners: CollisionDetection = (args) => {
    const cornerCollisions = closestCorners(args);
    const listIds = new Set(projectData.lists.map((list) => list.id));
    const closestContainer = cornerCollisions.find((c) =>
      listIds.has(c.id.toString())
    );
    if (!closestContainer) return cornerCollisions;

    const collisions = cornerCollisions.filter(({ data }) => {
      if (!data) return false;
      const droppableData = data.droppableContainer?.data?.current;
      if (!droppableData) return false;
      const { containerId } = droppableData.sortable;
      return closestContainer.id === containerId;
    });

    return collisions.length === 0 ? [closestContainer] : collisions;
  };

  return (
    <DndContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      collisionDetection={customClosestCorners}
      id={projectData.id}
    >
      <div className="w-full overflow-x-auto py-8">
        <div className="flex gap-8 justify-center min-w-fit">
          {projectData.lists.map((list) => (
            <SortableContext
              key={list.id}
              items={list.tickets.map((ticket) => ticket.id)}
              id={list.id}
              strategy={verticalListSortingStrategy}
            >
              <div className="min-h-[600px] min-w-44 border rounded-xl p-4 bg-white shadow">
                <h2 className="border-b-4 border-base-content font-semibold">
                  {list.category}
                </h2>
                <Droppable id={list.id}>
                  <div className="flex flex-col gap-8 p-4 min-h-[600px] min-w-44">
                    {list.tickets.map((ticket) =>
                      deleteMode ? (
                        <SortableItem
                          key={ticket.id}
                          content={ticket.content}
                          ticketId={ticket.id}
                          listId={list.id}
                          deleteMode={deleteMode}
                          onDelete={onDelete}
                          onEdit={onEdit}
                        />
                      ) : (
                        <Sortable key={ticket.id} id={ticket.id}>
                          <SortableItem
                            content={ticket.content}
                            ticketId={ticket.id}
                            listId={list.id}
                            deleteMode={deleteMode}
                            onDelete={onDelete}
                            onEdit={onEdit}
                          />
                        </Sortable>
                      )
                    )}
                  </div>
                </Droppable>
              </div>
            </SortableContext>
          ))}

          {!deleteMode && activeId && (() => {
            const activeEntry = projectData.lists
              .flatMap((list) =>
                list.tickets.map((ticket) => ({ ticket, listId: list.id }))
              )
              .find((entry) => entry.ticket.id === activeId);

            return (
              <DragOverlay>
                {activeEntry ? (
                  <SortableItem
                    content={activeEntry.ticket.content}
                    ticketId={activeEntry.ticket.id}
                    listId={activeEntry.listId}
                    onDelete={() => {}}
                    deleteMode={deleteMode}
                    onEdit={onEdit}
                  />
                ) : null}
              </DragOverlay>
            );
          })()}
        </div>
      </div>
    </DndContext>
  );
};

export default DnDArea;
