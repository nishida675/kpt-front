"use client";

import React, { useEffect, useState } from "react";
import isEqual from "lodash/isEqual";
import { useSearchParams } from "next/navigation";
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
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sortable } from "@/app/components/dnd/Sortable";
import { SortableItem } from "@/app/components/dnd/SortableItem";
import { useRouter } from "next/navigation";

type Ticket = {
  id: number;
  content: string;
  isTemp?: boolean;
};

type List = {
  id: string;
  category: string;
  tickets: Ticket[];
};

type ProjectDetail = {
  id?: string;
  lists: List[];
};

export const sampleProjectData = {
  id: "1",
  lists: [
    {
      id: "1",
      category: "Keep",
      tickets: [],
    },
    {
      id: "2",
      category: "Problem",
      tickets: [],
    },
    {
      id: "3",
      category: "Try",
      tickets: [],
    },
  ],
};

const Work = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState(
    searchParams.get("title") || "無題のタイトル"
  );
  const titleId = searchParams.get("id");
  const [projectData, setProjectData] =
    useState<ProjectDetail>(sampleProjectData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // モーダルの状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState(""); // モーダル内のリスト選択
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [editTicket, setEditTicket] = useState<{
    listId: string;
    ticketId: number;
    content: string;
  } | null>(null);

  useEffect(() => {
    console.log("プロジェクトデータ:", projectData);
  }, [projectData]);

  // 初期データの取得
  useEffect(() => {
    setIsLoading(true);
    if (!titleId) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/projects/${titleId}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          console.error("取得失敗:", res.status);
          return;
        }

        const data = await res.json();
        setTitle(data.title || "無題のタイトル");
        setProjectData(data.projectData || sampleProjectData);
        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            return;
          }
          console.error("データ取得エラー:", err.message);
        } else {
          console.error("予期しないエラー:", err);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, [titleId]);

  // チケット作成ボタンのハンドラ
  const handleAddTicket = () => {
    if (!selectedListId) return;

    const newTicket = {
      id: Date.now(),
      content: newTicketDesc,
      isTemp: true,
    };

    setProjectData((prev) => {
      const updatedLists = prev.lists.map((list) =>
        list.id === selectedListId
          ? { ...list, tickets: [...list.tickets, newTicket] }
          : list
      );
      return { ...prev, lists: updatedLists };
    });

    // リセット
    setNewTicketDesc("");
    setSelectedListId("");
    setIsModalOpen(false);
  };

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
    if (isEqual(newLists, projectData.lists)) return;
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

  // チケット削除ハンドラ
  const handleDeleteTicket = (listId: string, ticketId: number) => {
    console.log("削除", listId, ticketId);
    setProjectData((prev) => {
      const updatedLists = prev.lists.map((list) => {
        if (list.id === listId) {
          const updatedTickets = list.tickets.filter((t) => t.id !== ticketId);
          return { ...list, tickets: updatedTickets };
        }
        return list;
      });
      return { ...prev, lists: updatedLists };
    });
  };

  // チケット編集ハンドラ
  const handleEditTicket = (listId: string, ticketId: number) => {
    const ticket = projectData.lists
      .find((list) => list.id === listId)
      ?.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setEditTicket({
        listId,
        ticketId,
        content: ticket.content,
      });
    }
  };

  //APIデータ保存処理
  const handleSave = () => {
    const transformedProjectData = {
      ...projectData,
      lists: projectData.lists.map((list) => ({
        ...list,
        tickets: list.tickets.map((ticket) => ({
          id: ticket.isTemp ? 0 : ticket.id,
          content: ticket.content,
        })),
      })),
    };

    fetch(`/api/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectData: transformedProjectData,
        title,
        titleId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            // 失敗: エラー情報を持って /titles に遷移
            const query = new URLSearchParams({
              title: "保存失敗",
              message: data.message || "データの保存に失敗しました",
              color: "false",
              open: "true",
            }).toString();
            router.push(`/titles?${query}`);
            throw new Error("保存失敗");
          });
        }

        // 成功: 正常に遷移
        const query = new URLSearchParams({
          title: "成功",
          message: "保存に成功しました",
          color: "true",
          open: "true",
        }).toString();
        router.push(`/titles?${query}`);
      })
      .catch(() => {
        // この.catchは主に通信エラー対策
        const query = new URLSearchParams({
          title: "保存エラー",
          message: "通信エラーが発生しました",
          color: "false",
          open: "true",
        }).toString();
        router.push(`/titles?${query}`);
      });
  };

  return isLoading ? (
    <div className="flex justify-center items-center h-screen">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  ) : (
    <>
      {/* タイトル & 編集モードボタン */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold border-b-2 border-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => setDeleteMode((prev) => !prev)}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {deleteMode ? "編集モード解除" : "編集モード"}
          </button>
        </div>
      </div>

      {/* DnDエリア */}
      <DndContext
        onDragEnd={handleDragEnd3}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        collisionDetection={customClosestCorners}
        id={projectData.id}
      >
        <div className="w-full overflow-x-auto py-8">
          <div className="flex gap-8 justify-center min-w-fit">
            {projectData.lists.map((list) => (
              <SortableContext
                items={list.tickets.map((ticket) => ticket.id)}
                key={list.id}
                id={list.id}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-[600px] min-w-44 border rounded-xl p-4 bg-white shadow">
                  <h2 className="border-b-4 border-base-content font-semibold">
                    {list.category}
                  </h2>
                  <Droppable key={list.id} id={list.id}>
                    <div className="flex flex-col gap-8 p-4 min-h-[600px] min-w-44">
                      {list.tickets.map((ticket) =>
                        deleteMode ? (
                          <div key={ticket.id}>
                            <SortableItem
                              content={ticket.content}
                              ticketId={ticket.id}
                              listId={list.id}
                              deleteMode={deleteMode}
                              onDelete={handleDeleteTicket}
                              onEdit={handleEditTicket}
                            />
                          </div>
                        ) : (
                          <Sortable key={ticket.id} id={ticket.id}>
                            <SortableItem
                              content={ticket.content}
                              ticketId={ticket.id}
                              listId={list.id}
                              deleteMode={deleteMode}
                              onDelete={handleDeleteTicket}
                              onEdit={handleEditTicket}
                            />
                          </Sortable>
                        )
                      )}
                    </div>
                  </Droppable>
                </div>
              </SortableContext>
            ))}

            {/* DragOverlay */}
            {!deleteMode &&
              activeId &&
              (() => {
                const activeEntry = projectData.lists
                  .flatMap((list) =>
                    list.tickets.map((ticket) => ({
                      ticket,
                      listId: list.id,
                    }))
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
                        onEdit={handleEditTicket}
                      />
                    ) : null}
                  </DragOverlay>
                );
              })()}
          </div>
        </div>
      </DndContext>

      {/* チケット作成ボタン */}
      <div className="px-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          チケット作成
        </button>
      </div>

      {/* 右下固定の保存ボタン */}
      <button
        onClick={() => handleSave()}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        保存
      </button>

      {/* チケット作成モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-bold mb-2">チケット作成</h2>
            <select
              className="border w-full p-2 mb-2"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
            >
              <option value="">リストを選択</option>
              {projectData.lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.category}
                </option>
              ))}
            </select>
            <textarea
              className="border w-full p-2 mb-2"
              placeholder="詳細"
              value={newTicketDesc}
              onChange={(e) => setNewTicketDesc(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsModalOpen(false)}>キャンセル</button>
              <button onClick={handleAddTicket}>作成</button>
            </div>
          </div>
        </div>
      )}

      {/* チケット編集モーダル */}
      {editTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[300px]">
            <h2 className="text-lg font-bold mb-2">チケット編集</h2>
            <textarea
              className="border w-full p-2 mb-2"
              value={editTicket.content}
              onChange={(e) =>
                setEditTicket((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTicket(null)}>キャンセル</button>
              <button
                onClick={() => {
                  setProjectData((prev) => {
                    const updatedLists = prev.lists.map((list) => {
                      if (list.id === editTicket.listId) {
                        const updatedTickets = list.tickets.map((ticket) =>
                          ticket.id === editTicket.ticketId
                            ? { ...ticket, content: editTicket.content }
                            : ticket
                        );
                        return { ...list, tickets: updatedTickets };
                      }
                      return list;
                    });
                    return { ...prev, lists: updatedLists };
                  });
                  setEditTicket(null);
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Work;
