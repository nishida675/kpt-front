import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;

  if (!token) {
    return NextResponse.json({ message: "未認証です" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/boards/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await backendRes.json();
  return NextResponse.json(data); // Content-Type 自動で付く
}
