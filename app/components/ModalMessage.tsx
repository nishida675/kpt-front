import React, { useEffect } from "react";

export type ModalProps = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  title: string;
  message: string;
  color: boolean;
};

const ModalMessage = (props: ModalProps) => {
  const { open, onCancel, onOk, title, message, color } = props;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onCancel();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onCancel]);

  return open ? (
    <div className="fixed inset-0 z-50 flex justify-center items-start mt-20 pointer-events-none">
      <div
        className={`pointer-events-auto w-[320px] sm:w-[400px] p-4 rounded-lg shadow-lg border ${
          color
            ? "bg-green-500 border-green-700 text-white"
            : "bg-red-500 border-red-700 text-white"
        } transition-all`}
      >
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-white text-black text-sm px-4 py-1 rounded hover:bg-gray-200 transition"
            onClick={onOk}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ModalMessage;
