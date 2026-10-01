import { useState, useRef, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaExternalLinkAlt, FaCheckCircle, FaGlobe } from 'react-icons/fa'

// Logo cadangan jika gambar dari API gagal dimuat
import DefaultBrandLogo from '../../assets/LogoS3.svg'

const API_URL = 'https://s3-backend-seven.vercel.app/s3/api/partner'

// Bentuk data mentah dari API
interface PartnerApi {
  name: string
  logo: string
  spesifikasi: string[]
  website?: string
}

// Bentuk data yang dipakai komponen (API + kategori & asal negara lokal)
interface Brand extends PartnerApi {
  category: string
  origin: string
}

// API belum mengirim kategori & asal negara, jadi disimpan lokal berdasarkan nama brand.
// Hapus objek ini jika nanti field tersebut sudah tersedia di API.
const BRAND_META: Record<string, { category: string; origin: string }> = {
  Tsubaki: { category: 'Power Transmission', origin: 'Japan' },
  'Henkel Loctite': { category: 'Chemical & Adhesive', origin: 'Germany' },
  OSG: { category: 'Cutting Tools', origin: 'Japan' },
  Cromwell: { category: 'Industrial Tools', origin: 'United Kingdom' },
  Stanley: { category: 'Hand & Power Tools', origin: 'USA' },
  Karcher: { category: 'Cleaning Equipment', origin: 'Germany' },
  CRC: { category: 'Maintenance Chemicals', origin: 'USA' },
  Dynabrade: { category: 'Pneumatic Tools', origin: 'USA' }
}

const DEFAULT_META = { category: 'Industrial Supply', origin: 'International' }

export default function PartnerBrands() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [brandData, setBrandData] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Ambil data dari API
  useEffect(() => {
    const controller = new AbortController()

    async function fetchBrands() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(API_URL, { signal: controller.signal })
        if (!res.ok) throw new Error(`Gagal memuat data (HTTP ${res.status})`)

        const json = await res.json()
        if (!json.success || !Array.isArray(json.data)) {
          throw new Error('Format respons API tidak sesuai')
        }

        const merged: Brand[] = (json.data as PartnerApi[]).map((item) => ({
          ...item,
          spesifikasi: Array.isArray(item.spesifikasi) ? item.spesifikasi : [],
          ...(BRAND_META[item.name] || DEFAULT_META)
        }))
        setBrandData(merged)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Terjadi kesalahan saat memuat data')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchBrands()
    return () => controller.abort()
  }, [reloadKey])

  // Logika Scroll dengan Deteksi Ujung (Reset Otomatis ke Depan)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const scrollAmount = 320 // Lebar estimasi 1 card + gap

      if (direction === 'right') {
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
      } else if (direction === 'left') {
        if (scrollLeft <= 0) {
          scrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' })
        } else {
          scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        }
      }
    }
  }

  // Effect Auto-Scroll Otomatis 3 Detik (Pause jika di-hover, modal terbuka, atau data belum siap)
  useEffect(() => {
    if (isHovered || selectedBrand || loading || error || brandData.length === 0) return

    const interval = setInterval(() => {
      scroll('right')
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovered, selectedBrand, loading, error, brandData.length])

  // Ganti ke logo cadangan jika gambar gagal dimuat
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null
    e.currentTarget.src = DefaultBrandLogo
  }

  return (
    <section className="bg-white py-10 px-4 font-sans border-y border-gray-100">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div className="flex flex-col items-start space-y-1">
            <div className="group relative inline-block cursor-pointer">
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase whitespace-nowrap">
                Partner Brands
              </h2>

              {/* Underline Hover Effect */}
              <span className="block h-[4px] w-full bg-black rounded-full transition-all duration-300 group-hover:bg-red-600 relative overflow-hidden mt-1">
                <span className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-500 opacity-50" />
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Klik Card Untuk Detail Informasi Merek
            </span>
          </div>

          {/* Navigasi Kanan */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={loading || !!error}
              className="p-3 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-full border border-gray-200 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={loading || !!error}
              className="p-3 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-full border border-gray-200 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              aria-label="Scroll right"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* Slider Card Horizontal */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="flex items-center gap-5 overflow-x-auto scrollbar-hide py-2 px-1 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            // Skeleton saat loading
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-none w-64 sm:w-72 bg-gray-50 border-2 border-gray-100 rounded-2xl p-5 flex items-center gap-4 animate-pulse"
              >
                <div className="w-16 h-16 flex-none bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="w-full text-center py-8 bg-red-50/40 rounded-2xl border border-dashed border-red-200">
              <p className="text-xs font-bold text-red-600">Gagal memuat data brand.</p>
              <p className="text-[11px] text-gray-500 mt-1">{error}</p>
              <button
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Coba Lagi
              </button>
            </div>
          ) : brandData.length === 0 ? (
            <div className="w-full text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-500">Belum ada data brand.</p>
            </div>
          ) : (
            brandData.map((brand) => (
              <div
                key={brand.name}
                onClick={() => setSelectedBrand(brand)}
                className="group flex-none w-64 sm:w-72 bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-red-600 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl cursor-pointer"
              >
                {/* Logo Container */}
                <div className="w-16 h-16 flex-none bg-white rounded-xl p-2.5 flex items-center justify-center border border-gray-200 group-hover:border-red-100 transition-colors">
                  <img
                    src={brand.logo || DefaultBrandLogo}
                    alt={brand.name}
                    loading="lazy"
                    onError={handleImgError}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    draggable={false}
                  />
                </div>

                {/* Brand Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="text-base font-bold text-black group-hover:text-red-600 transition-colors truncate">
                    {brand.name}
                  </h3>
                  <p className="text-xs font-semibold text-red-600 truncate">
                    {brand.category}
                  </p>
                  <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200 group-hover:bg-red-50 group-hover:text-red-700 px-2 py-0.5 rounded transition-colors">
                    {brand.origin}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal Deskripsi saat Card Diklik */}
      {selectedBrand && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBrand(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 relative border-2 border-black shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
              aria-label="Tutup"
            >
              <FaTimes className="text-lg" />
            </button>

            <div className="flex items-center gap-4 pr-8">
              <div className="w-16 h-16 flex-none bg-gray-50 rounded-2xl p-3 border border-gray-200 flex items-center justify-center">
                <img
                  src={selectedBrand.logo || DefaultBrandLogo}
                  alt={selectedBrand.name}
                  onError={handleImgError}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md mb-1">
                  {selectedBrand.origin} Principal
                </span>
                <h3 className="text-xl font-black text-black">
                  {selectedBrand.name}
                </h3>
                <p className="text-xs font-semibold text-gray-500">
                  {selectedBrand.category}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <FaCheckCircle className="text-red-600" /> Deskripsi Produk & Spesifikasi
              </p>
              {selectedBrand.spesifikasi.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedBrand.spesifikasi.map((spec, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-red-600" />
                      <span className="min-w-0 break-words">{spec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Informasi spesifikasi belum tersedia.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setSelectedBrand(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
              {selectedBrand.website && (
                <a
                  href={selectedBrand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  Website <FaGlobe className="text-[10px]" />
                </a>
              )}
              <a
                href="#contact"
                onClick={() => setSelectedBrand(null)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Tanya Produk <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}