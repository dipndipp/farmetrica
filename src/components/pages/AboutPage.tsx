"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function AboutPage() {
  return (
    <div className="flex flex-col gap-16 w-full">
        {/* HERO SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white via-[#f8faf9] to-[#eef5f1] px-8 py-20 shadow-[0_40px_120px_rgba(15,23,42,0.18)] lg:px-16 lg:py-24"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#00a86b]/5 blur-[80px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,168,107,0.08),_transparent_55%)]" />
          </div>

          <div className="relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 rounded-full bg-white/70 px-5 py-2 text-sm font-medium uppercase tracking-widest text-[var(--accent)] backdrop-blur-md border border-white/60"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
                </span>
                About Farmetrica
              </motion.div>
              
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 lg:text-7xl">
                Revolusi Data <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-emerald-600">
                  Pertanian Jatim
                </span>
              </h1>
              
              <p className="max-w-xl text-lg text-slate-600 leading-relaxed lg:text-xl">
                Farmetrica menggabungkan kecerdasan data satelit, analitik presisi, dan wawasan lokal untuk memberdayakan masa depan pertanian Jawa Timur.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative flex items-center justify-center lg:mt-0"
            >
              <div className="relative h-64 w-64 rounded-3xl bg-gradient-to-br from-white/80 to-white/60 p-1 backdrop-blur-xl border border-white/60 shadow-[0_0_40px_rgba(0,168,107,0.15)] rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex h-full w-full items-center justify-center rounded-[1.3rem] bg-white/90">
                  <Image
                    src="/farmetricaLogo.svg"
                    alt="Farmetrica Logo"
                    width={180}
                    height={180}
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* MISSION SECTION */}
        <section className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Transparansi Data",
              desc: "Akses terbuka ke data pertanian yang valid dan real-time untuk semua stakeholder.",
              icon: (
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              ),
              bg: "bg-blue-50",
              border: "group-hover:border-blue-200",
            },
            {
              title: "Prediksi Cerdas",
              desc: "Forecasting hasil panen menggunakan model machine learning berbasis iklim.",
              icon: (
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              ),
              bg: "bg-emerald-50",
              border: "group-hover:border-emerald-200",
            },
            {
              title: "Aksi Nyata",
              desc: "Mengubah insight kompleks menjadi rekomendasi praktis bagi petani.",
              icon: (
                <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ),
              bg: "bg-amber-50",
              border: "group-hover:border-amber-200",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative flex flex-col gap-5 rounded-3xl bg-white p-8 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.border}`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* DEVELOPER SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-emerald-900 to-[#00a86b] p-8 lg:p-16 text-white shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(0,168,107,0.3),_transparent_70%)]" />
          <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
            {/* Profile Card */}
            <div className="w-full max-w-sm shrink-0">
              <div className="group relative rounded-3xl bg-white/5 p-6 backdrop-blur-xl border border-white/10 transition-transform hover:scale-[1.02]">
                <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg mb-6 flex items-center justify-center">
                   <span className="text-8xl font-bold text-white/90">N</span>
                </div>
                <div className="space-y-4 text-center">
                  <div>
                    <h3 className="text-2xl font-bold">M. Ihsan Nadhif</h3>
                    <p className="text-emerald-300 font-medium tracking-wide text-sm uppercase mt-1">Lead Developer</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                     <a href="https://linkedin.com/in/dipnadipp" target="_blank" className="p-3 rounded-xl bg-white/10 hover:bg-emerald-500/20 transition-colors border border-white/5">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                     </a>
                     <a href="https://github.com/dipndipp" target="_blank" className="p-3 rounded-xl bg-white/10 hover:bg-emerald-500/20 transition-colors border border-white/5">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                     </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Content */}
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-6">The Mind Behind <span className="text-emerald-300">Farmetrica</span></h2>
                <p className="text-lg text-white/80 leading-relaxed text-justify">
                  Hi, saya Nadhif — mahasiswa Data Science di PENS yang percaya bahwa data pertanian tidak harus membosankan.
                  <br /><br />
                  Farmetrica lahir dari keresahan sederhana: kenapa data pertanian Jawa Timur yang begitu kaya, seringkali sulit dipahami? 
                  Dengan menggabungkan <span className="text-white font-semibold">modern web tech</span> dan <span className="text-white font-semibold">data storytelling</span>, 
                  saya membangun platform ini untuk menjembatani gap antara angka statistik yang dingin dengan realita lapangan yang dinamis.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-4">Tech Stack & Skills</h4>
                <div className="flex flex-wrap gap-3">
                  {[
                    "Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", 
                    "Data Visualization", "Geospatial Analysis", "UI/UX Design"
                  ].map((skill) => (
                    <span key={skill} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA SECTION */}
        {/* CTA SECTION */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-16 text-center text-white shadow-2xl lg:py-20"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold lg:text-5xl tracking-tight">
              Mulai Eksplorasi Data
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Temukan wawasan mendalam tentang pertanian Jawa Timur melalui dashboard interaktif dan pemetaan geospasial kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-slate-900 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:bg-emerald-50 active:scale-95"
              >
                <span>📊</span> Buka Dashboard
              </a>
              <a
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40 active:scale-95"
              >
                <span>🗺️</span> Peta Interaktif
              </a>
            </div>
          </div>
        </motion.section>
    </div>
  );
}
