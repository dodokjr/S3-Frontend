import React from 'react'
import { Link } from 'react-router-dom'

export default function HeroBanner() {
  return (
    <section className="relative w-full bg-gradient-to-br from-neutral-950 via-red-950 to-neutral-900 text-white overflow-hidden py-20 lg:py-32 border-b border-red-900/40">
      
      {/* Efek Gradient Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-red-700/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-slate-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Konten Utama */}
      <div className="w-full px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Kolom Kiri: Pesan Bisnis */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Tag Badge Merah */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              CV. Sinergi Solusi Sejahtera
            </div>

            {/* Headline Utama dengan Gradasi Putih ke Abu-abu */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
                Menghubungkan Produsen Utama dengan Jaringan Pasar Luas
              </span>
            </h1>

            {/* Deskripsi Perusahaan */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed font-normal">
              Kami bertindak sebagai mitra distributor pihak kedua yang mengelola distribusi barang secara efisien, terintegrasi, dan tepercaya untuk memperluas jangkauan produk Anda bersama <strong className="text-white">CV. Sinergi Solusi Sejahtera</strong>.
            </p>

            {/* Tombol Aksi (CTA) */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                to="/contact"
                className="w-full sm:w-auto text-center px-7 py-3.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all duration-200 active:scale-95"
              >
                Jadi Mitra Kami
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto text-center px-7 py-3.5 text-sm font-semibold text-neutral-200 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border border-red-900/50 rounded-xl transition-all duration-200"
              >
                Pelajari Skema Distribusi
              </Link>
            </div>

            {/* Statistik Singkat */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-800 w-full max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">500+</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Jaringan Retail</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">99%</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Pengiriman On-Time</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-red-500">Distributor</p>
                <p className="text-xs text-neutral-400 font-medium mt-1">Solusi Terintegrasi</p>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Visual Alur Distribusi */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Card Visual Alur */}
              <div className="relative bg-neutral-900/90 border border-red-900/40 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-sm space-y-6">
                
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Alur Distribusi Resmi
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                    Active Network
                  </span>
                </div>

                {/* Card Diagram Alur */}
                <div className="space-y-4">
                  {/* Pihak 1 */}
                  <div className="p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-400">Pihak Pertama</p>
                      <p className="text-sm font-semibold text-white">Produsen / Principal</p>
                    </div>
                    <span className="text-xs text-neutral-500">Source</span>
                  </div>

                  {/* Panah */}
                  <div className="flex justify-center my-1 text-red-500">
                    <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Pihak 2 (CV. Sinergi Solusi Sejahtera) */}
                  <div className="p-4 bg-gradient-to-r from-red-600/30 via-red-900/40 to-neutral-800 rounded-xl border border-red-500/50 flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs text-red-400 font-semibold">Pihak Kedua (KAMI)</p>
                      <p className="text-base font-bold text-white">CV. Sinergi Solusi Sejahtera</p>
                    </div>
                    <span className="px-2 py-1 text-[10px] bg-red-600 text-white font-bold rounded">HUB</span>
                  </div>

                  {/* Panah */}
                  <div className="flex justify-center my-1 text-red-500">
                    <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>

                  {/* Pihak 3 */}
                  <div className="p-3.5 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-neutral-400">Pihak Ketiga</p>
                      <p className="text-sm font-semibold text-white">Retailer / Partner / Pasar</p>
                    </div>
                    <span className="text-xs text-neutral-500">End Point</span>
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