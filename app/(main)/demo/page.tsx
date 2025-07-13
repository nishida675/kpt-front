"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
  CollisionDetection,
  closestCorners,
  Active,
  Over,
  DragOverlay,
} from "@dnd-kit/core";

import Droppable from "@/app/components/dnd/Droppable";
import Draggable from "@/app/components/dnd/Draggable";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sortable } from "@/app/components/dnd/Sortable";
import { SortableItem } from "@/app/components/dnd/SortableItem";

type Ticket = {
  id: string;
  title: string;
  description: string;
};

type List = {
  id: string;
  title: string;
  tickets: Ticket[];
};

type ProjectDetail = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  lists: List[];
};

export const sampleProjectData = {
  id: "PJ1",
  name: "Project 1",
  description: "This is project 1",
  image_url: "",
  lists: [
    {
      id: "L1",
      title: "List 1",
      tickets: [
        { id: "T1", title: "Ticket 1", description: "This is ticket 1" },
        { id: "T2", title: "Ticket 2", description: "This is ticket 2" },
        { id: "T3", title: "Ticket 3", description: "This is ticket 3" },
      ],
    },
    {
      id: "L2",
      title: "List 2",
      tickets: [
        { id: "T4", title: "Ticket 4", description: "This is ticket 4" },
        { id: "T5", title: "Ticket 5", description: "This is ticket 5" },
        { id: "T6", title: "Ticket 6", description: "This is ticket 6" },
      ],
    },
    {
      id: "L3",
      title: "List 3",
      tickets: [
        { id: "T7", title: "Ticket 7", description: "This is ticket 7" },
        { id: "T8", title: "Ticket 8", description: "This is ticket 8" },
        { id: "T9", title: "Ticket 9", description: "This is ticket 9" },
      ],
    },
    {
      id: "L4",
      title: "List 4",
      tickets: [],
    },
  ],
};

const Work = () => {
  const containers = ["A", "B", "C"];
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);
  const [items, setItems] = useState({
    id: "list-sample",
    title: "List Sample",
    cards: [
      { id: "card-1", title: "Card 1" },
      { id: "card-2", title: "Card 2" },
      { id: "card-3", title: "Card 3" },
    ],
  });
  const [projectData, setProjectData] =
    useState<ProjectDetail>(sampleProjectData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    setParent(over ? over.id : null);
  }

  function handleDragEnd2(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;
    const oldSortable = active.data.current?.sortable;
    const newSortable = over.data.current?.sortable;
    if (!oldSortable || !newSortable) return;

    setItems({
      ...items,
      cards: arrayMove(items.cards, oldSortable.index, newSortable.index),
    });
  }

  //移動しようとしているリスト以外のチケットアイテムは除外
  const customClosestCorners: CollisionDetection = (args) => {
    const cornerCollisions = closestCorners(args);
    // 一番近いリストのコンテナを取得
    const listIds = new Set(projectData.lists.map((list) => list.id));
    const closestContainer = cornerCollisions.find((c) => {
      return listIds.has(c.id.toString());
    });
    if (!closestContainer) return cornerCollisions;
    // closestContainerの中のチケットのみを取得
    const collisions = cornerCollisions.filter(({ data }) => {
      if (!data) return false;
      const droppableData = data.droppableContainer?.data?.current;
      if (!droppableData) return false;
      const { containerId } = droppableData.sortable;
      return closestContainer.id === containerId;
    });
    // 中身のチケットがない場合は、closestContainerを返す
    if (collisions.length === 0) {
      return [closestContainer];
    }
    // 中身のチケットがある場合は、collisionsを返す
    return collisions;
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (!active) return;
    setActiveId(active.id);
  }

  function handleDragEnd3(event: DragEndEvent) {
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
    setProjectData({ ...projectData, lists: newLists });
  }

  function getData(event: { active: Active; over: Over | null }) {
    const { active, over } = event;
    // キャンセルされた、もしくはターゲットがない場合はリターン
    if (!active || !over) return;
    // ドラッグアイテムとターゲットが同じ場合はリターン
    if (active.id === over.id) return;
    // activeのデータを取得
    const fromData = active.data.current?.sortable;
    if (!fromData) return;
    // overのデータを取得
    const toData = over.data.current?.sortable;
    const toDataNotSortable = {
      containerId: over.id,
      index: NaN,
      items: NaN,
    };
    // データを返す
    return {
      from: fromData,
      to: toData ?? toDataNotSortable,
    };
  }

  function handleDragOver(event: DragOverEvent) {
    const data = getData(event);
    if (!data) return;
    const { from, to } = data;
    if (from.containerId === to.containerId) return;
    const fromList = projectData.lists.find(
      (list) => list.id == from.containerId
    );
    const toList = projectData.lists.find((list) => list.id == to.containerId);
    if (!fromList || !toList) return;
    const moveTicket = fromList.tickets.find(
      (ticket) => ticket.id === from.items[from.index]
    );
    if (!moveTicket) return;
    const newFromTickets = fromList.tickets.filter(
      (ticket) => ticket.id !== moveTicket.id
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
  }

  const draggableMarkup = (
    <Draggable id="draggable">
      <div className="cursor-grab w-48 h-20 bg-blue-200 flex justify-center items-center">
        Drag me
      </div>
    </Draggable>
  );

  return (
    <div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col justify-center items-center w-screen h-screen gap-8">
          {/* ドラッグ可能な要素 */}
          <div className="flex h-20">
            {parent === null ? draggableMarkup : null}
          </div>
          {/* ドロップ可能な領域 */}
          <div className="flex">
            {containers.map((id) => (
              <Droppable key={id} id={id} isOverAddClass="bg-green-700">
                <div className="w-52 h-24 border-2 border-dashed border-gray-100/50 flex justify-center items-center">
                  {parent === id ? draggableMarkup : "Drop here"}
                </div>
              </Droppable>
            ))}
          </div>
        </div>
      </DndContext>
      <br />
      <div className="flex justify-center items-center w-screen h-screen">
        <DndContext onDragEnd={handleDragEnd2} id={items.id}>
          <SortableContext items={items.cards} key={items.id} id={items.id}>
            <div className="flex flex-col gap-4 border w-44 p-4">
              {items.cards.map((card) => (
                <Sortable key={card.id} id={card.id}>
                  <SortableItem itemId={card.id} />
                </Sortable>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <br />
      <DndContext
        onDragEnd={handleDragEnd3}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        collisionDetection={customClosestCorners}
        id={projectData.id}
      >
        <div className="flex justify-center items-center w-screen h-screen gap-8">
          {projectData.lists.map((list) => (
            <SortableContext
              items={list.tickets}
              key={list.id}
              id={list.id}
              strategy={verticalListSortingStrategy}
            >
              <Droppable key={list.id} id={list.id}>
                <div className="flex flex-col gap-8 p-4 border min-h-[600px] min-w-44">
                  {list.tickets.map((ticket) => (
                    <Sortable key={ticket.id} id={ticket.id}>
                      <SortableItem itemId={ticket.id} />
                    </Sortable>
                  ))}
                </div>
              </Droppable>
            </SortableContext>
          ))}
          {activeId && (
            <DragOverlay>
              <SortableItem itemId={activeId} />
            </DragOverlay>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default Work;
