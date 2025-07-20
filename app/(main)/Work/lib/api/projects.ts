// lib/api.ts

import { ProjectDetail } from "@/app/components/type/ticket";

export async function saveProjectData({
  projectData,
  title,
  titleId,
}: {
  projectData: ProjectDetail;
  title: string;
  titleId: string | null;
}) {
  const transformedProjectData = {
    ...projectData,
    lists: projectData.lists.map((list) => ({
      ...list,
      tickets: list.tickets.map((ticket) => ({
        id: ticket.isTemp ? 0 : ticket.id,
        content: ticket.content,
      })),
    })),
  };

  const res = await fetch(`/api/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectData: transformedProjectData,
      title,
      titleId,
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "データの保存に失敗しました");
  }

  return await res.json();
}
