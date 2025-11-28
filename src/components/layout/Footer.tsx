import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-12 rounded-3xl bg-gradient-to-br from-emerald-600 via-[#00a86b] to-emerald-700 px-8 py-10 text-white shadow-xl">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <div className="text-2xl font-bold">Farmetrica</div>
            <p className="max-w-md text-sm text-white/80 leading-relaxed">
              Platform visualisasi data pertanian Jawa Timur yang mengubah
              wawasan menjadi data yang jelas dan indah.
            </p>
            <p className="text-xs text-white/70">
              Powered by Open Data Jawa Timur
            </p>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
                Quick Links
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/home"
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/map"
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  Map
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/90">
                Resources
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  About Us
                </Link>
                <Link
                  href="/insight"
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  Insights
                </Link>
                <a
                  href="https://opendata.jatimprov.go.id/dataset/luas-panen-komoditas-utama-tanaman-pangan-di-jawa-timur"
                  className="text-sm text-white/80 transition hover:text-white"
                  target="_blank"
                >
                  Data Source
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-center text-xs text-white/70">
          <p>© 2025 Farmetrica. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
