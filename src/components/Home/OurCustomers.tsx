import React, { useState, useMemo } from 'react'
import { FaBuilding, FaSearch, FaHandshake } from 'react-icons/fa'

// Import/substitusi Logo Customer
import KubotaLogo from '../../assets/LogoS3.svg'
import PolytronLogo from '../../assets/LogoS3.svg'
import AptivLogo from '../../assets/LogoS3.svg'
import YasaLogo from '../../assets/LogoS3.svg'
import KaroseriLogo from '../../assets/LogoS3.svg'
import SantosAjiLogo from '../../assets/LogoS3.svg'
import SantosJayaLogo from '../../assets/LogoS3.svg'
import SasakuraLogo from '../../assets/LogoS3.svg'
import CosmeticMirrorLogo from '../../assets/LogoS3.svg'
import GeomedLogo from '../../assets/LogoS3.svg'
import PgasLogo from '../../assets/LogoS3.svg'
import AlbaLogo from '../../assets/LogoS3.svg'

export default function OurCustomers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  const customerData = [
    { name: 'PT Kubota Indonesia', logo: KubotaLogo, category: 'Manufacture & Machinery', location: 'Semarang' },
    { name: 'PT Hartono Istana Teknologi (Polytron)', logo: PolytronLogo, category: 'Electronics & Appliances', location: 'Kudus' },
    { name: 'PT Aptiv Component Indonesia', logo: AptivLogo, category: 'Automotive Components', location: 'Semarang' },
    { name: 'PT Yasa Wahana Tirta Samudra', logo: YasaLogo, category: 'Shipbuilding & Marine', location: 'Semarang' },
    { name: 'PT Karoseri Anak Bangsa', logo: KaroseriLogo, category: 'Automotive & Bodybuilder', location: 'Jawa Tengah' },
    { name: 'PT Sumber Aji Langgeng Santoso', logo: SantosAjiLogo, category: 'Industrial Supplier', location: 'Jawa Tengah' },
    { name: 'PT Santos Jaya Abadi', logo: SantosJayaLogo, category: 'Food & Beverage', location: 'Semarang' },
    { name: 'PT Sasakura Indonesia', logo: SasakuraLogo, category: 'Industrial Engineering', location: 'Jawa Tengah' },
    { name: 'PT Cosmetic Mirror Indonesia', logo: CosmeticMirrorLogo, category: 'Glass Manufacture', location: 'Jawa Tengah' },
    { name: 'PT Geomed Indonesia', logo: GeomedLogo, category: 'Medical Devices', location: 'Jawa Tengah' },
    { name: 'PT PGAS Solution', logo: PgasLogo, category: 'Energy & Infrastructure', location: 'Indonesia' },
    { name: 'PT Alba Tridi Plastics Recycling', logo: AlbaLogo, category: 'Recycling & Sustainability', location: 'Jawa Tengah' }
  ]

  // Ambil daftar kategori unik secara otomatis
  const categories = useMemo(() => {
    return ['Semua', ...Array.from(new Set(customerData.map((c) => c.category)))]
  }, [customerData])

  // Filter Data
  const filteredCustomers = useMemo(() => {
    return customerData.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, customerData])

  return (
    <section className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section (Title di Kanan + Underline Hover Merah, Putih, Hitam) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          
          {/* Quick Highlight Stats (Kiri) */}
          <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 self-start order-2 md:order-1">
            <div>
              <p className="text-2xl font-black text-black">12+</p>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Mitra Utama</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-2xl font-black text-red-600">100%</p>
              <p className="text-[11px] font-semibold text-gray-500 uppercase">Komitmen Mutu</p>
            </div>
          </div>

          {/* Title & Subtitle (Samping Kanan) */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-2 order-1 md:order-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Kepercayaan Industri
            </span>

            {/* Title dengan Animated Underline (Hitam, Merah, Putih) */}
            <div className="group relative inline-block cursor-pointer">
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
                Klien & Mitra Kami
              </h2>
              
              {/* Garis Bawah Interaktif (Merah, Putih, Hitam) */}
              <span className="block h-[4px] w-full bg-black rounded-full transition-all duration-300 group-hover:bg-red-600 relative overflow-hidden mt-1">
                <span className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-500 opacity-50" />
              </span>
            </div>

            <p className="text-sm text-gray-500 max-w-xl">
              Dipercaya oleh puluhan manufaktur skala nasional dan multinasional di Indonesia.
            </p>
          </div>

        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Cari perusahaan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-red-600 transition-all"
              />
            </div>

            {/* Total Filtered Count */}
            <p className="text-xs font-semibold text-gray-400 self-end sm:self-auto">
              Menampilkan <span className="text-black font-bold">{filteredCustomers.length}</span> Perusahaan
            </p>
          </div>

          {/* Category Chips Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Compact Customers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 hover:border-red-600 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md"
              >
                {/* Logo Box */}
                <div className="w-full h-24 bg-gray-50 group-hover:bg-red-50/20 rounded-xl p-3 flex items-center justify-center transition-colors mb-3 border border-gray-100/50">
                  <img
                    src={customer.logo}
                    alt={customer.name}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                {/* Information Area */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {customer.category}
                  </span>
                  <h3 className="text-xs font-bold text-black group-hover:text-red-600 transition-colors line-clamp-1 mt-1">
                    {customer.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                    <FaBuilding className="text-[9px]" /> {customer.location}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-500">Perusahaan tidak ditemukan.</p>
              <p className="text-[11px] text-gray-400 mt-1">Coba gunakan kata kunci lain atau pilih kategori 'Semua'.</p>
            </div>
          )}
        </div>

        {/* Minimalist CTA */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center flex-none hidden sm:flex">
              <FaHandshake className="text-xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Siap Menjadi Mitra Industri Kami Selanjutnya?</h3>
              <p className="text-xs text-gray-400">Dapatkan penawaran harga terbaik dan kepastian pasokan komponen presisi.</p>
            </div>
          </div>
          <a
            href="#contact"
            className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95"
          >
            Hubungi Sales
          </a>
        </div>

      </div>
    </section>
  )
}