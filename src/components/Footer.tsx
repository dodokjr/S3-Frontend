import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaChevronUp, FaWhatsapp } from 'react-icons/fa'
import LogoS3 from '../assets/LogoS3.svg'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetElement = document.querySelector(href)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative w-full bg-neutral-950 text-neutral-300 border-t border-neutral-800/80 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Kolom 1: Logo & Title */}
          <div className="md:col-span-5 space-y-4">
            <a 
              href="#home" 
              onClick={(e) => handleNavClick(e, '#home')} 
              className="inline-flex items-center gap-3.5 group cursor-pointer select-none transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={LogoS3} 
                  alt="Logo S3" 
                  className="h-10 w-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold tracking-tight !text-white relative inline-block cursor-pointer group">
                  CV. Sinergi Solusi Sejahtera (S3)
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-500 to-white transition-all duration-500 group-hover:w-full"></span>
                </h2>
                <span className="text-[11px] font-medium text-neutral-400 group-hover:text-red-400 transition-colors duration-500">
                  General Trading & Industrial Supply
                </span>
              </div>
            </a>

            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Mitra tepercaya penyedia General Trading & Industrial Supply. Menghadirkan solusi rantai pasok komponen manufaktur yang efisien, transparan, dan terintegrasi.
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Navigasi Cepat
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: '#home', label: 'Beranda' },
                { href: '#about', label: 'Tentang S3' },
                { href: '#customers', label: 'Pelanggan' },
                { href: '#partners', label: 'Mitra & Brand' },
                { href: '#contact', label: 'Kontak' },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="relative inline-block py-0.5 text-neutral-300 hover:text-white transition-colors duration-300 group"
                  >
                    <span>{item.label}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kantor & Kontak */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Kantor & Kontak
            </h3>
            <ul className="space-y-3.5 text-sm">
              
              {/* Alamat */}
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, '#contact')}
                  className="relative group flex items-start gap-3 text-neutral-300 hover:text-white transition-colors duration-300"
                >
                  <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0 text-base group-hover:scale-110 transition-transform duration-300" />
                  <span className="leading-snug">
                    Jl. Bukit Seruni V No 132, Sendangmulyo, Tembalang, Semarang, Jawa Tengah
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
                </a>
              </li>

              {/* Telepon */}
              <li>
                <a
                  href="tel:+62241234567"
                  className="relative group inline-flex items-center gap-3 text-neutral-300 hover:text-white transition-colors duration-300"
                >
                  <FaPhoneAlt className="text-red-500 shrink-0 text-sm group-hover:scale-110 transition-transform duration-300" />
                  <span>(024) 123-4567</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
                </a>
              </li>

              {/* WhatsApp */}
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="relative group inline-flex items-center gap-3 text-neutral-300 hover:text-white transition-colors duration-300"
                >
                  <FaWhatsapp className="text-green-500 shrink-0 text-base group-hover:scale-110 transition-transform duration-300" />
                  <span>+62 812-3456-7890</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
                </a>
              </li>

              {/* Email (Diselaraskan dengan Navbar & ContactSection) */}
              <li>
                <a
                  href="mailto:s3semarang@gmail.com"
                  className="relative group inline-flex items-center gap-3 text-neutral-300 hover:text-white transition-colors duration-300"
                >
                  <FaEnvelope className="text-red-500 shrink-0 text-sm group-hover:scale-110 transition-transform duration-300" />
                  <span>s3semarang@gmail.com</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
                </a>
              </li>

            </ul>
          </div>

        </div>

        {/* Garis Pemisah & Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} CV. Sinergi Solusi Sejahtera. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            type="button"
            aria-label="Kembali ke atas"
            className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-red-500/50 shadow-md transition-all duration-500 overflow-hidden"
          >
            <span>Kembali ke Atas</span>
            <FaChevronUp className="text-xs group-hover:-translate-y-1 transition-transform duration-300 text-red-500" />
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-red-600 to-white transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </div>

      </div>
    </footer>
  )
}