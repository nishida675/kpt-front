
export async function fetchBoards() {
  const res = await fetch("/api/boards", {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("データ取得に失敗しました");
  return await res.json();
}

export async function deleteBoard(id: number) {
  const res = await fetch(`/api/delete/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("削除に失敗しました");
}
