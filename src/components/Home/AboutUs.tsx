import React, { useState } from 'react'
import { 
  FaBuilding, 
  FaAward, 
  FaBoxes, 
  FaUsers, 
  FaBullseye, 
  FaRocket, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa'

// Import aset gambar
import BuildingImg from '../../assets/LogoS3.svg'
import IndustryImg from '../../assets/LogoS3.svg'
import Milestone1 from '../../assets/LogoS3.svg'
import Milestone2 from '../../assets/vite.svg'
import Milestone3 from '../../assets/hero.png'

export default function AboutUs() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const milestones = [
    {
      year: 'Fondasi',
      image: Milestone1,
      title: 'Pendirian Perusahaan',
      description: 'CV. Sinergi Solusi Sejahtera (S3) didirikan di Semarang sebagai penyedia general trading dan solusi pasokan industri terpercaya.'
    },
    {
      year: 'Kemitraan',
      image: Milestone2,
      title: 'Kerjasama Principal Global',
      description: 'Menjalin kemitraan strategis dengan merek-merek internasional terkemuka seperti Tsubaki, Henkel Loctite, OSG, Kärcher, dan Stanley.'
    },
    {
      year: 'Ekspansi',
      image: Milestone3,
      title: 'Kepercayaan Industri',
      description: 'Melayani berbagai perusahaan manufaktur ternama, mulai dari PT Kubota Indonesia, PT Hartono Istana Teknologi (Polytron), hingga PT PGAS Solution.'
    }
  ]

  const stats = [
    {
      icon: <FaBuilding className="text-xl sm:text-2xl text-red-600" />,
      number: '1+',
      label: 'Kantor Pusat & Distribusi',
      sublabel: 'Semarang, Jawa Tengah'
    },
    {
      icon: <FaAward className="text-xl sm:text-2xl text-red-600" />,
      number: '10+',
      label: 'Brand Partner Global',
      sublabel: 'Tsubaki, Loctite, OSG, dll.'
    },
    {
      icon: <FaBoxes className="text-xl sm:text-2xl text-red-600" />,
      number: '100+',
      label: 'Kategori Produk',
      sublabel: 'Chains, Adhesives, Tools'
    },
    {
      icon: <FaUsers className="text-xl sm:text-2xl text-red-600" />,
      number: '50+',
      label: 'Klien Industri',
      sublabel: 'Tersebar di Indonesia'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % milestones.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + milestones.length) % milestones.length)
  }

  return (
    <section className="bg-white text-black py-12 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-20 sm:space-y-28">

        {/* 1. HERO / MAIN ABOUT SECTION */}
        <div>
          {/* Badge & Title */}
          <div className="text-center space-y-3 mb-12">
            <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              Tentang Kami
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              CV. SINERGI SOLUSI SEJAHTERA
            </h2>
            <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Gambar Kiri */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 group">
                <img 
                  src={BuildingImg} 
                  alt="S3 Office Building" 
                  className="w-full h-[320px] sm:h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Teks Deskripsi Kanan */}
            <div className="lg:col-span-7 space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
              <p className="text-base sm:text-lg text-black font-semibold border-l-4 border-red-600 pl-4 py-1">
                Sebagai penyedia solusi <strong>general trading</strong> dan pemasok kebutuhan industri terpercaya, <strong>CV. Sinergi Solusi Sejahtera (S3)</strong> hadir untuk mendukung efisiensi serta kelancaran operasional berbagai sektor manufaktur di Indonesia.
              </p>
              <p>
                Berbasis di Semarang, Jawa Tengah, kami berkomitmen untuk selalu menghadirkan produk berkualitas tinggi—mulai dari <em>power transmission components</em>, <em>adhesive & maintenance solutions</em>, <em>cutting tools</em>, hingga peralatan pembersih industri.
              </p>
              <p>
                Keberhasilan kami dibangun di atas prinsip integritas, kecepatan respons, serta pemahaman mendalam terhadap kebutuhan spesifik di setiap lini produksi mitra kami. Kami tidak sekadar menjual produk, melainkan memberikan nilai tambah melalui konsultasi teknis serta jaminan ketersediaan pasokan secara konsisten.
              </p>
              <p>
                Seiring pertumbuhan perusahaan, S3 terus memperluas jaringan kemitraan strategis dengan produsen ternama internasional demi memberikan cakupan layanan yang handal bagi pelanggan dari berbagai sektor industri di seluruh Nusantara.
              </p>
              <p className="pt-2 text-gray-900 font-medium">
                Atas kepercayaan yang telah diberikan oleh para mitra bisnis, kami mengucapkan terima kasih sebesar-besarnya. Kami siap untuk terus melangkah bersama Anda menuju pertumbuhan bisnis yang sejahtera dan berkelanjutan.
              </p>
            </div>
          </div>
        </div>

        {/* 2. VISION & MISSION SECTION */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-12 border border-gray-200">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-black tracking-tight">
              VISI & MISI
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest font-semibold">
              Prinsip & Arah Langkah Perusahaan
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Teks Visi & Misi Kiri */}
            <div className="lg:col-span-7 space-y-6">
              {/* Kotak Visi */}
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <FaBullseye className="text-xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-wide">Visi Kami</h3>
                </div>
                <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed pl-1">
                  "Menyediakan solusi general trading yang berkelanjutan untuk tumbuh, berkembang, dan sejahtera bersama."
                </p>
              </div>

              {/* Kotak Misi */}
              <div className="bg-white border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-black rounded-lg text-white">
                    <FaRocket className="text-xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-wide">Misi Kami</h3>
                </div>
                <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed pl-1">
                  "Menjadi mitra terpercaya yang senantiasa memberikan nilai tambah demi menciptakan masa depan yang sejahtera."
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 italic pl-1">
                Di S3, Visi dan Misi kami merupakan wujud komitmen nyata untuk terus berinovasi dan mendampingi kelancaran operasional industri Anda.
              </p>
            </div>

            {/* Gambar Kanan */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <img 
                  src={IndustryImg} 
                  alt="Industrial Solutions" 
                  className="w-full h-[260px] sm:h-[340px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}