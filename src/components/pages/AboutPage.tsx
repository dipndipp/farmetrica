"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <main className="mx-auto w-full max-w-7xl flex flex-col gap-10 px-6 pb-20 pt-10 lg:px-10">
        {/* HERO SECTION */}
        <motion.section
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/40 px-10 py-14 shadow-xl border border-emerald-100"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.08),_transparent_70%)]" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-emerald-700 shadow-sm backdrop-blur-sm border border-emerald-200/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                About Farmetrica
              </div>
              <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
                Tentang <span className="text-emerald-600">Farmetrica</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Farmetrica adalah platform analitik pertanian Jawa Timur yang
                menggabungkan data satelit, laporan panen, dan prediksi berbasis
                AI untuk membantu pengambilan keputusan yang lebih baik.
              </p>
            </div>
            <div className="flex items-center justify-center mt-6 lg:mt-0">
              <div className="w-48 h-48 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border border-emerald-100 flex items-center justify-center">
                <Image
                  src="/farmetricaLogo.svg"
                  alt="Farmetrica Logo"
                  width={200}
                  height={20}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* MISI SECTION */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[
            {
              title: "Transparansi Data",
              desc: "Menyajikan data pertanian yang mudah diakses, akurat, dan dapat diverifikasi oleh siapa saja.",
              icon: "📊",
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Prediksi Cerdas",
              desc: "Menggunakan model statistik dan AI untuk memprediksi tren panen dan membantu perencanaan.",
              icon: "🤖",
              color: "from-emerald-500 to-emerald-600",
            },
            {
              title: "Aksi Berbasis Insight",
              desc: "Mendorong pengambilan keputusan yang cepat dan tepat melalui visualisasi dan insight yang mudah dipahami.",
              icon: "🚀",
              color: "from-amber-500 to-orange-600",
            },
          ].map((misi, i) => (
            <motion.div
              key={misi.title}
              className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200 flex flex-col items-start gap-4 hover:shadow-xl transition-shadow"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <div
                className={`text-4xl w-16 h-16 rounded-xl bg-gradient-to-br ${misi.color} flex items-center justify-center shadow-md`}
              >
                <span>{misi.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{misi.title}</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                {misi.desc}
              </p>
            </motion.div>
          ))}
        </motion.section>

        {/* TEAM SECTION - Improved Layout */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-900 to-emerald-700 p-10 lg:p-12 text-white shadow-2xl"
        >
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-white/70 mb-3">
              MEET THE DEVELOPER
            </p>
            <h2 className="text-4xl font-bold text-white">
              The Man Behind Farmetrica
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Profile Card */}
            <div className="flex-shrink-0 w-full lg:w-80">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-xl">
                <div className="w-32 h-32 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg flex items-center justify-center text-5xl font-bold text-white">
                  N
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    Muhammad Ihsan Nadhif
                  </h3>
                  <p className="text-emerald-300 font-semibold text-base">
                    Lead Developer
                  </p>
                  <div className="pt-4 flex gap-3 justify-center">
                    {/* LinkedIn */}
                    <a
                      href="https://www.linkedin.com/in/dipnadipp"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30"
                      aria-label="LinkedIn Profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                      >
                        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.32 8.02H4.7V24H.32V8.02zM8.34 8.02h4.18v2.17h.06c.58-1.1 2-2.26 4.11-2.26 4.4 0 5.21 2.9 5.21 6.68V24h-4.38v-8.1c0-1.93-.04-4.41-2.69-4.41-2.7 0-3.11 2.11-3.11 4.28V24H8.34V8.02z" />
                      </svg>
                    </a>

                    {/* GitHub */}
                    <a
                      href="https://github.com/dipndipp"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center border border-white/30"
                      aria-label="GitHub Profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                      >
                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.29-1.71-1.29-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.42.37.8 1.1.8 2.22 0 1.6-.02 2.88-.02 3.27 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Content */}
            <div className="flex-1 space-y-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-lg">
                <h4 className="text-xl font-bold text-white mb-4">
                  Tentang Saya
                </h4>
                <p className="text-white/90 text-base leading-relaxed text-justify">
                  Hi, I'm Nadhif — a full-stack developer currently studying
                  Data Science at Politeknik Elektronika Negeri Surabaya.
                  <br />
                  Farmetrica hadir sebagai ruang kecil untuk bikin data
                  pertanian Jawa Timur lebih kebaca dan grounded. Lewat visual
                  yang bersih, insight berbasis probabilitas, dan analisis yang
                  ringan tapi tepat sasaran, project ini ditujukan untuk
                  memperlihatkan bagaimana data bisa bercerita jauh lebih jelas
                  ketika disajikan dengan cara yang tepat.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-lg">
                <h4 className="text-xl font-bold text-white mb-5">
                  Keahlian & Fokus
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Fullstack Engineering & Data Science",
                    "Visualisasi Data & Analytics",
                    "Aplikasi Dashboard & Monitoring",
                    "Solusi untuk Petani & Stakeholder",
                  ].map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <span className="text-emerald-400 font-bold text-lg">
                        ✓
                      </span>
                      <span className="text-white/90 text-sm leading-relaxed">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CONTACT SECTION */}
        <motion.section
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white p-10 lg:p-12 shadow-xl border border-slate-200 text-center"
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg mb-4">
              <span className="text-4xl">✉️</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">Hubungi Kami</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              Punya pertanyaan, saran, atau ingin berkolaborasi? Kami terbuka
              untuk diskusi dan masukan demi pengembangan Farmetrica yang lebih
              baik.
            </p>
            <a
              href="mailto:hello@farmetrica.com"
              className="inline-flex items-center gap-3 mt-6 rounded-xl bg-emerald-600 px-8 py-4 text-white font-bold text-lg shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all"
            >
              <span>📧</span>
              hello@farmetrica.com
            </a>
            <div className="pt-6 flex gap-4 justify-center">
              <div className="px-6 py-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">
                💬 Chat Support
              </div>
              <div className="px-6 py-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold">
                📱 Social Media
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
