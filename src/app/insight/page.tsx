import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InsightPage } from "@/components/pages/InsightPage";

export default function InsightRoute() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-10">
        <Navbar />
        <InsightPage />
        <Footer />
      </main>
    </div>
  );
}
