
export async function POST(req: Request) {
  const body = await req.json();

  // Cookie からトークン抽出
  const cookieHeader = req.headers.get("cookie") || "";
  const token = parseTokenFromCookie(cookieHeader);

  if (!token) {
    return new Response(JSON.stringify({ message: "未認証です" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/boards/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const backendData = await backendRes.json();
  console.log("Backend response:", backendData);

  return new Response(JSON.stringify(backendData), {
    status: backendRes.status,
    headers: { "Content-Type": "application/json" },
  });
}

function parseTokenFromCookie(cookie: string): string | null {
  const match = cookie
    .split(";")
    .map(v => v.trim())
    .find(v => v.startsWith("token="));

  return match ? match.slice("token=".length) : null;
}