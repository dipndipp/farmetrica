import { Navbar } from "@/components/layout/Navbar";
import { DashboardPage } from "@/components/pages/Dashboard";
import { Footer } from "@/components/layout/Footer";

export default function DashboardRoute() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-10">
      <Navbar />
      <DashboardPage />
      <Footer />
      </main>
    </div>
  );
}
