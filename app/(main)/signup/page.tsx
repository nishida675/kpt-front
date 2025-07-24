"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import MessageDialog from "@/app/components/ModalMessage";

export default function SignUp() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [titleMessage, setTitleMessage] = useState({
    title: "",
    message: "",
    color: false,
  });

  const handleClose = () => setModalOpen(false);

  const handleSignUp = async () => {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/accounts/new`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: displayName, password }),
        }
      );

      if (res.ok) {
        // 登録成功 → トップに遷移
        const query = new URLSearchParams({
          title: "成功",
          message: "アカウント作成に成功しました",
          color: "true",
          open: "true",
        }).toString();
        router.push(`/?${query}`);
      } else {
        const data = await res.json();
        setTitleMessage({
          title: "エラー",
          message: data.message || "アカウント作成に失敗しました",
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
        <h4 className="mt-3 text-1xl font-semibold sm:text-3xl">
          アカウント作成
        </h4>

        <section className="mt-10 w-full max-w-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
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
                name="displayName"
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
                name="password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              アカウント作成
            </button>
          </form>
        </section>

        <section className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <Link href="/" className="text-blue-500 hover:underline">
              トップに戻る
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
