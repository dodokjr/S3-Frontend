import { useState, useRef, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa'

// Substitusi Logo Brand / Principal
import DefaultBrandLogo from '../../assets/LogoS3.svg'

interface Brand {
  name: string
  category: string
  origin: string
  desc: string
}

export default function PartnerBrands() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const brandData = [
    {
      name: 'Tsubaki',
      category: 'Power Transmission',
      origin: 'Japan',
      desc: 'Manufaktur rantai industri, sprocket, dan sistem transmisi daya presisi tinggi terkemuka di dunia untuk keandalan lini produksi nonstop.'
    },
    {
      name: 'OSG',
      category: 'Cutting Tools',
      origin: 'Japan',
      desc: 'Spesialis perkakas potong presisi seperti tap, end mill, dan matabor (drills) berdaya tahan tinggi untuk pemesinan material keras.'
    },
    {
      name: 'Loctite',
      category: 'Chemical & Adhesive',
      origin: 'Germany',
      desc: 'Perekat struktural, threadlocker, dan sealant industri berkualitas tinggi dari Henkel untuk penguncian dan penyegelan komponen mesin.'
    },
    {
      name: 'SMC',
      category: 'Pneumatics',
      origin: 'Japan',
      desc: 'Pemimpin solusi aktuator pneumatik, katup kontrol (solenoid valve), dan sistem otomasi pabrik hemat energi.'
    },
    {
      name: 'NSK',
      category: 'Bearings',
      origin: 'Japan',
      desc: 'Produsen bearing presisi tinggi dan linear guides untuk meminimalkan gesekan serta meningkatkan efisiensi operasional mesin.'
    },
    {
      name: 'SUNON',
      category: 'Cooling Fans',
      origin: 'Taiwan',
      desc: 'Inovator kipas pendingin (cooling fans) dan solusi manajemen termal untuk panel listrik serta instrumen elektronik industri.'
    },
    {
      name: 'Mitsubishi Materials',
      category: 'Machining Tools',
      origin: 'Japan',
      desc: 'Penyedia insert karbida, perkakas bubut (turning), dan freis (milling) bermutu tinggi untuk pemesinan presisi.'
    },
    {
      name: 'ThreeBond',
      category: 'Sealant & Adhesive',
      origin: 'Japan',
      desc: 'Formulasi senyawa kimia industri, gasketing cair, dan perekat untuk perakitan otomotif serta manufaktur.'
    },
    {
      name: 'Festo',
      category: 'Automation',
      origin: 'Germany',
      desc: 'Teknologi otomatisasi industri mutakhir berbasis pneumatik dan elektrikal untuk lini manufaktur cerdas.'
    },
    {
      name: 'KANA',
      category: 'Sprockets & Chains',
      origin: 'Japan',
      desc: 'Rantai roda dan sprocket standar industri berkekuatan tinggi untuk sistem konveyor dan penggerak beban berat.'
    }
  ]

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

  // Effect Auto-Scroll Otomatis 3 Detik (Pause jika di-hover atau modal terbuka)
  useEffect(() => {
    if (isHovered || selectedBrand) return

    const interval = setInterval(() => {
      scroll('right')
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovered, selectedBrand])

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
              className="p-3 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-full border border-gray-200 transition-all active:scale-95 shadow-sm"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-full border border-gray-200 transition-all active:scale-95 shadow-sm"
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
          {brandData.map((brand, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedBrand(brand)}
              className="group flex-none w-64 sm:w-72 bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-red-600 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl cursor-pointer"
            >
              {/* Logo Container */}
              <div className="w-16 h-16 flex-none bg-white rounded-xl p-2.5 flex items-center justify-center border border-gray-200 group-hover:border-red-100 transition-colors">
                <img
                  src={DefaultBrandLogo}
                  alt={brand.name}
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
          ))}
        </div>

      </div>

      {/* Modal Deskripsi saat Card Diklik */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 relative border-2 border-black shadow-2xl transition-all">
            
            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            >
              <FaTimes className="text-lg" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl p-3 border border-gray-200 flex items-center justify-center">
                <img
                  src={DefaultBrandLogo}
                  alt={selectedBrand.name}
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
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedBrand.desc}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedBrand(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-xl transition-all"
              >
                Tutup
              </button>
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