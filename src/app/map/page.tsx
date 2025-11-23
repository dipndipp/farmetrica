import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MapPage } from "@/components/pages/MapPage";

export default function MapRoute() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-8 lg:px-10">
        <Navbar />
        <MapPage />
        <Footer />
      </main>
    </div>
  );
}
