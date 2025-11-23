// [INFO] This file is now unused. Please use src/app/page.tsx for the homepage route.
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FeatureCollection } from "geojson";

const floatingPanels = [
  {
    title: "Komoditas Teratas",
    body: "Padi • Jagung • Kopi",
    change: "+8.2% QoQ",
  },
  {
    title: "Wilayah Paling Produktif",
    body: "Malang, Banyuwangi, Tuban",
    change: "92k ha",
  },
  {
    title: "Distribusi Panen",
    body: "2023 – 2025",
    change: "Seimbang",
  },
];

const featureHighlights = [
  {
    label: "Wilayah Paling Produktif",
    copy: "Ranking dinamis berdasarkan produktivitas panen.",
  },
  {
    label: "Komoditas Terbesar Tiap Tahun",
    copy: "Bandingkan pergeseran komoditas unggulan.",
  },
  {
    label: "Tren Panen 2023–2025",
    copy: "Garis waktu interaktif dengan anomali yang ditandai.",
  },
  {
    label: "Prediksi Musim Panen Berikutnya",
    copy: "Model prediktif berbasis cuaca + lahan.",
  },
];

const visualizationMocks = [
  { type: "line", title: "Laju Produktivitas" },
  { type: "bars", title: "Distribusi Panen" },
  { type: "box", title: "Variabilitas Harga" },
];

const stats = [
  { label: "Wilayah dianalisis", value: 38 },
  { label: "Komoditas utama", value: 3 },
  { label: "Data historis", value: 3000 },
];

gsap.registerPlugin(ScrollTrigger);

