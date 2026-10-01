import { useState, useMemo, useEffect } from 'react'
import { FaBuilding, FaSearch, FaHandshake, FaExternalLinkAlt } from 'react-icons/fa'

// Logo cadangan jika gambar dari API gagal dimuat
import FallbackLogo from '../../assets/LogoS3.svg'

const API_URL = 'https://s3-backend-seven.vercel.app/s3/api/cust'

// Bentuk data mentah dari API
interface CustomerApi {
  id: number
  name: string
  image: string
  website?: string
}

// Bentuk data yang dipakai komponen (API + kategori & lokasi lokal)
interface Customer extends CustomerApi {
  category: string
  location: string
}

// API hanya mengirim id, name, image, website.
// Kategori & lokasi disimpan lokal berdasarkan id (hapus jika nanti API sudah menyediakannya).
const CUSTOMER_META: Record<number, { category: string; location: string }> = {
  1: { category: 'Manufacture & Machinery', location: 'Semarang' },
  2: { category: 'Electronics & Appliances', location: 'Kudus' },
  3: { category: 'Shipbuilding & Marine', location: 'Semarang' },
  4: { category: 'Automotive Components', location: 'Semarang' },
  5: { category: 'Automotive & Bodybuilder', location: 'Jawa Tengah' },
  6: { category: 'Industrial Supplier', location: 'Jawa Tengah' },
  7: { category: 'Industrial Engineering', location: 'Jawa Tengah' },
  8: { category: 'Glass Manufacture', location: 'Jawa Tengah' },
  9: { category: 'Food & Beverage', location: 'Semarang' },
  10: { category: 'Energy & Infrastructure', location: 'Indonesia' },
  11: { category: 'Medical Devices', location: 'Jawa Tengah' },
  12: { category: 'Recycling & Sustainability', location: 'Jawa Tengah' }
}

const DEFAULT_META = { category: 'Lainnya', location: 'Indonesia' }

export default function OurCustomers() {
  const [customerData, setCustomerData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')

  // Ambil data dari API
  useEffect(() => {
    const controller = new AbortController()

    async function fetchCustomers() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(API_URL, { signal: controller.signal })
        if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`)

        const json = await res.json()
        if (!json.success || !Array.isArray(json.data)) {
          throw new Error('Format respons API tidak sesuai')
        }

        // Gabungkan data API dengan kategori & lokasi lokal
        const merged: Customer[] = (json.data as CustomerApi[]).map((item) => ({
          ...item,
          ...(CUSTOMER_META[item.id] || DEFAULT_META)
        }))
        setCustomerData(merged)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Terjadi kesalahan saat memuat data')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchCustomers()
    return () => controller.abort()
  }, [reloadKey])

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

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">

          {/* Quick Highlight Stats (Kiri) */}
          <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 self-start order-2 md:order-1">
            <div>
              <p className="text-2xl font-black text-black">
                {loading ? '–' : `${customerData.length}+`}
              </p>
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

            {/* Title dengan Animated Underline */}
            <div className="group relative inline-block cursor-pointer">
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
                Klien & Mitra Kami
              </h2>

              {/* Garis Bawah Interaktif */}
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
                disabled={loading || !!error}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-red-600 transition-all disabled:opacity-60"
              />
            </div>

            {/* Total Filtered Count */}
            <p className="text-xs font-semibold text-gray-400 self-end sm:self-auto">
              Menampilkan <span className="text-black font-bold">{filteredCustomers.length}</span> Perusahaan
            </p>
          </div>

          {/* Category Chips Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
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
          {loading ? (
            // Skeleton saat loading
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="w-full h-24 bg-gray-100 rounded-xl mb-3" />
                <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-2.5 w-1/3 bg-gray-100 rounded" />
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12 bg-red-50/40 rounded-2xl border border-dashed border-red-200">
              <p className="text-xs font-bold text-red-600">Gagal memuat data perusahaan.</p>
              <p className="text-[11px] text-gray-500 mt-1">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const cardClass =
                'group bg-white rounded-2xl border border-gray-100 hover:border-red-600 p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-md'

              const cardContent = (
                <>
                  {/* Logo Box */}
                  <div className="w-full h-24 bg-gray-50 group-hover:bg-red-50/20 rounded-xl p-3 flex items-center justify-center transition-colors mb-3 border border-gray-100/50">
                    <img
                      src={customer.image}
                      alt={customer.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = FallbackLogo
                      }}
                      className="max-h-16 max-w-16 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
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
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                        <FaBuilding className="text-[9px]" /> {customer.location}
                      </p>
                      {customer.website && (
                        <FaExternalLinkAlt className="text-[9px] text-gray-300 group-hover:text-red-600 transition-colors" />
                      )}
                    </div>
                  </div>
                </>
              )

              // Kartu jadi link jika punya website, jika tidak hanya div biasa
              return customer.website ? (
                <a
                  key={customer.id}
                  href={customer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {cardContent}
                </a>
              ) : (
                <div key={customer.id} className={cardClass}>
                  {cardContent}
                </div>
              )
            })
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