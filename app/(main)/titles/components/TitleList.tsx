
import React from "react";

type Props = {
  titles: { id: number; title: string }[];
  onClick: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TitleList({ titles, onClick, onDelete }: Props) {
  return (
    <ul className="grid gap-4">
      {titles.map((board) => (
        <li
          key={board.id}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 flex justify-between items-center"
        >
          <span
            className="cursor-pointer flex-grow"
            onClick={() => onClick(board.id)}
          >
            {board.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(board.id);
            }}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            削除
          </button>
        </li>
      ))}
    </ul>
  );
}
