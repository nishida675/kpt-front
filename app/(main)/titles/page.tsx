"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageDialog from "@/app/components/ModalMessage";
import { fetchBoards, deleteBoard } from "./lib/api/boards";
import TitleList from "./components/TitleList";
import { useQueryModal } from "./hooks/useQueryModal";

type BoardSummary = {
  id: number;
  title: string;
};

const Titles = () => {
  const router = useRouter();
  const [titles, setTitles] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { modalOpen, setModalOpen, modalInfo, setModalInfo } = useQueryModal();

  const handleClose = () => setModalOpen(false);

  useEffect(() => {
    const loadBoards = async () => {
      setIsLoading(true);
      try {
        const data = await fetchBoards();
        setTitles(data);
      } catch (err) {
        console.error("データ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBoards();
  }, []);

  const deleteTitle = async (titleId: number) => {
    try {
      await deleteBoard(titleId);
      setTitles((prev) => prev.filter((t) => t.id !== titleId));
      setModalInfo({
        title: "削除成功",
        message: "タイトルが削除されました",
        color: true,
      });
    } catch (err) {
      console.error("削除失敗:", err);
      setModalInfo({
        title: "削除失敗",
        message: "タイトルの削除に失敗しました",
        color: false,
      });
    } finally {
      setModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return titles.length === 0 ? (
    <>
      <MessageDialog
        open={modalOpen}
        onCancel={handleClose}
        onOk={handleClose}
        title={modalInfo.title}
        message={modalInfo.message}
        color={modalInfo.color}
      />
      <div className="p-4 relative min-h-screen">
        <h1 className="text-xl font-bold mb-4">Titles</h1>
        <p className="text-gray-500 mb-4">
          タイトルがありません。新規作成してください。
        </p>
        <button
          onClick={() => {
            router.push("/Create");
          }}
          className="block mx-auto cursor-pointer bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>
    </>
  ) : (
    <>
      <MessageDialog
        open={modalOpen}
        onCancel={handleClose}
        onOk={handleClose}
        title={modalInfo.title}
        message={modalInfo.message}
        color={modalInfo.color}
      />
      <div className="p-4 relative min-h-screen">
        <h1 className="text-xl font-bold mb-4">Titles</h1>
        <TitleList
          titles={titles}
          onClick={(id) => router.push(`/Work?id=${id}`)}
          onDelete={deleteTitle}
        />
        <button
          onClick={() => {
            router.push("/Create");
          }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          新規作成
        </button>
      </div>
    </>
  );
};
export default Titles;
