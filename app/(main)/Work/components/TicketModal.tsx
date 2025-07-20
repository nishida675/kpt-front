"use client";

import React from "react";
import { ProjectDetail } from "@/app/components/type/ticket";

type TicketModalProps = {
  isOpen: boolean;
  lists: ProjectDetail["lists"];
  selectedListId: string;
  newTicketDesc: string;
  onChangeList: (listId: string) => void;
  onChangeDesc: (desc: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

function TicketModal(props: TicketModalProps) {
  const {
    isOpen,
    lists,
    selectedListId,
    newTicketDesc,
    onChangeList,
    onChangeDesc,
    onClose,
    onCreate,
  } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-[300px]">
        <h2 className="text-lg font-bold mb-2">チケット作成</h2>
        <select
          className="border w-full p-2 mb-2"
          value={selectedListId}
          onChange={(e) => onChangeList(e.target.value)}
        >
          <option value="">リストを選択</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.category}
            </option>
          ))}
        </select>
        <textarea
          className="border w-full p-2 mb-2"
          placeholder="詳細"
          value={newTicketDesc}
          onChange={(e) => onChangeDesc(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose}>キャンセル</button>
          <button onClick={onCreate}>作成</button>
        </div>
      </div>
    </div>
  );
}

export default TicketModal;
