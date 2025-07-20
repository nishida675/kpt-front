import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Active,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  Over,
} from "@dnd-kit/core";
import { ProjectDetail } from "@/app/components/type/ticket";
import isEqual from "lodash/isEqual";

export function useDnDHandlers(
  projectData: ProjectDetail,
  setProjectData: (p: ProjectDetail) => void
) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active) {
      setActiveId(event.active.id as number);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const data = getData(event);
    if (!data) return;
    const { from, to } = data;
    if (from.containerId !== to.containerId) return;
    const list = projectData.lists.find((list) => list.id == from.containerId);
    if (!list) return;
    const newTickets = arrayMove(list.tickets, from.index, to.index);
    const newLists = projectData.lists.map((list) => {
      if (list.id === from.containerId) return { ...list, tickets: newTickets };
      return list;
    });
    if (!isEqual(newLists, projectData.lists)) {
      setProjectData({ ...projectData, lists: newLists });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const data = getData(event);
    if (!data) return;
    const { from, to } = data;
    if (from.containerId === to.containerId) return;

    const fromList = projectData.lists.find((l) => l.id === from.containerId);
    const toList = projectData.lists.find((l) => l.id === to.containerId);
    if (!fromList || !toList) return;

    const moveTicket = fromList.tickets.find(
      (t) => t.id === from.items[from.index]
    );
    if (!moveTicket) return;

    const newFromTickets = fromList.tickets.filter(
      (t) => t.id !== moveTicket.id
    );
    const newToTickets = [
      ...toList.tickets.slice(0, to.index),
      moveTicket,
      ...toList.tickets.slice(to.index),
    ];

    const newLists = projectData.lists.map((list) => {
      if (list.id === from.containerId)
        return { ...list, tickets: newFromTickets };
      if (list.id === to.containerId) return { ...list, tickets: newToTickets };
      return list;
    });

    setProjectData({ ...projectData, lists: newLists });
  };

  return { activeId, handleDragStart, handleDragEnd, handleDragOver };
}

function getData(event: { active: Active; over: Over | null }) {
  const { active, over } = event;
  if (!active || !over || active.id === over.id) return;
  const fromData = active.data.current?.sortable;
  const toData = over.data.current?.sortable || {
    containerId: over.id,
    index: NaN,
    items: NaN,
  };
  return fromData ? { from: fromData, to: toData } : undefined;
}
