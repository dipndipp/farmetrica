export function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-start gap-4 border-t border-white/60 pt-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <div className="font-semibold text-slate-900">Farmetrica</div>
      <div className="flex flex-wrap gap-6 text-muted">
        <a href="#" className="transition hover:text-[var(--accent)]">
          About
        </a>
        <a href="#" className="transition hover:text-[var(--accent)]">
          Data Source
        </a>
        <a href="#" className="transition hover:text-[var(--accent)]">
          Contact
        </a>
      </div>
      <p>Powered by Open Data Jawa Timur</p>
    </footer>
  );
}

