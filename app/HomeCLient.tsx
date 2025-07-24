"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MessageDialog from "@/app/components/ModalMessage";

type titleMassage = {
  title: string;
  message: string;
  color: boolean;
};
export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [titleMessage, setTitleMessage] = useState<titleMassage>({
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

  // ログインボタンがクリックされたときのハンドラー
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !password) {
      setTitleMessage({
        title: "エラー",
        message: "名前とパスワードを入力してください",
        color: false,
      });
      setModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ display_name: displayName, password }),
      });

      if (res.ok) {
        const query = new URLSearchParams({
          title: "成功",
          message: "ログインに成功しました",
          color: "true",
          open: "true",
        }).toString();
        router.push(`/titles?${query}`);
      } else {
        const data = await res.json();
        setTitleMessage({
          title: "エラー",
          message: data.message || "ログインに失敗しました",
          color: false,
        });
        setModalOpen(true);
      }
    } catch (e) {
      console.error("ログインエラー:", e);
      setTitleMessage({
        title: "エラー",
        message: "通信エラーが発生しました",
        color: false,
      });
      setModalOpen(true);
    }
  };

  return (
    <>
      <MessageDialog
        open={modalOpen}
        onCancel={handleClose}
        onOk={handleClose}
        title={titleMessage.title}
        message={titleMessage.message}
        color={titleMessage.color}
      />
      <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-24">
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl md:text-6xl">
          KPT App
        </h1>
        <h4 className="mt-3 text-1xl font-semibold sm:text-3xl">
          プロジェクトを振り返ろう
        </h4>

        {/* アプリの説明セクション */}
        <section className="mt-6 text-center sm:mt-8 md:mt-10">
          <p className="mt-4 text-base sm:text-lg md:text-xl">
            KPT（Keep・Problem・Try）フレームワークを使って、あなたのプロジェクトを簡単に振り返ることができるアプリです。
            <br />
            チームでも個人でも、改善点や次のアクションを整理して、より良い成果につなげましょう。
          </p>
        </section>
        {/* ログインフォーム */}
        <form onSubmit={handleLogin} className="mt-10 w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Display Name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            ログイン
          </button>
        </form>
        <section className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            アカウントをお持ちでない方は、{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              こちらから登録
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
