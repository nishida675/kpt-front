import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function useQueryModal() {
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
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
      setModalInfo({ title, message, color });
      setModalOpen(true);

      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return { modalOpen, setModalOpen, modalInfo, setModalInfo };
}
