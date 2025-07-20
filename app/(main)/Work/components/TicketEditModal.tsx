"use client";

type Props = {
  content: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function TicketEditModal({
  content,
  onChange,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-[300px]">
        <h2 className="text-lg font-bold mb-2">チケット編集</h2>
        <textarea
          className="border w-full p-2 mb-2"
          value={content}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel}>キャンセル</button>
          <button onClick={onSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
