"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Create = () => {
  const router = useRouter();
  const [title, setTitle] = useState({
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle({
      ...title,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ここで送信処理を行う
    console.log("送信されたデータ:", title);
    router.push(`/Work?title=${encodeURIComponent(title.name)}`);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-6">
        <h1 className="text-2xl font-bold py-2">ワークスペースの作成</h1>
        <label htmlFor="id" className="block text-sm font-medium">
          タイトル
        </label>
        <input
          type="text"
          id="id"
          name="name"
          required
          value={title.name}
          onChange={handleChange}
          className="block mt-2 py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300"
        />
      </div>
      <button
        type="submit"
        className="mt-8 py-2 w-full rounded-md text-white bg-gray-800 hover:bg-gray-700 text-sm font-semibold shadow-sm"
      >
        作成
      </button>
    </form>
  );
};

export default Create;
