"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import MessageDialog from "@/app/components/ModalMessage";

type BoardSummary = {
  id: number;
  title: string;
};

const Titles = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [titles, setTitles] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [titleMessage, setTitleMessage] = useState({
    title: "",
    message: "",
    color: false,
  });

  useEffect(() => {
    const title = searchParams.get("title");
    const message = searchParams.get("message");
    const color = searchParams.get("color") === "true";
    const open = searchParams.get("open") === "true";

    if (open && title && message) {
      setTitleMessage({ title, message, color });
      setModalOpen(true);

      // クエリをURLから削除（1回しか呼ばれない）
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleClose = () => setModalOpen(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/boards`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTitles(data);
        } else {
          console.warn("Unexpected data format:", data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, []);

  const deleteTitle = (titleId: number) => {
    fetch(`/api/delete/${titleId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setTitles((prev) => prev.filter((t) => t.id !== titleId));
          setTitleMessage({
            title: "削除成功",
            message: "タイトルが削除されました",
            color: true,
          });
          setModalOpen(true);
        } else {
          console.error("Delete failed");
          setTitleMessage({
            title: "削除失敗",
            message: "タイトルの削除に失敗しました",
            color: false,
          });
          setModalOpen(true);
        }
      })
      .catch(() => {
        setTitleMessage({
          title: "削除エラー",
          message: "タイトルの削除中にエラーが発生しました",
          color: false,
        });
        setModalOpen(true);
      });
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
        title={titleMessage.title}
        message={titleMessage.message}
        color={titleMessage.color}
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
        title={titleMessage.title}
        message={titleMessage.message}
        color={titleMessage.color}
      />
      <div className="p-4 relative min-h-screen">
        <h1 className="text-xl font-bold mb-4">Titles</h1>
        <ul className="grid gap-4">
          {titles.map((board) => (
            <li
              key={board.id}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 flex justify-between items-center"
            >
              <span
                className="cursor-pointer flex-grow"
                onClick={() => router.push(`/Work?id=${board.id}`)}
              >
                {board.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTitle(board.id);
                }}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
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
