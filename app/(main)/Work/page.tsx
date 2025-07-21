"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TicketModal from "./components/TicketModal";
import TicketEditModal from "./components/TicketEditModal";
import DnDArea from "./components/DnDArea";
import { useProjectData } from "./hooks/useProjectData";
import { useDnDHandlers } from "./hooks/useDnDHandlers";
import { useWorkHandlers } from "./hooks/useWorkHandlers";
import { saveProjectData } from "./lib/api/projects";


const Work = () => {
  const router = useRouter();
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

  // 初期データの取得
  const { title, setTitle, projectData, setProjectData, titleId, isLoading } =
    useProjectData();

  // チケットの追加・編集・削除ハンドラ・チケット作成
  const {
    handleDeleteTicket,
    handleEditTicket,
    handleEditSave,
    handleAddTicket,
  } = useWorkHandlers(projectData, setProjectData, setEditTicket);

  const { activeId, handleDragStart, handleDragEnd, handleDragOver } =
    useDnDHandlers(projectData, setProjectData);

  //APIデータ保存処理
  const handleSave = () => {
    saveProjectData({ projectData, title, titleId })
      .then(() => {
        const query = new URLSearchParams({
          title: "成功",
          message: "保存に成功しました",
          color: "true",
          open: "true",
        }).toString();
        router.push(`/titles?${query}`);
      })
      .catch((err) => {
        const query = new URLSearchParams({
          title: "保存エラー",
          message: err.message,
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
            {deleteMode ? "編集モード" : "移動モード"}
          </button>
        </div>
      </div>
      {/* DnDエリア */}
      <DnDArea
        projectData={projectData}
        deleteMode={deleteMode}
        activeId={activeId}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDelete={handleDeleteTicket}
        onEdit={handleEditTicket}
      />
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
        <TicketModal
          isOpen={isModalOpen}
          lists={projectData.lists}
          selectedListId={selectedListId}
          newTicketDesc={newTicketDesc}
          onChangeList={setSelectedListId}
          onChangeDesc={setNewTicketDesc}
          onClose={() => setIsModalOpen(false)}
          onCreate={() =>
            handleAddTicket(
              selectedListId,
              newTicketDesc,
              setNewTicketDesc,
              setSelectedListId,
              setIsModalOpen
            )
          }
        />
      )}
      {/* チケット編集モーダル */}
      {editTicket && (
        <TicketEditModal
          content={editTicket!.content}
          onChange={(val) =>
            setEditTicket((prev) => (prev ? { ...prev, content: val } : null))
          }
          onCancel={() => setEditTicket(null)}
          onSave={() => handleEditSave(editTicket)}
        />
      )}
    </>
  );
};
export default Work;
