"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Row = {
  id: string;
  nama_kabupaten_kota: string;
  kategori: "PADI" | "JAGUNG" | "KEDELAI" | string;
  jumlah: number;
  tahun: string;
};

export function InsightPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [rawRows, setRawRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load CSV
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

  // GSAP animations
  useEffect(() => {
    if (!pageRef.current || loading) return;
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

      gsap.utils.toArray<HTMLElement>(".insight-card").forEach((card, idx) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.1 * idx,
          ease: "power3.out",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading]);

  // Distribusi per Komoditas
  const commodityDistribution = useMemo(() => {
    const map = new Map<string, number>();
    rawRows.forEach((row) => {
      map.set(row.kategori, (map.get(row.kategori) || 0) + row.jumlah);
    });
    const totalAll = Array.from(map.values()).reduce(
      (sum, val) => sum + val,
      0
    );
    return Array.from(map.entries())
      .map(([kategori, total]) => ({
        kategori,
        total,
        percentage: totalAll > 0 ? (total / totalAll) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [rawRows]);

  // Distribusi per Kabupaten/Kota (Top 10)
  const regionDistribution = useMemo(() => {
    const map = new Map<string, number>();
    rawRows.forEach((row) => {
      map.set(
        row.nama_kabupaten_kota,
        (map.get(row.nama_kabupaten_kota) || 0) + row.jumlah
      );
    });
    const totalAll = Array.from(map.values()).reduce(
      (sum, val) => sum + val,
      0
    );
    return Array.from(map.entries())
      .map(([nama, total]) => ({
        nama,
        total,
        percentage: totalAll > 0 ? (total / totalAll) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [rawRows]);

  // Distribusi per Tahun
  const yearDistribution = useMemo(() => {
    const map = new Map<string, number>();
    rawRows.forEach((row) => {
      map.set(row.tahun, (map.get(row.tahun) || 0) + row.jumlah);
    });
    return Array.from(map.entries())
      .map(([tahun, total]) => ({ tahun, total }))
      .sort((a, b) => a.tahun.localeCompare(b.tahun));
  }, [rawRows]);

  // Probabilitas Komoditas
  const commodityProbabilities = useMemo(() => {
    const totalPanen = rawRows.reduce((sum, row) => sum + row.jumlah, 0);
    const map = new Map<string, number>();
    rawRows.forEach((row) => {
      map.set(row.kategori, (map.get(row.kategori) || 0) + row.jumlah);
    });
    return Array.from(map.entries()).map(([kategori, total]) => ({
      kategori,
      probability: (total / totalPanen) * 100,
      total,
    }));
  }, [rawRows]);

  // Simple Moving Average untuk Prediksi 2 tahun ke depan
  const prediction = useMemo(() => {
    if (yearDistribution.length < 2) return null;

    const sortedYears = [...yearDistribution].sort((a, b) =>
      a.tahun.localeCompare(b.tahun)
    );
    const last3Years = sortedYears.slice(-3);
    const sma =
      last3Years.reduce((sum, y) => sum + y.total, 0) / last3Years.length;

    const lastYear = sortedYears[sortedYears.length - 1];
    const secondLastYear = sortedYears[sortedYears.length - 2];
    const trend = lastYear.total > secondLastYear.total ? "naik" : "turun";
    const changePercent =
      ((lastYear.total - secondLastYear.total) / secondLastYear.total) * 100;

    // Prediksi 2 tahun ke depan
    const nextYear1 = String(parseInt(lastYear.tahun) + 1);
    const nextYear2 = String(parseInt(lastYear.tahun) + 2);

    // Prediksi dengan trend adjustment
    const trendFactor = trend === "naik" ? 1.05 : 0.95;
    const predicted1 = sma * trendFactor;
    const predicted2 = predicted1 * trendFactor;

    return {
      predicted1,
      predicted2,
      trend,
      changePercent: Math.abs(changePercent),
      lastYear: lastYear.tahun,
      nextYear1,
      nextYear2,
      historical: sortedYears,
    };
  }, [yearDistribution]);

  // Prediksi: Wilayah Paling Produktif per Tahun (2023-2027)
  const regionProductivityPrediction = useMemo(() => {
    if (!prediction) return null;

    const allYears = [
      ...yearDistribution.map((y) => y.tahun),
      prediction.nextYear1,
      prediction.nextYear2,
    ].sort();

    const result: Array<{
      tahun: string;
      wilayah: string;
      total: number;
      isPredicted: boolean;
    }> = [];

    // Data historis
    yearDistribution.forEach((yearData) => {
      const yearRows = rawRows.filter((r) => r.tahun === yearData.tahun);
      const regionMap = new Map<string, number>();
      yearRows.forEach((row) => {
        regionMap.set(
          row.nama_kabupaten_kota,
          (regionMap.get(row.nama_kabupaten_kota) || 0) + row.jumlah
        );
      });
      const topRegion = Array.from(regionMap.entries()).sort(
        ([, a], [, b]) => b - a
      )[0];
      if (topRegion) {
        result.push({
          tahun: yearData.tahun,
          wilayah: topRegion[0],
          total: topRegion[1],
          isPredicted: false,
        });
      }
    });

    // Prediksi untuk 2 tahun ke depan (menggunakan wilayah teratas dari tahun terakhir)
    const lastYearData = result[result.length - 1];
    if (lastYearData) {
      result.push({
        tahun: prediction.nextYear1,
        wilayah: lastYearData.wilayah,
        total: lastYearData.total * (prediction.trend === "naik" ? 1.05 : 0.95),
        isPredicted: true,
      });
      result.push({
        tahun: prediction.nextYear2,
        wilayah: lastYearData.wilayah,
        total: lastYearData.total * (prediction.trend === "naik" ? 1.1 : 0.9),
        isPredicted: true,
      });
    }

    return result;
  }, [rawRows, yearDistribution, prediction]);

  // Prediksi: Komoditas dengan Panen Terluas per Tahun (2023-2027)
  const commodityTopPrediction = useMemo(() => {
    if (!prediction) return null;

    const result: Array<{
      tahun: string;
      komoditas: string;
      total: number;
      isPredicted: boolean;
    }> = [];

    // Data historis
    yearDistribution.forEach((yearData) => {
      const yearRows = rawRows.filter((r) => r.tahun === yearData.tahun);
      const commodityMap = new Map<string, number>();
      yearRows.forEach((row) => {
        commodityMap.set(
          row.kategori,
          (commodityMap.get(row.kategori) || 0) + row.jumlah
        );
      });
      const topCommodity = Array.from(commodityMap.entries()).sort(
        ([, a], [, b]) => b - a
      )[0];
      if (topCommodity) {
        result.push({
          tahun: yearData.tahun,
          komoditas: topCommodity[0],
          total: topCommodity[1],
          isPredicted: false,
        });
      }
    });

    // Prediksi untuk 2 tahun ke depan
    const lastYearData = result[result.length - 1];
    if (lastYearData) {
      result.push({
        tahun: prediction.nextYear1,
        komoditas: lastYearData.komoditas,
        total: lastYearData.total * (prediction.trend === "naik" ? 1.05 : 0.95),
        isPredicted: true,
      });
      result.push({
        tahun: prediction.nextYear2,
        komoditas: lastYearData.komoditas,
        total: lastYearData.total * (prediction.trend === "naik" ? 1.1 : 0.9),
        isPredicted: true,
      });
    }

    return result;
  }, [rawRows, yearDistribution, prediction]);

  // Prediksi: Perubahan Produktivitas Panen dari Tahun ke Tahun (2023-2027)
  const productivityChangePrediction = useMemo(() => {
    if (!prediction) return null;

    const result: Array<{
      tahun: string;
      total: number;
      change: number;
      changePercent: number;
      isPredicted: boolean;
    }> = [];

    // Data historis
    const sortedYears = [...yearDistribution].sort((a, b) =>
      a.tahun.localeCompare(b.tahun)
    );
    sortedYears.forEach((yearData, idx) => {
      const prevYear = idx > 0 ? sortedYears[idx - 1] : null;
      const change = prevYear ? yearData.total - prevYear.total : 0;
      const changePercent = prevYear ? (change / prevYear.total) * 100 : 0;

      result.push({
        tahun: yearData.tahun,
        total: yearData.total,
        change,
        changePercent,
        isPredicted: false,
      });
    });

    // Prediksi untuk 2 tahun ke depan
    const lastData = result[result.length - 1];
    const predictedChange1 =
      lastData.total * (prediction.trend === "naik" ? 0.05 : -0.05);
    const predictedChange2 =
      (lastData.total + predictedChange1) *
      (prediction.trend === "naik" ? 0.05 : -0.05);

    result.push({
      tahun: prediction.nextYear1,
      total: lastData.total + predictedChange1,
      change: predictedChange1,
      changePercent: (predictedChange1 / lastData.total) * 100,
      isPredicted: true,
    });
    result.push({
      tahun: prediction.nextYear2,
      total: lastData.total + predictedChange1 + predictedChange2,
      change: predictedChange2,
      changePercent:
        (predictedChange2 / (lastData.total + predictedChange1)) * 100,
      isPredicted: true,
    });

    return result;
  }, [yearDistribution, prediction]);

  // Generate Insights
  const insights = useMemo(() => {
    const topCommodity = commodityDistribution[0];
    const topRegion = regionDistribution[0];
    const topProbability = commodityProbabilities.sort(
      (a, b) => b.probability - a.probability
    )[0];

    const totalPanen = rawRows.reduce((sum, row) => sum + row.jumlah, 0);
    const avgPerRegion = totalPanen / regionDistribution.length;

    return {
      topCommodity: topCommodity?.kategori || "N/A",
      topCommodityPercent: topCommodity?.percentage || 0,
      topRegion: topRegion?.nama || "N/A",
      topRegionPercent: topRegion?.percentage || 0,
      topProbability: topProbability?.kategori || "N/A",
      topProbabilityValue: topProbability?.probability || 0,
      avgPerRegion,
      totalPanen,
    };
  }, [
    commodityDistribution,
    regionDistribution,
    commodityProbabilities,
    rawRows,
  ]);

  // Max values for charts
  const maxCommodity = Math.max(...commodityDistribution.map((c) => c.total));
  const maxRegion = Math.max(...regionDistribution.map((r) => r.total));
  const maxYear = Math.max(...yearDistribution.map((y) => y.total));

  if (loading) {
    return (
      <section className="rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-12 text-center shadow-lg border border-slate-100">
        <div className="inline-flex items-center gap-3 text-slate-600">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--accent)]" />
          <span className="text-sm font-medium">Memuat data insight…</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 p-12 text-center shadow-lg border border-red-200">
        <p className="text-sm font-medium text-red-700">
          Terjadi kesalahan: <span className="font-semibold">{error}</span>
        </p>
      </section>
    );
  }

  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 text-[var(--foreground)]"
    >
      {/* Hero Section */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-gradient-to-br from-white via-[#f8faf9] to-[#eef5f1] px-8 py-10 shadow-lg border border-slate-100/50"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--accent)] shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Harvest Insight
          </div>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
            Analisis Statistik
          </h1>
          <p className="text-base leading-relaxed text-slate-600 lg:text-lg max-w-3xl">
            Halaman ini menyajikan analisis mendalam dari data panen Jawa Timur,
            mencakup distribusi data, probabilitas komoditas, dan prediksi
            sederhana menggunakan metode statistik.
          </p>
        </div>
      </motion.section>

      {/* Section 1: Distribusi per Komoditas */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Distribusi per Komoditas
          </h2>
          <p className="text-sm text-slate-600">
            Total luas panen berdasarkan kategori komoditas
          </p>
        </div>

        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="space-y-4">
            {commodityDistribution.map((item) => {
              const barWidth = (item.total / maxCommodity) * 100;
              return (
                <div key={item.kategori} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.kategori}
                    </span>
                    <span className="text-sm text-slate-600">
                      {item.total.toLocaleString("id-ID", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      ha ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-8 overflow-hidden rounded-lg bg-slate-200">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-[var(--accent)] to-emerald-500 transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Insight */}
          <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-200/50">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Insight:</span> Komoditas{" "}
              <span className="font-bold text-[var(--accent)]">
                {insights.topCommodity}
              </span>{" "}
              merupakan komoditas yang paling dominan dengan{" "}
              {insights.topCommodityPercent.toFixed(1)}% dari total luas panen.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Distribusi per Kabupaten/Kota */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Top 10 Kabupaten/Kota
          </h2>
          <p className="text-sm text-slate-600">
            Ranking daerah dengan luas panen terbesar
          </p>
        </div>

        <div className="space-y-4">
          {regionDistribution.map((item, idx) => {
            const barWidth = (item.total / maxRegion) * 100;
            return (
              <div key={item.nama} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--accent)]/10 to-emerald-100/50 text-sm font-bold text-[var(--accent)]">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.nama}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {item.total.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ha
                  </span>
                </div>
                <div className="h-6 overflow-hidden rounded-lg bg-slate-200">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight */}
        <div className="mt-6 rounded-xl bg-emerald-50/50 p-4 border border-emerald-200/50">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Insight:</span>{" "}
            <span className="font-bold text-[var(--accent)]">
              {insights.topRegion}
            </span>{" "}
            merupakan kabupaten/kota paling dominan dengan{" "}
            {insights.topRegionPercent.toFixed(1)}% dari total luas panen.
            Rata-rata per wilayah adalah{" "}
            {insights.avgPerRegion.toLocaleString("id-ID", {
              maximumFractionDigits: 0,
            })}{" "}
            ha.
          </p>
        </div>
      </motion.section>

      {/* Section 3: Distribusi per Tahun */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Distribusi per Tahun
          </h2>
          <p className="text-sm text-slate-600">
            Tren luas panen dari tahun ke tahun
          </p>
        </div>

        {/* Line Chart with Numbers */}
        <div className="relative h-80 mb-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200">
          {/* Set fixed width for SVG to avoid stretch */}
          <svg
            width={600}
            height={240}
            viewBox="0 0 600 240"
            className="w-full h-[240px]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path
              d={`M 0,240 ${yearDistribution
                .map((y, idx) => {
                  const x =
                    yearDistribution.length === 1
                      ? 300
                      : (idx / (yearDistribution.length - 1)) * 540 + 30;
                  return `L ${x},${240 - (y.total / maxYear) * 180}`;
                })
                .join(" ")} L 570,240 Z`}
              fill="url(#lineGradient)"
            />
            {/* Line */}
            <path
              d={`M ${yearDistribution.length === 1 ? 300 : 30},${
                240 - (yearDistribution[0].total / maxYear) * 180
              } ${yearDistribution
                .slice(1)
                .map((y, idx) => {
                  const x =
                    yearDistribution.length === 1
                      ? 300
                      : ((idx + 1) / (yearDistribution.length - 1)) * 540 + 30;
                  return `L ${x},${240 - (y.total / maxYear) * 180}`;
                })
                .join(" ")}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Points with Labels */}
            {yearDistribution.map((y, idx) => {
              const x =
                yearDistribution.length === 1
                  ? 300
                  : (idx / (yearDistribution.length - 1)) * 540 + 30;
              const yPos = 240 - (y.total / maxYear) * 180;
              const value = y.total.toLocaleString("id-ID", {
                maximumFractionDigits: 0,
              });
              // Smaller, lighter label
              const rectWidth = Math.max(28, value.length * 7 + 10);
              const rectHeight = 18;
              return (
                <g key={y.tahun}>
                  <circle
                    cx={x}
                    cy={yPos}
                    r="6"
                    fill="var(--accent)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Value Label with background, smaller and lighter */}
                  <g>
                    <rect
                      x={x - rectWidth / 2}
                      y={yPos - rectHeight - 6}
                      width={rectWidth}
                      height={rectHeight}
                      rx={6}
                      fill="#fff"
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      opacity={0.92}
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.07))",
                      }}
                    />
                    <text
                      x={x}
                      y={yPos - rectHeight / 2 - 1}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={500}
                      fill="#334155"
                      style={{
                        dominantBaseline: "middle",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {value}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
          {/* Year Labels */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-around px-4">
            {yearDistribution.map((y, idx) => {
              const x =
                yearDistribution.length === 1
                  ? 300
                  : (idx / (yearDistribution.length - 1)) * 540 + 30;
              return (
                <span
                  key={y.tahun}
                  className="text-xs text-slate-600 font-semibold"
                  style={{
                    position: "absolute",
                    left: `${(x / 600) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {y.tahun}
                </span>
              );
            })}
          </div>
        </div>

        {/* Insight */}
        <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-200/50">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Insight:</span>{" "}
            {prediction && (
              <>
                Tren menunjukkan{" "}
                <span className="font-bold text-[var(--accent)]">
                  {prediction.trend === "naik" ? "peningkatan" : "penurunan"}
                </span>{" "}
                sebesar {prediction.changePercent.toFixed(1)}% dibanding tahun
                sebelumnya.
              </>
            )}
          </p>
        </div>
      </motion.section>

      {/* Section 4: Probabilitas Komoditas */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Probabilitas Komoditas
          </h2>
          <p className="text-sm text-slate-600">
            Peluang kemunculan komoditas berdasarkan total luas panen
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {commodityProbabilities.map((item) => {
            const colorMap: { [key: string]: string } = {
              PADI: "from-emerald-500 to-green-600",
              JAGUNG: "from-amber-500 to-orange-600",
              KEDELAI: "from-blue-500 to-indigo-600",
            };
            return (
              <div
                key={item.kategori}
                className="insight-card rounded-2xl bg-gradient-to-br p-6 shadow-md border border-slate-100/50"
                style={{
                  background: `linear-gradient(135deg, ${
                    item.kategori === "PADI"
                      ? "#22c55e, #16a34a"
                      : item.kategori === "JAGUNG"
                      ? "#f59e0b, #d97706"
                      : "#3b82f6, #2563eb"
                  })`,
                }}
              >
                <div className="text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-2">
                    P({item.kategori})
                  </p>
                  <p className="text-4xl font-bold mb-1">
                    {item.probability.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/90">
                    {item.total.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ha
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insight */}
        <div className="mt-6 rounded-xl bg-emerald-50/50 p-4 border border-emerald-200/50">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Insight:</span> Komoditas{" "}
            <span className="font-bold text-[var(--accent)]">
              {insights.topProbability}
            </span>{" "}
            memiliki peluang tertinggi dengan probabilitas{" "}
            {insights.topProbabilityValue.toFixed(1)}%. Jika memilih sampel acak
            kabupaten, peluang mendapatkan panen {insights.topProbability}{" "}
            adalah {insights.topProbabilityValue.toFixed(1)}%.
          </p>
        </div>
      </motion.section>

      {/* Section 5: Prediksi Sederhana (2023-2027) */}
      {prediction && (
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-[#00a86b] p-8 text-white shadow-xl"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Prediksi Sederhana (SMA) - 2023-2027
            </h2>
            <p className="text-sm text-white/80">
              Prediksi menggunakan Simple Moving Average 3 tahun terakhir
            </p>
          </div>

          {/* Prediksi Cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
                Prediksi {prediction.nextYear1}
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {prediction.predicted1.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}{" "}
                <span className="text-xl font-normal text-white/80">ha</span>
              </p>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-200 font-medium">
                  Prediksi
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
                Prediksi {prediction.nextYear2}
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {prediction.predicted2.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}{" "}
                <span className="text-xl font-normal text-white/80">ha</span>
              </p>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-400/30">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs text-amber-200 font-medium">
                  Prediksi
                </span>
              </div>
            </div>
          </div>

          {/* Mini Chart with Historical + Predictions */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-6 border border-white/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-4">
              Data Historis & Prediksi (2023-2027)
            </p>
            <div className="space-y-3">
              {prediction.historical.map((y) => (
                <div
                  key={y.tahun}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-white/90 font-medium">
                    {y.tahun}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-40 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/60"
                        style={{
                          width: `${(y.total / maxYear) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-28 text-right">
                      {y.total.toLocaleString("id-ID", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      ha
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90 font-semibold">
                    {prediction.nextYear1}
                  </span>
                  <span className="text-xs text-amber-300 font-medium">
                    (Prediksi)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-40 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${(prediction.predicted1 / maxYear) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-amber-300 w-28 text-right">
                    {prediction.predicted1.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ha
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/90 font-semibold">
                    {prediction.nextYear2}
                  </span>
                  <span className="text-xs text-amber-300 font-medium">
                    (Prediksi)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-40 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${(prediction.predicted2 / maxYear) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-amber-300 w-28 text-right">
                    {prediction.predicted2.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ha
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-amber-500/20 backdrop-blur-sm p-4 border border-amber-400/30">
            <p className="text-xs text-amber-100">
              <span className="font-semibold">⚠️ Catatan:</span> Data tahun{" "}
              {prediction.nextYear1} dan {prediction.nextYear2} merupakan
              prediksi menggunakan metode SMA sederhana. Tidak mencerminkan
              kondisi lapangan secara penuh dan hanya berdasarkan tren historis.
            </p>
          </div>
        </motion.section>
      )}

      {/* Section 6: 3 Variabel Prediksi */}
      {prediction &&
        regionProductivityPrediction &&
        commodityTopPrediction &&
        productivityChangePrediction && (
          <motion.section
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Prediksi Detail (2023-2027)
              </h2>
              <p className="text-sm text-slate-600">
                Tiga variabel prediksi berdasarkan analisis data historis
              </p>
            </div>

            <div className="space-y-6">
              {/* 1. Wilayah Paling Produktif */}
              <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 border border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  1. Wilayah Paling Produktif dalam Panen Komoditas (2023-2027)
                </h3>
                <div className="space-y-3">
                  {regionProductivityPrediction.map((item) => (
                    <div
                      key={item.tahun}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        item.isPredicted
                          ? "bg-amber-50/50 border-amber-200/50"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-900 w-20">
                          {item.tahun}
                        </span>
                        {item.isPredicted && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 font-medium border border-amber-200">
                            Prediksi
                          </span>
                        )}
                        <span className="text-sm font-semibold text-slate-700">
                          {item.wilayah}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          item.isPredicted ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {item.total.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        ha
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Komoditas dengan Panen Terluas */}
              <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 border border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  2. Komoditas dengan Panen Terluas Tiap Tahun (2023-2027)
                </h3>
                <div className="space-y-3">
                  {commodityTopPrediction.map((item) => (
                    <div
                      key={item.tahun}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        item.isPredicted
                          ? "bg-amber-50/50 border-amber-200/50"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-900 w-20">
                          {item.tahun}
                        </span>
                        {item.isPredicted && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 font-medium border border-amber-200">
                            Prediksi
                          </span>
                        )}
                        <span className="text-sm font-semibold text-slate-700">
                          {item.komoditas}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          item.isPredicted ? "text-amber-700" : "text-slate-900"
                        }`}
                      >
                        {item.total.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        ha
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Perubahan Produktivitas */}
              <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 border border-slate-200 shadow-md">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  3. Perubahan Produktivitas Panen dari Tahun ke Tahun
                  (2023-2027)
                </h3>
                <div className="space-y-3">
                  {productivityChangePrediction.map((item, idx) => (
                    <div
                      key={item.tahun}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        item.isPredicted
                          ? "bg-amber-50/50 border-amber-200/50"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-sm font-semibold text-slate-900 w-20">
                          {item.tahun}
                        </span>
                        {item.isPredicted && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-700 font-medium border border-amber-200">
                            Prediksi
                          </span>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-slate-700">
                              Total:{" "}
                              {item.total.toLocaleString("id-ID", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              ha
                            </span>
                            {idx > 0 && (
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded ${
                                  item.change >= 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.change >= 0 ? "+" : ""}
                                {item.changePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {idx > 0 && (
                            <p className="text-xs text-slate-600">
                              Perubahan: {item.change >= 0 ? "+" : ""}
                              {item.change.toLocaleString("id-ID", {
                                maximumFractionDigits: 0,
                              })}{" "}
                              ha dari tahun sebelumnya
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

      {/* Section 7: Kesimpulan Insight */}
      <motion.section
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-8 shadow-lg border border-slate-100/50"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Kesimpulan Insight
          </h2>
          <p className="text-sm text-slate-600">
            Ringkasan analisis dan rekomendasi
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Distribusi Umum
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Berdasarkan analisis data, komoditas{" "}
              <span className="font-semibold text-[var(--accent)]">
                {insights.topCommodity}
              </span>{" "}
              mendominasi dengan {insights.topCommodityPercent.toFixed(1)}% dari
              total luas panen. Wilayah{" "}
              <span className="font-semibold text-[var(--accent)]">
                {insights.topRegion}
              </span>{" "}
              merupakan daerah paling produktif dengan kontribusi{" "}
              {insights.topRegionPercent.toFixed(1)}% dari total.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Probabilitas Dominan
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Komoditas{" "}
              <span className="font-semibold text-[var(--accent)]">
                {insights.topProbability}
              </span>{" "}
              memiliki probabilitas tertinggi (
              {insights.topProbabilityValue.toFixed(1)}%) untuk muncul dalam
              sampel acak. Gap peluang antara komoditas teratas dan terendah
              menunjukkan distribusi yang{" "}
              {insights.topProbabilityValue > 50
                ? "tidak merata"
                : "relatif seimbang"}
              .
            </p>
          </div>

          {prediction && (
            <div className="rounded-xl bg-white p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-3">
                Gambaran Hasil Prediksi
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Prediksi untuk tahun {prediction.nextYear1} menunjukkan total
                luas panen sekitar{" "}
                {typeof prediction.predicted1 === "number" &&
                !isNaN(prediction.predicted1)
                  ? prediction.predicted1.toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })
                  : "—"}{" "}
                ha dengan tren{" "}
                <span className="font-semibold text-[var(--accent)]">
                  {prediction.trend === "naik" ? "peningkatan" : "penurunan"}
                </span>
                . Perubahan ini{" "}
                {prediction.changePercent > 10
                  ? "signifikan"
                  : prediction.changePercent > 5
                  ? "moderat"
                  : "kecil"}{" "}
                dibanding rata-rata historis.
              </p>
            </div>
          )}

          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white p-6 border border-emerald-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              Rekomendasi Data Insight
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>
                  Fokus pengembangan pada komoditas{" "}
                  <span className="font-semibold">{insights.topCommodity}</span>{" "}
                  yang sudah dominan untuk meningkatkan produktivitas lebih
                  lanjut.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>
                  Perlu diversifikasi komoditas di wilayah-wilayah dengan
                  produktivitas rendah untuk mengurangi ketergantungan pada satu
                  komoditas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--accent)] font-bold">•</span>
                <span>
                  {prediction && prediction.trend === "naik"
                    ? "Pertahankan tren positif dengan kebijakan yang mendukung peningkatan luas panen."
                    : "Perlu evaluasi kebijakan untuk mengatasi tren penurunan luas panen."}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
