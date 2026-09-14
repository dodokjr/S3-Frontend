import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaUser, 
  FaFacebookF, 
  FaLinkedinIn 
} from 'react-icons/fa'
import { FaXTwitter, FaMagnifyingGlass } from 'react-icons/fa6'
import { HiMenu, HiX } from 'react-icons/hi'
import LogoS3 from '../assets/LogoS3.svg'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Deteksi scroll halaman
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 36) { // Nilai disesuaikan dengan tinggi Top Bar
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About S3', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'News and Events', path: '/news-events' },
    { name: 'Portal Support', path: '/portal-support' },
    { name: 'Contact S3', path: '/contact' },
  ]

  return (
    <>
      {/* 1. TOP BAR (Static/Absolute: Tertinggal di atas saat di-scroll) */}
      <div className="absolute top-0 left-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-sm text-xs text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
          
          {/* Kontak Kiri */}
          <div className="flex items-center space-x-3 sm:space-x-6 text-[11px] sm:text-xs overflow-x-auto no-scrollbar">
            <a href="tel:5123293245" className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors">
              <FaPhoneAlt className="text-red-500 text-[10px]" />
              <span>512.329.3245</span>
            </a>
            <a href="mailto:info@s3.com" className="hidden sm:flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors">
              <FaEnvelope className="text-red-500 text-[10px]" />
              <span>info@s3.com</span>
            </a>
            <a href="/login" className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors">
              <FaUser className="text-red-500 text-[10px]" />
              <span>Client Login</span>
            </a>
          </div>

          {/* Media Sosial Kanan */}
          <div className="flex items-center space-x-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-red-400 transition-colors">
              <FaFacebookF className="text-xs" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-red-400 transition-colors">
              <FaXTwitter className="text-xs" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-red-400 transition-colors">
              <FaLinkedinIn className="text-xs" />
            </a>
          </div>

        </div>
      </div>

      {/* 2. MAIN NAVBAR (Fixed Sticky: Mengikuti scroll) */}
      <header 
        className={`fixed left-0 z-40 w-full transition-all duration-300 ${
          scrolled 
            ? 'top-0 bg-gradient-to-r from-white via-[#bd1118] to-black text-white shadow-2xl border-b border-black/20' 
            : 'top-9 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">

          {/* Logo Gambar (Diberi pad background putih tipis jika di-scroll agar tetap kontras) */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 group">
            <div className={`p-1 rounded-full transition-all duration-300 ${scrolled ? 'bg-white/90 shadow-md' : ''}`}>
              <img 
                src={LogoS3} 
                alt="Logo S3" 
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `transition-colors duration-200 ${
                    isActive 
                      ? 'text-white font-bold underline underline-offset-8 decoration-2' 
                      : 'text-gray-100 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Tombol Search */}
            <button 
              type="button" 
              aria-label="Search"
              className="p-1.5 text-white hover:opacity-80 transition-opacity focus:outline-none"
            >
              <FaMagnifyingGlass className="text-sm" />
            </button>
          </nav>

          {/* Mobile Hamburger & Search Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              type="button" 
              aria-label="Search"
              className="p-2 text-white hover:opacity-80"
            >
              <FaMagnifyingGlass className="text-base" />
            </button>

            <button
              onClick={toggleMenu}
              type="button"
              aria-label="Toggle Menu"
              className="p-2 text-white focus:outline-none rounded-lg hover:bg-black/20 transition-colors"
            >
              {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>
          </div>

        </div>

        {/* 3. MOBILE MENU DROPDOWN */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-white/10 ${
            scrolled ? 'bg-black/95 text-white' : 'bg-black/90 backdrop-blur-lg text-white'
          } ${
            isOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          }`}
        >
          <div className="flex flex-col space-y-2 px-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}