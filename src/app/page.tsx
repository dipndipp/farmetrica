import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/components/pages/HomePage";

export default function Home() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-10">
        <Navbar />
        <HomePage />
      </main>
    </div>
  );
}
