"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import type { FeatureCollection } from "geojson";
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

const COMMODITY_OPTIONS = ["ALL", "PADI", "JAGUNG", "KEDELAI"] as const;

type ColorMode = "intensity" | "category";

type RegionData = {
  nama: string;
  totalPanen: number;
  komoditasTerbanyak: string;
  komoditasData: { [key: string]: number };
};

export function MapPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [rawRows, setRawRows] = useState<Row[]>([]);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedCommodity, setSelectedCommodity] =
    useState<(typeof COMMODITY_OPTIONS)[number]>("ALL");
  const [colorMode, setColorMode] = useState<ColorMode>("intensity");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    data: RegionData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [112.6, -7.4], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.2 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.2 }));
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  const handleResetZoom = () => {
    setPosition({ coordinates: [112.6, -7.4], zoom: 1 });
  };

  // Load GeoJSON
  useEffect(() => {
    fetch("/jawa-timur-gadm.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        const jawaTimurFeatures = data.features.filter(
          (feature) => feature.properties?.NAME_1 === "JawaTimur"
        );
        const filteredData: FeatureCollection = {
          type: "FeatureCollection",
          features: jawaTimurFeatures,
        };
        setGeoData(filteredData);
      })
      .catch((err) => console.error("FAILED TO LOAD GEOJSON:", err));
  }, []);

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

  // Filter data
  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const matchYear =
        selectedYear === "ALL" ? true : row.tahun === selectedYear;
      const matchCommodity =
        selectedCommodity === "ALL" ? true : row.kategori === selectedCommodity;
      return matchYear && matchCommodity;
    });
  }, [rawRows, selectedYear, selectedCommodity]);

  // Normalize region name for matching
  const normalizeRegionName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/kabupaten|kota/g, "")
      .trim();
  };

  // Aggregate data by region
  const regionData = useMemo(() => {
    const dataMap = new Map<string, RegionData>();

    filteredRows.forEach((row) => {
      const key = row.nama_kabupaten_kota;
      if (!dataMap.has(key)) {
        dataMap.set(key, {
          nama: key,
          totalPanen: 0,
          komoditasTerbanyak: "",
          komoditasData: {},
        });
      }

      const region = dataMap.get(key)!;
      region.totalPanen += row.jumlah;
      region.komoditasData[row.kategori] =
        (region.komoditasData[row.kategori] || 0) + row.jumlah;
    });

    // Find most common commodity for each region
    dataMap.forEach((region) => {
      let max = 0;
      let maxCommodity = "";
      Object.entries(region.komoditasData).forEach(([commodity, total]) => {
        if (total > max) {
          max = total;
          maxCommodity = commodity;
        }
      });
      region.komoditasTerbanyak = maxCommodity;
    });

    return dataMap;
  }, [filteredRows]);

  // Create mapping from GeoJSON names to CSV names
  const regionNameMap = useMemo(() => {
    const map = new Map<string, string>();
    const csvNames = Array.from(regionData.keys());

    if (geoData) {
      geoData.features.forEach((feature) => {
        const geoName =
          feature.properties?.NAME_2 || feature.properties?.name || "";
        const normalizedGeo = normalizeRegionName(geoName);

        // Try to find matching CSV name
        const matched = csvNames.find((csvName) => {
          const normalizedCsv = normalizeRegionName(csvName);
          return (
            normalizedCsv === normalizedGeo ||
            normalizedCsv.includes(normalizedGeo) ||
            normalizedGeo.includes(normalizedCsv)
          );
        });

        if (matched) {
          map.set(geoName, matched);
        }
      });
    }

    return map;
  }, [geoData, regionData]);

  // GSAP animations
  useEffect(() => {
    if (!pageRef.current || loading || !regionData) return;
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

      gsap.utils.toArray<HTMLElement>(".stat-card").forEach((card, idx) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: 0.1 * idx,
          ease: "power3.out",
        });
      });

      gsap.from(".map-container", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      });
    }, pageRef);

    return () => ctx.revert();
  }, [loading, regionData]);

  // Get data for a region by GeoJSON name
  const getRegionData = (geoName: string): RegionData | null => {
    const csvName = regionNameMap.get(geoName) || geoName;
    return regionData.get(csvName) || null;
  };

  // Calculate color based on mode
  const getRegionColor = (geoName: string): string => {
    const data = getRegionData(geoName);
    if (!data || data.totalPanen === 0) {
      return "#e5e7eb"; // gray for no data
    }

    if (colorMode === "category") {
      const colorMap: { [key: string]: string } = {
        PADI: "#22c55e", // green
        JAGUNG: "#f59e0b", // amber
        KEDELAI: "#3b82f6", // blue
      };
      return colorMap[data.komoditasTerbanyak] || "#6b7280";
    } else {
      // intensity mode - heatmap
      const maxPanen = Math.max(
        ...Array.from(regionData.values()).map((r) => r.totalPanen)
      );
      const intensity = data.totalPanen / maxPanen;

      // Green gradient from light to dark
      if (intensity > 0.7) return "#059669"; // emerald-600
      if (intensity > 0.5) return "#10b981"; // emerald-500
      if (intensity > 0.3) return "#34d399"; // emerald-400
      if (intensity > 0.1) return "#6ee7b7"; // emerald-300
      return "#a7f3d0"; // emerald-200
    }
  };

  // Get year options
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    rawRows.forEach((r) => years.add(r.tahun));
    return ["ALL", ...Array.from(years).sort()];
  }, [rawRows]);

  // Handle map interactions
  const handleRegionMouseEnter = (
    event: React.MouseEvent<SVGPathElement>,
    geoName: string
  ) => {
    const data = getRegionData(geoName);
    if (data) {
      setHoveredRegion(geoName);
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        data,
      });
    }
  };

  const handleRegionMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    if (tooltip) {
      setTooltip({
        ...tooltip,
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleRegionMouseLeave = () => {
    setHoveredRegion(null);
    setTooltip(null);
  };

  const handleRegionClick = (geoName: string) => {
    const data = getRegionData(geoName);
    if (data) {
      setSelectedRegion(data);
    }
  };

  return (
    <motion.div
      ref={pageRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 text-[var(--foreground)]"
    >
      {/* Header */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-gradient-to-br from-white via-[#f8faf9] to-[#eef5f1] px-8 py-8 shadow-lg border border-slate-100/50"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--accent)] shadow-sm backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Interactive Map
            </div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
              Peta Interaktif Jawa Timur
            </h1>
            <p className="text-base leading-relaxed text-slate-600 lg:text-lg">
              Eksplorasi distribusi panen berdasarkan wilayah dengan visualisasi
              interaktif
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 rounded-2xl bg-white/90 p-5 shadow-lg shadow-slate-500/5 backdrop-blur-md border border-white/50">
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Tahun
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
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
                onChange={(e) =>
                  setSelectedCommodity(
                    e.target.value as (typeof COMMODITY_OPTIONS)[number]
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-slate-300"
              >
                {COMMODITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === "ALL" ? "Semua Komoditas" : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[160px]">
              <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Mode Warna
              </label>
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 hover:border-slate-300"
              >
                <option value="intensity">Intensitas (Heatmap)</option>
                <option value="category">Kategori Komoditas</option>
              </select>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Loading / Error */}
      {loading && (
        <section className="rounded-3xl bg-gradient-to-br from-white to-slate-50/50 p-12 text-center shadow-lg border border-slate-100">
          <div className="inline-flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--accent)]" />
            <span className="text-sm font-medium">Memuat data peta…</span>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 p-12 text-center shadow-lg border border-red-200">
          <p className="text-sm font-medium text-red-700">
            Terjadi kesalahan: <span className="font-semibold">{error}</span>
          </p>
        </section>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <section data-scroll-reveal className="grid gap-4 md:grid-cols-3">
            <div className="stat-card rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-md border border-slate-100/50">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Total Wilayah
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {regionData.size}
              </p>
              <p className="text-xs text-slate-600 mt-1">Kabupaten/Kota</p>
            </div>
            <div className="stat-card rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-md border border-slate-100/50">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Total Panen
              </p>
              <p className="text-3xl font-bold text-[var(--accent)]">
                {Array.from(regionData.values())
                  .reduce((sum, r) => sum + r.totalPanen, 0)
                  .toLocaleString("id-ID", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-slate-600 mt-1">Hektar</p>
            </div>
            <div className="stat-card rounded-2xl bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-md border border-slate-100/50">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Rata-rata per Wilayah
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {regionData.size > 0
                  ? (
                      Array.from(regionData.values()).reduce(
                        (sum, r) => sum + r.totalPanen,
                        0
                      ) / regionData.size
                    ).toLocaleString("id-ID", { maximumFractionDigits: 0 })
                  : 0}
              </p>
              <p className="text-xs text-slate-600 mt-1">Hektar</p>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Map */}
            <section
              data-scroll-reveal
              className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-4 lg:p-6 shadow-lg border border-slate-100/50"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Peta Interaktif
                </h2>
                <p className="text-sm text-slate-600">
                  Hover untuk melihat detail, klik untuk informasi lengkap
                </p>
              </div>
              <div className="map-container relative h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-white border border-slate-200">
                {geoData && (
                  <>
                    <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 5000, center: [112.6, -7.4] }}
                    width={800}
                    height={600}
                    className="h-full w-full"
                  >
                    <ZoomableGroup
                      zoom={position.zoom}
                      center={position.coordinates as [number, number]}
                      onMoveEnd={handleMoveEnd}
                      maxZoom={4}
                    >
                      <Geographies geography={geoData}>
                        {({
                          geographies,
                        }: {
                          geographies: Array<{
                            rsmKey: string;
                            properties?: { NAME_2?: string; name?: string };
                          }>;
                        }) =>
                          geographies.map(
                            (geo: {
                              rsmKey: string;
                              properties?: { NAME_2?: string; name?: string };
                            }) => {
                              const geoName =
                                geo.properties?.NAME_2 ??
                                geo.properties?.name ??
                                "";
                              const isHovered = hoveredRegion === geoName;
                              const fillColor = getRegionColor(geoName);

                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  onMouseEnter={(
                                    e: React.MouseEvent<SVGPathElement>
                                  ) => handleRegionMouseEnter(e, geoName)}
                                  onMouseMove={(
                                    e: React.MouseEvent<SVGPathElement>
                                  ) => handleRegionMouseMove(e)}
                                  onMouseLeave={handleRegionMouseLeave}
                                  onClick={() => handleRegionClick(geoName)}
                                  style={{
                                    default: {
                                      fill: fillColor,
                                      outline: "none",
                                      stroke: isHovered ? "#0f172a" : "#94a3b8",
                                      strokeWidth: isHovered ? 2 : 1,
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    },
                                    hover: {
                                      fill: fillColor,
                                      outline: "none",
                                      stroke: "#0f172a",
                                      strokeWidth: 2,
                                      cursor: "pointer",
                                    },
                                    pressed: {
                                      fill: fillColor,
                                      outline: "none",
                                      stroke: "#0f172a",
                                      strokeWidth: 2,
                                    },
                                  }}
                                />
                              );
                            }
                          )
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                  
                  {/* Zoom Controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={handleZoomIn}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50 hover:text-[var(--accent)] transition-colors"
                      title="Zoom In"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50 hover:text-[var(--accent)] transition-colors"
                      title="Zoom Out"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50 hover:text-[var(--accent)] transition-colors"
                      title="Reset Zoom"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                        />
                      </svg>
                    </button>
                  </div>
                  </>
                )}
              </div>
            </section>

            {/* Info Panel & Legend */}
            <motion.aside
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6 lg:space-y-6"
            >
              {/* Legend */}
              <section className="rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-4 lg:p-6 shadow-lg border border-slate-100/50">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Legenda
                </h3>
                {colorMode === "intensity" ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Intensitas Panen
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Sangat Tinggi", color: "#059669" },
                        { label: "Tinggi", color: "#10b981" },
                        { label: "Sedang", color: "#34d399" },
                        { label: "Rendah", color: "#6ee7b7" },
                        { label: "Sangat Rendah", color: "#a7f3d0" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="h-4 w-4 rounded border border-slate-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-700">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Kategori Komoditas
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: "Padi", color: "#22c55e" },
                        { label: "Jagung", color: "#f59e0b" },
                        { label: "Kedelai", color: "#3b82f6" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="h-4 w-4 rounded border border-slate-300"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-700">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Selected Region Info */}
              {selectedRegion && (
                <section className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg border border-emerald-200/50">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      Detail Wilayah
                    </h3>
                    <button
                      onClick={() => setSelectedRegion(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        {selectedRegion.nama}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                        Total Panen
                      </p>
                      <p className="text-2xl font-bold text-[var(--accent)]">
                        {selectedRegion.totalPanen.toLocaleString("id-ID", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        <span className="text-base font-normal text-slate-600">
                          ha
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">
                        Komoditas Terbanyak
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {selectedRegion.komoditasTerbanyak}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                        Distribusi Komoditas
                      </p>
                      <div className="space-y-2">
                        {Object.entries(selectedRegion.komoditasData)
                          .sort(([, a], [, b]) => b - a)
                          .map(([commodity, total]) => {
                            const percentage =
                              (total / selectedRegion.totalPanen) * 100;
                            return (
                              <div key={commodity} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-slate-700">
                                    {commodity}
                                  </span>
                                  <span className="text-slate-600">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                  <div
                                    className="h-full rounded-full bg-[var(--accent)]"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </motion.aside>
          </div>
        </>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl bg-slate-900/95 backdrop-blur-sm text-white p-3 shadow-2xl border border-slate-700 max-w-[240px]"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`,
          }}
        >
          <p className="font-semibold text-sm mb-2 text-white">
            {tooltip.data.nama}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-white/90">
              Total:{" "}
              <span className="font-semibold">
                {tooltip.data.totalPanen.toLocaleString("id-ID", {
                  maximumFractionDigits: 0,
                })}{" "}
                ha
              </span>
            </p>
            <p className="text-xs text-white/90">
              Komoditas:{" "}
              <span className="font-semibold">
                {tooltip.data.komoditasTerbanyak}
              </span>
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
