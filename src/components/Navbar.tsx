import React, { useState, useEffect } from 'react'
import { 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaWhatsapp
} from 'react-icons/fa'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { HiMenu, HiX } from 'react-icons/hi'
import LogoS3 from '../assets/LogoS3.svg'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About S3', href: '#about', id: 'about' },
    { name: 'Customers', href: '#customers', id: 'customers' },
    { name: 'Partners', href: '#partners', id: 'partners' },
    { name: 'Contact S3', href: '#contact', id: 'contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 36) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      const sections = navLinks.map(link => document.getElementById(link.id))
      const scrollPosition = window.scrollY + 100

      sections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight

          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            setActiveSection(section.id)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [navLinks])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    closeMenu()
    
    const targetElement = document.querySelector(href)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* 1. TOP BAR (Tanpa Media Sosial) */}
      <div className="absolute top-0 left-0 w-full z-50 border-b border-white/10 bg-black/70 backdrop-blur-sm text-xs text-gray-200 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
          
          {/* Detail Kontak Kiri */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs overflow-x-auto no-scrollbar py-1">

            {/* WhatsApp */}
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300">
              <FaWhatsapp className="text-green-500 text-[11px]" />
              <span>+62 812-3456-7890</span>
            </a>

            {/* Email */}
            <a href="mailto:info@s3.co.id" className="hidden sm:flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300">
              <FaEnvelope className="text-red-500 text-[10px]" />
              <span>s3semarang@gmail.com</span>
            </a>
          </div>

          {/* Detail Kontak Kanan (Alamat) */}
          <div className="flex items-center">
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300 text-[11px] sm:text-xs">
              <FaMapMarkerAlt className="text-red-500 text-[10px]" />
              <span>Semarang, Jawa Tengah</span>
            </a>
          </div>

        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header 
        className={`fixed left-0 z-40 w-full transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'top-0 bg-slate-900/95 backdrop-blur-md text-white shadow-xl border-b border-white/10 py-2.5' 
            : 'top-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="flex items-center gap-2 group">
            <div className={`p-1.5 rounded-xl transition-all duration-500 ${scrolled ? 'bg-white/90 shadow-sm' : 'bg-white/10 backdrop-blur-xs'}`}>
              <img 
                src={LogoS3} 
                alt="Logo S3" 
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 transition-colors duration-300 ease-in-out ${
                    isActive ? 'text-red-500 font-bold' : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span 
                    className={`absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-300 ease-in-out ${
                      isActive ? 'w-full' : 'w-0 hover:w-full'
                    }`} 
                  />
                </a>
              )
            })}

            <button 
              type="button" 
              aria-label="Search"
              className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none"
            >
              <FaMagnifyingGlass className="text-sm" />
            </button>
          </nav>

          {/* Mobile Hamburger & Search */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              type="button" 
              aria-label="Search"
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaMagnifyingGlass className="text-base" />
            </button>

            <button
              onClick={toggleMenu}
              type="button"
              aria-label="Toggle Menu"
              className="p-2 text-white focus:outline-none rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>
          </div>

        </div>

        {/* 3. MOBILE MENU DROPDOWN */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-80 opacity-100 py-4 border-t border-white/10' : 'max-h-0 opacity-0 py-0'
          } ${scrolled ? 'bg-slate-900/95 backdrop-blur-lg' : 'bg-black/90 backdrop-blur-lg'}`}
        >
          <div className="flex flex-col space-y-2 px-6">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-red-600 text-white font-bold shadow-md'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              )
            })}
          </div>
        </div>
      </header>
    </>
  )
}