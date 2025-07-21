import { Suspense } from "react";
import ClientWork from "./ClientWork";

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <ClientWork />
    </Suspense>
  );
}
