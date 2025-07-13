import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ titleId: string }> }
) {
  const params = await context.params;
  const titleId = params.titleId;

  if (!titleId) {
    return NextResponse.json(
      { message: "titleId が不正です" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("token")?.value || null;
  if (!token) {
    return NextResponse.json({ message: "未認証です" }, { status: 401 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/boards/delete/${titleId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "削除に失敗しました" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
