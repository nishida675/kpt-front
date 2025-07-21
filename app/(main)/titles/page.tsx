import { Suspense } from "react";
import ClientTitles from "./ClientTitles";

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="p-8">読み込み中...</div>}>
      <ClientTitles />
    </Suspense>
  );
}
