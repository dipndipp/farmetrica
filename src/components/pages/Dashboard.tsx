"use client";

import { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "../layout/Footer";

gsap.registerPlugin(ScrollTrigger);

type Row = {
  id: string;
  nama_kabupaten_kota: string;
  kategori: "PADI" | "JAGUNG" | "KEDELAI" | string;
  jumlah: number;
  tahun: string;
};

const COMMODITY_OPTIONS = ["ALL", "PADI", "JAGUNG", "KEDELAI"] as const;

export function DashboardPage() {
  const appRef = useRef<HTMLDivElement>(null);
  const [rawRows, setRawRows] = useState<Row[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedCommodity, setSelectedCommodity] =
    useState<(typeof COMMODITY_OPTIONS)[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Load CSV from /public/data ---
  useEffect(() => {
    async function loadCsv() {
      try {
        const res = await fetch("/data/dataset-jatim-utf.csv");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          throw new Error("CSV kosong atau tidak valid");
        }

        const header = lines[0].split(",");
        const idxNamaKab = header.indexOf("nama_kabupaten_kota");
        const idxKategori = header.indexOf("kategori");
        const idxJumlah = header.indexOf("jumlah");
        const idxTahun = header.indexOf("tahun");
        const idxId = header.indexOf("id");

        if (
          idxNamaKab === -1 ||
          idxKategori === -1 ||
          idxJumlah === -1 ||
          idxTahun === -1
        ) {
          throw new Error("Kolom penting tidak ditemukan di CSV");
        }

        const parsed: Row[] = lines.slice(1).map((line) => {
          const cols = line.split(",");
          return {
            id: idxId !== -1 ? cols[idxId] : crypto.randomUUID(),
            nama_kabupaten_kota: cols[idxNamaKab],
            kategori: cols[idxKategori] as Row["kategori"],
            jumlah: parseFloat(cols[idxJumlah]) || 0,
            tahun: cols[idxTahun],
          };
        });

        setRawRows(parsed);
        setLoading(false);
      } catch (err) {
        console.error("FAILED TO LOAD CSV", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        setLoading(false);
      }
    }

    loadCsv();
  }, []);

  // --- GSAP basic reveal animation ---
  useEffect(() => {
    if (!appRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-scroll-reveal]")
        .forEach((section) => {
          gsap.from(section, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          });
        });

      gsap.utils.toArray<HTMLElement>(".kpi-card").forEach((card, idx) => {
        gsap.from(card, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          delay: 0.08 * idx,
          ease: "power3.out",
        });
      });
    }, appRef);

    return () => ctx.revert();
  }, [rawRows]);

  // --- Unique years from dataset ---
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    rawRows.forEach((r) => years.add(r.tahun));
    return ["ALL", ...Array.from(years).sort()];
  }, [rawRows]);

  // --- Filtered rows based on UI filter ---
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const matchYear =
        selectedYear === "ALL" ? true : row.tahun === selectedYear;
      const matchCommodity =
        selectedCommodity === "ALL" ? true : row.kategori === selectedCommodity;
      return matchYear && matchCommodity;
    });
  }, [rawRows, selectedYear, selectedCommodity]);

  // --- Aggregations for dashboard metrics ---
  const {
    totalLuasPanen,
    topRegion,
    topCommodity,
    regionRanking,
    commodityDistribution,
  } = useMemo(() => {
    if (filteredRows.length === 0) {
      return {
        totalLuasPanen: 0,
        topRegion: null as { nama: string; total: number } | null,
        topCommodity: null as { nama: string; share: number } | null,
        regionRanking: [] as { nama: string; total: number }[],
        commodityDistribution: [] as { nama: string; total: number }[],
      };
    }

    // total luas panen semua komoditas
    const totalLuasPanen = filteredRows.reduce(
      (acc, row) => acc + row.jumlah,
      0
    );

    // agregasi per kabupaten
    const perRegion = new Map<string, number>();
    filteredRows.forEach((row) => {
      const key = row.nama_kabupaten_kota;
      perRegion.set(key, (perRegion.get(key) ?? 0) + row.jumlah);
    });
    const regionRanking = Array.from(perRegion.entries())
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total);

    const topRegion = regionRanking[0];

    // agregasi per komoditas
    const perCommodity = new Map<string, number>();
    filteredRows.forEach((row) => {
      const key = row.kategori;
      perCommodity.set(key, (perCommodity.get(key) ?? 0) + row.jumlah);
    });
    const commodityDistribution = Array.from(perCommodity.entries())
      .map(([nama, total]) => ({ nama, total }))
      .sort((a, b) => b.total - a.total);

    const topCommodityRaw = commodityDistribution[0];
    const topCommodity = topCommodityRaw
      ? {
          nama: topCommodityRaw.nama,
          share: (topCommodityRaw.total / totalLuasPanen) * 100,
        }
      : null;

    return {
      totalLuasPanen,
      topRegion,
      topCommodity,
      regionRanking,
      commodityDistribution,
    };
  }, [filteredRows]);

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const handleCommodityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCommodity(e.target.value as (typeof COMMODITY_OPTIONS)[number]);
  };

  return (
    <motion.div
      ref={appRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 text-[var(--foreground)]"
    >
      {/* HEADER / TOOLBAR */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#f8faf9] to-[#eef5f1] px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:px-12 lg:py-12"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,168,107,0.06),_transparent_60%)]" />
        </div>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--accent)] shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Farmetrica · Dashboard Hasil Panen
            </div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
              Harvest Explorer
              <span className="block text-3xl lg:text-4xl font-semibold text-slate-700 mt-1">
                Jawa Timur
              </span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 lg:text-lg">
              Pantau distribusi luas panen berdasarkan kabupaten/kota,
              komoditas, dan tahun. Gunakan filter untuk fokus pada pola yang
              ingin kamu analisis dalam konteks probabilitas dan distribusi
              data.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 rounded-2xl bg-white/90 p-5 shadow-lg shadow-slate-500/5 backdrop-blur-md border border-white/50">
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-slate-300"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year === "ALL" ? "Semua Tahun" : year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Komoditas
              </label>
              <select
                value={selectedCommodity}
                onChange={handleCommodityChange}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-slate-300"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "Semua Komoditas" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.section>

      {/* STATE LOADING / ERROR */}
      {loading && (
        <section className="rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-12 text-center shadow-lg border border-slate-100">
          <div className="inline-flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--accent)]" />
            <span className="text-sm font-medium">
              Memuat data panen dari CSV…
            </span>
          </div>
        </section>
      )}
      {error && !loading && (
        <section className="rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 p-12 text-center shadow-lg border border-red-200">
          <p className="text-sm font-medium text-red-700">
            Terjadi kesalahan saat memuat data:{" "}
            <span className="font-semibold">{error}</span>
          </p>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* KPI CARDS */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <div className="kpi-card group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-lg shadow-slate-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-1 border border-slate-100/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Total luas panen
                </p>
                <p className="mt-4 text-4xl font-bold text-slate-900 lg:text-5xl">
                  {totalLuasPanen.toLocaleString("id-ID", {
                    maximumFractionDigits: 0,
                  })}
                  <span className="ml-2 text-xl font-semibold text-slate-500 lg:text-2xl">
                    ha
                  </span>
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400" />
                  <p className="text-xs text-slate-500">
                    Akumulasi semua komoditas
                  </p>
                </div>
              </div>
            </div>

            <div className="kpi-card group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-lg shadow-slate-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-1 border border-slate-100/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Wilayah paling produktif
                </p>
                <p className="mt-4 text-2xl font-bold text-slate-900 lg:text-3xl line-clamp-2">
                  {topRegion ? topRegion.nama : "—"}
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--accent)]">
                  {topRegion
                    ? `${topRegion.total.toLocaleString("id-ID", {
                        maximumFractionDigits: 0,
                      })} ha`
                    : "Belum ada data"}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400" />
                  <p className="text-xs text-slate-500">
                    Berdasarkan total luas panen
                  </p>
                </div>
              </div>
            </div>

            <div className="kpi-card group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-lg shadow-slate-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:-translate-y-1 border border-slate-100/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Komoditas dominan
                </p>
                <p className="mt-4 text-2xl font-bold text-slate-900 lg:text-3xl">
                  {topCommodity ? topCommodity.nama : "—"}
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--accent)]">
                  {topCommodity
                    ? `${topCommodity.share.toFixed(1)}% dari total`
                    : "Belum ada data"}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400" />
                  <p className="text-xs text-slate-500">
                    Distribusi probabilitas
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* REGION RANKING TABLE + DISTRIBUTION CHART */}
          <section
            data-scroll-reveal
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            {/* TABEL TOP WILAYAH */}
            <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg shadow-slate-500/5 border border-slate-100/50">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1.5 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
                    Ranking Wilayah
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Top 5 Kabupaten/Kota
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Berdasarkan luas panen. Angka bisa digunakan sebagai basis
                  frekuensi/proporsi dalam materi distribusi.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
                <table className="min-w-full text-left">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Rank
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Kabupaten/Kota
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Luas panen (ha)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {regionRanking.slice(0, 5).map((row, idx) => (
                      <tr
                        key={row.nama}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent)]/10 to-emerald-100/50 text-sm font-bold text-[var(--accent)]">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                          {row.nama}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                          {row.total.toLocaleString("id-ID", {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                    {regionRanking.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-sm text-slate-500"
                        >
                          Tidak ada data untuk filter saat ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DISTRIBUSI KOMODITAS (PSEUDO CHART) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-[#00a86b] p-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,168,107,0.3),_transparent_70%)]" />
              <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-4 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                      Distribusi Komoditas
                    </p>
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Proporsi Luas Panen
                  </h3>
                  <p className="mt-2 text-sm text-white/70 leading-relaxed">
                    Bisa dibaca sebagai peluang relatif suatu komoditas muncul
                    pada sampel acak dari data luas panen.
                  </p>
                </div>

                <div className="space-y-5">
                  {commodityDistribution.map((c) => {
                    const share =
                      totalLuasPanen === 0
                        ? 0
                        : (c.total / totalLuasPanen) * 100;
                    return (
                      <div key={c.nama} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">
                            {c.nama}
                          </span>
                          <span className="text-xs font-medium text-white/90">
                            {share.toFixed(1)}% ·{" "}
                            {c.total.toLocaleString("id-ID", {
                              maximumFractionDigits: 0,
                            })}{" "}
                            ha
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 shadow-lg shadow-emerald-400/30 transition-all duration-500"
                            style={{ width: `${Math.max(5, share)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {commodityDistribution.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-white/70">
                        Tidak ada data untuk ditampilkan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RAW SAMPLE / DATA PREVIEW */}
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg shadow-slate-500/5 border border-slate-100/50"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)]/10 px-4 py-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
                    Sampel Data
                  </p>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Preview Data
                </h3>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Beberapa baris pertama sesuai filter aktif. Bagian ini berguna
                  untuk menjelaskan struktur data: ada kolom kabupaten,
                  komoditas, tahun, dan jumlah (luas panen).
                </p>
              </div>
              <div className="rounded-xl bg-slate-100/50 px-4 py-2 border border-slate-200/50">
                <p className="text-xs font-medium text-slate-600">
                  Menampilkan{" "}
                  <span className="font-bold text-[var(--accent)]">
                    {Math.min(10, filteredRows.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-900">
                    {filteredRows.length}
                  </span>{" "}
                  baris
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Kabupaten/Kota
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Komoditas
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Luas (ha)
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-600">
                        Tahun
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.slice(0, 10).map((row) => (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                          {row.nama_kabupaten_kota}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {row.kategori}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-900">
                          {row.jumlah.toLocaleString("id-ID", {
                            maximumFractionDigits: 1,
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {row.tahun}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-sm text-slate-500"
                        >
                          Tidak ada data yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.section>
        </>
      )}
    </motion.div>
  );
}
