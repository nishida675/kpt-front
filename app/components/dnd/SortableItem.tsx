type Props = {
  content: string;
  ticketId: number;
  listId: string;
  onDelete: (listId: string, ticketId: number) => void;
  deleteMode: boolean;
  onEdit: (listId: string, ticketId: number) => void;
};

export const SortableItem = ({
  content,
  ticketId,
  listId,
  onDelete,
  deleteMode,
  onEdit,
}: Props) => {
  return (
    <div className="relative w-full h-auto p-4 border-2 border-slate-600 rounded bg-white shadow"
    onDoubleClick={() => onEdit(listId, ticketId)}
    >
      {deleteMode && (
        <button
          className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded px-1 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(listId, ticketId);
          }}
        >
          ×
        </button>
      )}
      <div className="text-sm text-gray-600">{content}</div>
    </div>
  );
};
