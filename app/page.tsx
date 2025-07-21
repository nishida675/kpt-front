import { Suspense } from "react";
import HomeClient from "./HomeCLient";


export default function Page() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <HomeClient />
    </Suspense>
  );
}
