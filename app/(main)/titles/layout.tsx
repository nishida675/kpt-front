
export default function titlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between w-full h-full min-h-screen">
      <main className="flex-auto w-full max-w-3xl px-4 py-4 mx-auto sm:px-6 md:px-6 md:py-6">
        {children}
      </main>
    </div>
  );
}
