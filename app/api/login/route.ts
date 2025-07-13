export async function POST(req: Request) {
  const { display_name, password } = await req.json();

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/accounts/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ display_name, password }),
  });

  if (!backendRes.ok) {
    const errorData = await backendRes.json();
    return new Response(JSON.stringify({ message: errorData.message || "ログイン失敗" }), {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { token } = await backendRes.json();
  console.log("取得したトークン:", token);

  // Set-Cookie ヘッダーを自分で作成
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;

  return new Response(JSON.stringify({ message: "ログイン成功" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
