import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AboutPage as AboutPageContent } from "@/components/pages/AboutPage";

export default function AboutPage() {
  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-2 px-6 pb-16 pt-8 lg:px-10">
        <Navbar />
        <div className="flex flex-col text-[var(--foreground)]">
          <AboutPageContent />
        </div>
        <Footer />
      </main>
    </div>
  );
}