export function HomePage() {
  const appRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/jawa-timur-gadm.geojson")
      .then((res) => res.json())
      .then((data: FeatureCollection) => {
        // Filter for Jawa Timur (East Java) - NAME_1 is "JawaTimur" (no space)
        const jawaTimurFeatures = data.features.filter(
          (feature) => feature.properties?.NAME_1 === "JawaTimur"
        );
        const filteredData: FeatureCollection = {
          type: "FeatureCollection",
          features: jawaTimurFeatures,
        };
        console.log("GEOJSON LOADED:", filteredData);
        setGeoData(filteredData);
      })
      .catch((err) => console.error("FAILED TO LOAD GEOJSON:", err));
  }, []);

  useEffect(() => {
    if (!appRef.current) return;
    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .from(".hero-headline", { y: 60, opacity: 0, duration: 0.9 })
        .from(
          ".hero-subheadline",
          { y: 30, opacity: 0, duration: 0.6 },
          "-=0.4"
        )
        .from(".hero-cta", { y: 30, opacity: 0, duration: 0.6 }, "-=0.3");

      gsap.utils.toArray<HTMLElement>(".floating-card").forEach((card, idx) => {
        gsap.from(card, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.2 * idx + 0.6,
          ease: "power3.out",
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-scroll-reveal]")
        .forEach((section) => {
          gsap.from(section, {
            y: 70,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          });
        });

      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((stat) => {
        const target = Number(stat.dataset.target ?? 0);
        const valueElem = stat.querySelector("span");
        if (!valueElem) return;
        gsap.fromTo(
          valueElem,
          { textContent: 0 },
          {
            textContent: target,
            duration: 1.4,
            ease: "power1.out",
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: stat,
              start: "top 80%",
            },
          }
        );
      });
    }, appRef);

    return () => ctx.revert();
  }, []);

  // Animate map regions only after geoData is loaded
  useEffect(() => {
    if (!geoData || !appRef.current) return;
    const mapRegions = appRef.current.querySelectorAll(".map-region");
    if (mapRegions.length > 0) {
      gsap.from(".map-region", {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        delay: 0.4,
      });
    }
  }, [geoData]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
      setParallax({ x, y });
    },
    []
  );

  return (
    <div ref={appRef} className="flex flex-col gap-20 text-[var(--foreground)]">
      <section
        onPointerMove={handlePointerMove}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-[#eef5f1] px-6 py-14 shadow-[0_40px_120px_rgba(15,23,42,0.18)] lg:px-14"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,168,107,0.08),_transparent_55%)]" />
        </div>
        <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Farmetrica · Jawa Timur
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              </p>
              <h1 className="hero-headline text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
                Mengubah Wawasan Pertanian Jawa Timur Menjadi Data yang Jelas
                dan Indah.
              </h1>
              <p className="hero-subheadline max-w-2xl text-lg text-muted lg:text-xl">
                Farmetrica merangkum dinamika panen Jawa Timur menjadi dashboard
                yang rapi, interaktif, dan siap mengungkap cerita di balik
                angka.
              </p>
            </div>
            <div className="hero-cta flex flex-wrap gap-4">
              <a href="/dashboard">
                <button className="cta-button rounded-full bg-[var(--accent)] px-8 py-3 text-base font-medium text-white shadow-lg shadow-[rgba(0,168,107,0.25)]">
                  Buka Dashboard
                </button>
              </a>
              <a href="/map">
                {" "}
                <button className="cta-button rounded-full border border-[var(--neutral)] px-8 py-3 text-base font-medium text-slate-900">
                  Lihat Peta
                </button>
              </a>
            </div>
          </div>
          <div
            className="relative h-[420px] rounded-3xl bg-white/80 p-6 backdrop-blur parallax-layer soft-shadow"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            }}
          >
            <div className="absolute inset-0 rounded-3xl border border-white/60" />
            <div className="map-glow h-full rounded-2xl bg-gradient-to-b from-[#e7f6ee] to-white p-4">
              {geoData && (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 5000, center: [112.6, -7.4] }}
                  width={420}
                  height={360}
                  className="h-full w-full"
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
                        }) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            className="map-region"
                            onMouseEnter={() =>
                              setHoveredRegion(
                                geo.properties?.NAME_2 ??
                                  geo.properties?.name ??
                                  null
                              )
                            }
                            onMouseLeave={() => setHoveredRegion(null)}
                            style={{
                              default: {
                                fill:
                                  hoveredRegion ===
                                  (geo.properties?.NAME_2 ??
                                    geo.properties?.name)
                                    ? "#00a86b"
                                    : "#cdeedf",
                                outline: "none",
                                stroke: "#7dd0b1",
                                strokeWidth: 1,
                              },
                              hover: {
                                fill: "#00a86b",
                                cursor: "pointer",
                              },
                              pressed: {
                                fill: "#04925c",
                              },
                            }}
                          />
                        )
                      )
                    }
                  </Geographies>
                </ComposableMap>
              )}
            </div>
            <div className="pointer-events-none absolute inset-0">
              {floatingPanels.map((panel, idx) => {
                // Custom positioning to avoid blocking the map
                let positionStyle: React.CSSProperties = {};
                if (idx === 0) {
                  // Top Commodities - top right
                  positionStyle = { top: "5%", right: "-2rem" };
                } else if (idx === 1) {
                  // Most Productive Regions - bottom left (moved down to avoid center)
                  positionStyle = { bottom: "10%", left: "-2rem" };
                } else {
                  // Harvest Distribution - bottom right
                  positionStyle = { bottom: "5%", right: "-2rem" };
                }
                return (
                  <div
                    key={panel.title}
                    className="floating-card absolute w-48 rounded-2xl bg-white/80 p-4 text-sm text-slate-900 shadow-2xl shadow-slate-500/20 backdrop-blur"
                    style={positionStyle}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {panel.title}
                    </p>
                    <p className="mt-2 text-base font-semibold">{panel.body}</p>
                    <p className="mt-1 text-xs text-[var(--accent)]">
                      {panel.change}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-8">
          {stats.map((item) => (
            <div
              key={item.label}
              data-stat
              data-target={item.value}
              className="space-y-1"
            >
              <span className="text-4xl font-semibold tracking-tight">0</span>
              <p className="text-sm uppercase tracking-[0.3em] text-muted">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        data-scroll-reveal
        className="problem-section grid gap-10 rounded-3xl bg-white/90 p-10 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[var(--accent)]">
            Pernyataan Masalah
          </p>
          <h2 className="text-3xl font-semibold leading-snug">
            Memahami Distribusi Panen Belum Pernah Sejelas Ini.
          </h2>
          <p className="text-lg text-muted">
            Farmetrica menggabungkan data satelit, laporan panen, serta sensor
            mikroklimat untuk menunjukkan bagaimana panen bergerak antar
            wilayah, lintas komoditas, dan dari musim ke musim.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[var(--neutral)] p-4 text-center"
              >
                <p className="text-3xl font-semibold text-slate-900">
                  {item.value}+
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#052f23] to-[#00a86b] p-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_45%)]" />
          <div className="relative space-y-6">
            <p className="text-sm tracking-[0.35em] uppercase text-white/70">
              Infografis Mini
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>Siklus Panen</span>
                <span className="text-lg font-semibold">91 hari</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <span>Kelembaban Optimal</span>
                <span className="text-lg font-semibold">68%</span>
              </div>
              <div className="rounded-3xl bg-white/15 p-5">
                <p className="text-xs uppercase tracking-[0.4em] text-white/80">
                  Ramalan 2025
                </p>
                <div className="mt-4 h-24 w-full">
                  <svg
                    viewBox="0 0 220 80"
                    className="h-full w-full text-white"
                  >
                    <defs>
                      <linearGradient id="forecast" x1="0%" x2="100%">
                        <stop offset="0%" stopColor="#bbf7d0" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,60 C40,20 80,35 110,25 C140,15 180,40 220,10"
                      fill="none"
                      stroke="url(#forecast)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="110" cy="25" r="5" fill="#ffffff" />
                    <circle cx="180" cy="40" r="5" fill="#bbf7d0" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-scroll-reveal className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
              Pratinjau Fitur
            </p>
            <h3 className="mt-2 text-3xl font-semibold">
              Dari gambaran makro hingga wawasan mikro.
            </h3>
          </div>
          <p className="text-sm text-muted">
            Geser ke samping untuk menjelajahi
          </p>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {featureHighlights.map((feature) => (
            <div
              key={feature.label}
              className="min-w-[260px] flex-1 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-lg shadow-slate-500/10 backdrop-blur transition hover:-translate-y-1 hover:border-[var(--accent)] hover:bg-white"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-[var(--accent)]">
                {feature.label}
              </p>
              <p className="mt-4 text-base text-muted">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        data-scroll-reveal
        className="rounded-3xl bg-white/90 p-10 shadow-xl shadow-slate-500/10"
      >
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent)]">
            Pameran Visualisasi
          </p>
          <h3 className="text-3xl font-semibold">
            Visualisasi mini, kejelasan maksimal.
          </h3>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {visualizationMocks.map((chart) => (
            <div
              key={chart.title}
              className="rounded-3xl border border-[var(--neutral)] bg-gradient-to-br from-white to-[#f7faf8] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-sm font-semibold text-slate-700">
                {chart.title}
              </p>
              <div className="mt-6 h-32">
                {chart.type === "line" && (
                  <svg
                    viewBox="0 0 180 100"
                    className="h-full w-full text-[var(--accent)]"
                  >
                    <path
                      d="M0,80 C30,50 55,70 80,40 C105,10 140,30 180,10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="80"
                      cy="40"
                      r="5"
                      fill="#0f172a"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                {chart.type === "bars" && (
                  <svg viewBox="0 0 180 100" className="h-full w-full">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <rect
                        key={idx}
                        x={idx * 25 + 10}
                        y={100 - (idx % 3) * 18 - 30}
                        width="18"
                        height={(idx % 3) * 18 + 30}
                        rx="4"
                        fill={idx % 2 === 0 ? "#00a86b" : "#d9f2e6"}
                      />
                    ))}
                  </svg>
                )}
                {chart.type === "box" && (
                  <svg
                    viewBox="0 0 180 100"
                    className="h-full w-full text-[var(--accent)]"
                  >
                    <line
                      x1="30"
                      x2="30"
                      y1="20"
                      y2="80"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <rect
                      x="30"
                      y="30"
                      width="80"
                      height="40"
                      fill="rgba(0,168,107,0.18)"
                      stroke="#00a86b"
                      rx="8"
                    />
                    <line
                      x1="70"
                      x2="70"
                      y1="30"
                      y2="70"
                      stroke="#00a86b"
                      strokeWidth="2"
                    />
                    <circle
                      cx="120"
                      cy="45"
                      r="6"
                      fill="#0f172a"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        data-scroll-reveal
        className="rounded-3xl bg-gradient-to-br from-[#052f23] via-[#0f172a] to-[#00a86b] p-12 text-white shadow-2xl"
      >
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-white/70">
            Call to action
          </p>
          <h3 className="text-4xl font-semibold leading-tight">
            Jelajahi Data. Temukan Cerita di Balik Pertanian Jawa Timur.
          </h3>
          <p className="text-lg text-white/80">
            Setiap grafik, peta, dan indikator Farmetrica dirancang agar para
            pengambil keputusan bisa bertindak cepat—tanpa kehilangan konteks
            lokal Jawa Timur.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/dashboard"
              className="cta-button rounded-full bg-white px-8 py-3 text-base font-semibold text-[#052f23] text-center inline-block"
            >
              Buka Dashboard
            </a>
            <a
              href="/map"
              className="cta-button rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white text-center inline-block"
            >
              Lihat Peta
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
