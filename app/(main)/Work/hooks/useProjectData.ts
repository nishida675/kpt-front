import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectDetail } from "@/app/components/type/ticket";
import { sampleProjectData } from "../lib/sampleProjectData";

export function useProjectData() {
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [projectData, setProjectData] =
    useState<ProjectDetail>(sampleProjectData);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get("id");
    const titleParam = searchParams.get("title");

    setTitleId(id);

    if (!id) {
      setTitle(titleParam || "無題のタイトル");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/projects/${id}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title || "無題のタイトル");
        setProjectData(data.projectData || sampleProjectData);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("取得エラー:", err);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [searchParams]); 

  return { title, setTitle, projectData, setProjectData, titleId, isLoading };
}
