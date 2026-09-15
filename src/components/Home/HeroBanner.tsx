export default function HeroBanner() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetElement = document.querySelector(href)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section 
      id="home" 
      className="relative w-full bg-gradient-to-br from-neutral-950 via-red-950 to-neutral-900 text-white overflow-hidden pt-36 pb-20 lg:pt-44 lg:pb-32 border-b border-red-900/40"
    >
      {/* Efek Gradient Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-slate-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Konten Utama */}
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Kolom Kiri: Pesan Bisnis */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6">
            
            {/* Tag Badge Merah */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              CV. Sinergi Solusi Sejahtera
            </div>

            {/* Headline Utama */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Solusi Perdagangan & Supply Chain Industri Terintegrasi
              </span>
            </h1>

            {/* Deskripsi Singkat */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-xl leading-relaxed font-normal">
              Mitra tepercaya penyedia <strong className="text-white">General Trading & Industrial Supply</strong>. Kami menghadirkan pasokan komponen berkualitas demi kelancaran operasional dan tumbuh sejahtera bersama.
            </p>

            {/* Tombol Aksi (CTA) */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <a
                href="#contact"
                onClick={(e) => handleScrollTo(e, '#contact')}
                className="w-full sm:w-auto text-center px-7 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all duration-200 active:scale-95"
              >
                Jadi Mitra Kami
              </a>
              <a
                href="#about"
                onClick={(e) => handleScrollTo(e, '#about')}
                className="w-full sm:w-auto text-center px-7 py-3.5 text-sm font-semibold text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-red-900/50 rounded-xl transition-all duration-200"
              >
                Pelajari Skema Distribusi
              </a>
            </div>

            {/* Statistik Singkat */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-800 w-full max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">Global</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Brand Partners</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">99%</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">On-Time Supply</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">B2B HUB</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Industrial Supplier</p>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Visual Alur Distribusi S3 */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg">
              
              {/* Card Visual Alur */}
              <div className="relative bg-neutral-900/90 border border-red-900/40 p-6 sm:p-7 rounded-2xl shadow-2xl backdrop-blur-sm space-y-5">
                
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
                  <div>
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block">
                      Skema Distribusi B2B S3
                    </span>
                    <span className="text-[10px] text-neutral-400">Integrated Industrial Supply Network</span>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    Verified Flow
                  </span>
                </div>

                {/* Card Diagram Alur */}
                <div className="space-y-3">
                  
                  {/* PARTNER */}
                  <div className="p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-900/40 border border-red-500/30 text-red-300 px-1.5 py-0.5 rounded font-mono font-bold">PARTNER</span>
                        <p className="text-xs text-neutral-400">Pemasok & Produsen Utama</p>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">Brand Principal / Manufacturer</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-neutral-700/50 text-neutral-300 rounded font-medium">Source</span>
                  </div>

                  {/* Panah Indikator */}
                  <div className="flex justify-between items-center px-4 py-0.5 text-red-500">
                    <span className="text-[10px] text-neutral-500 italic">Procurement & Authorization</span>
                    <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* HUB: CV. Sinergi Solusi Sejahtera */}
                  <div className="p-4 bg-gradient-to-r from-red-600/30 via-red-950/60 to-neutral-800 rounded-xl border border-red-500/60 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-red-600/10 rounded-full blur-md" />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold">S3 HUB</span>
                          <p className="text-xs text-red-400 font-semibold">Distribution & Procurement</p>
                        </div>
                        <p className="text-base font-bold text-white mt-0.5">CV. Sinergi Solusi Sejahtera</p>
                      </div>
                      <span className="px-2 py-1 text-[10px] bg-red-600 text-white font-bold rounded shadow-sm">KAMI</span>
                    </div>

                    <p className="text-[11px] text-neutral-300 mt-2 pt-2 border-t border-red-900/40">
                      • Logistics Management & Stock Keeping <br />
                      • Technical Quality Control & Order Processing
                    </p>
                  </div>

                  {/* Panah Indikator */}
                  <div className="flex justify-between items-center px-4 py-0.5 text-red-500">
                    <span className="text-[10px] text-neutral-500 italic">B2B Delivery & Service Support</span>
                    <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* CUSTOMER */}
                  <div className="p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-900/40 border border-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">CUSTOMER</span>
                        <p className="text-xs text-neutral-400">Pengguna & Mitra Bisnis</p>
                      </div>
                      <p className="text-sm font-semibold text-white mt-0.5">Industrial End-Users & Retailers</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-neutral-700/50 text-neutral-300 rounded font-medium">End Point</span>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}