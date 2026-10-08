import { useEffect, useRef, useState } from 'react'
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaTachometerAlt,
  FaUserTag,
  FaWhatsapp,
} from 'react-icons/fa'
import { FaClockRotateLeft, FaMagnifyingGlass } from 'react-icons/fa6'
import { HiMenu, HiX } from 'react-icons/hi'
import LogoS3 from '../assets/LogoS3.svg'
import MessageModal, { type MessageData } from './utilities/Messagemodal'

const navLinks = [
  { name: 'Home', href: '#home', id: 'home' },
  { name: 'About S3', href: '#about', id: 'about' },
  { name: 'Customers', href: '#customers', id: 'customers' },
  { name: 'Partners', href: '#partners', id: 'partners' },
  { name: 'Contact S3', href: '#contact', id: 'contact' },
]

// Tinggi total top-bar + main navbar, dipakai sebagai offset saat scroll ke section
// supaya bagian atas section tidak ketutup navbar yang fixed.
const SCROLL_OFFSET = 96

// Riwayat pencarian disimpan di localStorage (terbaru di depan, tanpa duplikat)
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 8

interface NavbarProps {
  // Dipanggil saat form pencarian di-submit. Sambungkan ke logika pencarian yang sesungguhnya.
  onSearch?: (query: string) => void
  // Dipanggil saat form pesan di-submit. Kalau tidak diberikan, pesan dikirim lewat WhatsApp S3.
  onSendMessage?: (data: MessageData) => void
}

export default function Navbar({ onSearch, onSendMessage }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userRole, setUserRole] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const tickingRef = useRef(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const toggleMenu = () => {
    setIsOpen((prev) => !prev)
    setIsSearchOpen(false)
  }
  const closeMenu = () => setIsOpen(false)

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev)
    setIsOpen(false)
  }
  const closeSearch = () => setIsSearchOpen(false)

  // Baca user_role dari localStorage; kosong jika tidak ada
  useEffect(() => {
    const readRole = () => {
      try {
        setUserRole(localStorage.getItem('user_role') ?? '')
      } catch {
        setUserRole('')
      }
    }

    readRole()

    // Sinkron kalau user_role berubah dari tab lain
    // (atau dari tab yang sama lewat window.dispatchEvent(new Event('storage')))
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'user_role' || e.key === null) readRole()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
    setIsOpen(false)
    setIsSearchOpen(false)
  }
  const closeModal = () => setIsModalOpen(false)

  // Muat riwayat pencarian dari localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) {
        setSearchHistory(
          parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_HISTORY)
        )
      }
    } catch {
      setSearchHistory([])
    }
  }, [])

  const persistHistory = (items: string[]) => {
    setSearchHistory(items)
    try {
      if (items.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
      else localStorage.removeItem(HISTORY_KEY)
    } catch {
      // localStorage tidak tersedia: riwayat tetap jalan di memori saja
    }
  }

  const addToHistory = (query: string) => {
    const next = [
      query,
      ...searchHistory.filter((h) => h.toLowerCase() !== query.toLowerCase()),
    ].slice(0, MAX_HISTORY)
    persistHistory(next)
  }

  const removeFromHistory = (query: string) =>
    persistHistory(searchHistory.filter((h) => h !== query))

  const clearHistory = () => persistHistory([])

  useEffect(() => {
    const updateScrollState = () => {
      setScrolled(window.scrollY > 36)

      const scrollPosition = window.scrollY + 100
      let currentSection = activeSectionRef.current

      for (const link of navLinks) {
        const section = document.getElementById(link.id)
        if (!section) continue

        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = link.id
          break
        }
      }

      if (currentSection !== activeSectionRef.current) {
        activeSectionRef.current = currentSection
        setActiveSection(currentSection)
      }

      tickingRef.current = false
    }

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true
        requestAnimationFrame(updateScrollState)
      }
    }

    // Jalankan sekali saat mount, supaya state awal benar
    // (misalnya saat halaman di-refresh dalam kondisi sudah di-scroll).
    updateScrollState()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ref supaya closure di dalam useEffect selalu baca nilai activeSection terbaru
  // tanpa perlu memasukkannya ke dependency array (yang akan memicu re-subscribe scroll).
  const activeSectionRef = useRef(activeSection)
  useEffect(() => {
    activeSectionRef.current = activeSection
  }, [activeSection])

  // Saat form pencarian terbuka: fokuskan input & izinkan tutup dengan tombol Escape
  useEffect(() => {
    if (!isSearchOpen) return

    // Tunggu animasi buka selesai (300ms) baru fokus, dan cegah browser menggeser scroll
    const focusTimer = setTimeout(
      () => searchInputRef.current?.focus({ preventScroll: true }),
      300
    )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetSelector: string
  ) => {
    e.preventDefault()
    closeMenu()
    closeSearch()

    const targetElement = document.querySelector<HTMLElement>(targetSelector)
    if (targetElement) {
      const top =
        targetElement.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query = searchQuery.trim()
    if (!query) {
      searchInputRef.current?.focus()
      return
    }

    runSearch(query)
  }

  const runSearch = (query: string) => {
    setSearchQuery(query)
    addToHistory(query)
    onSearch?.(query)

    // 1. Cocokkan dengan navLinks (nama atau id): exact dulu, lalu yang mengandung kata kunci
    const q = query.toLowerCase()
    const target =
      navLinks.find((l) => l.id === q || l.name.toLowerCase() === q) ??
      navLinks.find((l) => l.id.includes(q) || l.name.toLowerCase().includes(q))

    if (target) {
      const el = document.getElementById(target.id)
      if (el) {
        closeSearch()
        closeMenu()
        setSearchQuery('')
        const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
        window.scrollTo({ top, behavior: 'smooth' })
        return
      }
    }

    // 2. Tidak ketemu: cari di Google (tab baru), query diawali "s3"
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`s3 ${query}`)}`
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* 1. TOP BAR */}
      <div className="absolute top-0 left-0 w-full z-50 border-b border-white/10 bg-black/70 backdrop-blur-sm text-xs text-gray-200 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">

          {/* Detail Kontak Kiri */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-[11px] sm:text-xs overflow-x-auto no-scrollbar py-1">
            <a
              href="https://wa.me/628112706172"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300"
            >
              <FaWhatsapp className="text-green-500 text-[11px]" />
              <span>+62 811-2706-172</span>
            </a>

            <a
              href="mailto:s3semarang@gmail.com"
              className="hidden sm:flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300"
            >
              <FaEnvelope className="text-red-500 text-[10px]" />
              <span>s3semarang@gmail.com</span>
            </a>

            {/* User Role (hanya muncul jika ada di localStorage) */}
            {userRole && (
              <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap border-l border-white/20 pl-4 sm:pl-6">
                <FaUserTag className="text-red-500 text-[10px]" />
                <span className="capitalize">{userRole}</span>
              </span>
            )}
          </div>

          {/* User Role versi mobile: di tengah, antara WhatsApp dan lokasi */}
          {userRole && (
            <span className="flex sm:hidden items-center gap-1.5 whitespace-nowrap text-[11px] px-2">
              <FaUserTag className="text-red-500 text-[10px]" />
              <span className="capitalize">{userRole}</span>
            </span>
          )}

          {/* Detail Kontak Kanan (Alamat) */}
          <div className="flex items-center">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="flex items-center gap-1.5 hover:text-white whitespace-nowrap transition-colors duration-300 text-[11px] sm:text-xs"
            >
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
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-2 group"
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-500 ${
                scrolled ? 'bg-white/90 shadow-sm' : 'bg-white/10 backdrop-blur-xs'
              }`}
            >
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
                  className={`group relative py-1 transition-colors duration-300 ease-in-out ${
                    isActive ? 'text-red-500 font-bold' : 'text-gray-200 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-300 ease-in-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </a>
              )
            })}

            {/* Pencarian: tampilan sama seperti nav link */}
            <button
              type="button"
              aria-label={isSearchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
              aria-expanded={isSearchOpen}
              aria-controls="navbar-search"
              onClick={toggleSearch}
              className={`group relative py-1 transition-colors duration-300 ease-in-out ${
                isSearchOpen ? 'text-red-500 font-bold' : 'text-gray-200 hover:text-white'
              }`}
            >
              Pencarian
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-red-500 transition-all duration-300 ease-in-out ${
                  isSearchOpen ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </button>
          </nav>

          {/* Desktop Dashboard & Search Button */}
          <div className="hidden md:flex items-center gap-2">
            {userRole && (
              <>
                <button
                  type="button"
                  onClick={openModal}
                  aria-haspopup="dialog"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                >
                  <FaPaperPlane className="text-[11px]" />
                  Kirim Pesan
                </button>

                <a
                  href="/s3/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                >
                  <FaTachometerAlt className="text-[11px]" />
                  Dashboard
                </a>
              </>
            )}
          </div>

          {/* Mobile Hamburger & Search */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              type="button"
              aria-label={isSearchOpen ? 'Tutup pencarian' : 'Buka pencarian'}
              aria-expanded={isSearchOpen}
              aria-controls="navbar-search"
              onClick={toggleSearch}
              className={`p-2 rounded-lg transition-colors ${
                isSearchOpen ? 'bg-red-600 text-white' : 'text-white hover:bg-white/10'
              }`}
            >
              {isSearchOpen ? <HiX className="text-xl" /> : <FaMagnifyingGlass className="text-base" />}
            </button>

            <button
              onClick={toggleMenu}
              type="button"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
              className="p-2 text-white focus:outline-none rounded-lg hover:bg-white/10 transition-colors"
            >
              {isOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>
          </div>

        </div>

        {/* 3. SEARCH FORM DROPDOWN */}
        {/* Tinggi dianimasikan lewat grid-rows (0fr -> 1fr) supaya mulus tanpa tebak-tebakan max-height */}
        <div
          id="navbar-search"
          aria-hidden={!isSearchOpen}
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
            isSearchOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          } ${scrolled ? 'bg-slate-900/95' : 'bg-black/90'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-white/10 py-3">
              <form
                role="search"
                onSubmit={handleSearchSubmit}
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  isSearchOpen ? 'translate-y-0' : '-translate-y-2'
                }`}
              >
                <div className="relative flex-1">
                  <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk, brand, atau perusahaan..."
                    aria-label="Kata kunci pencarian"
                    tabIndex={isSearchOpen ? 0 : -1}
                    className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 focus:bg-white/15 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  tabIndex={isSearchOpen ? 0 : -1}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
                >
                  Cari
                </button>
              </form>

              {/* Riwayat pencarian */}
              {searchHistory.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      Riwayat pencarian
                    </span>
                    <button
                      type="button"
                      onClick={clearHistory}
                      tabIndex={isSearchOpen ? 0 : -1}
                      className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
                    >
                      Hapus semua
                    </button>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {searchHistory.map((item) => (
                      <li
                        key={item}
                        className="flex items-center bg-white/10 border border-white/10 rounded-full text-xs text-gray-200"
                      >
                        <button
                          type="button"
                          onClick={() => runSearch(item)}
                          tabIndex={isSearchOpen ? 0 : -1}
                          className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 hover:text-white transition-colors"
                        >
                          <FaClockRotateLeft className="text-[10px] text-gray-400" />
                          <span className="max-w-[10rem] truncate">{item}</span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus "${item}" dari riwayat`}
                          onClick={() => removeFromHistory(item)}
                          tabIndex={isSearchOpen ? 0 : -1}
                          className="pr-2.5 pl-0.5 py-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <HiX className="text-sm" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. MOBILE MENU DROPDOWN */}
        <div
          aria-hidden={!isOpen}
          className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          } ${scrolled ? 'bg-slate-900/95' : 'bg-black/90'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-white/10 py-4">
              <div
                className={`flex flex-col space-y-2 px-6 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  isOpen ? 'translate-y-0' : '-translate-y-2'
                }`}
              >
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      tabIndex={isOpen ? 0 : -1}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? 'bg-red-600 text-white font-bold shadow-md'
                          : 'text-gray-200 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </a>
                  )
                })}

                <button
                  type="button"
                  tabIndex={isOpen ? 0 : -1}
                  onClick={toggleSearch}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-colors duration-300 ${
                    isSearchOpen
                      ? 'bg-red-600 text-white font-bold shadow-md'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Pencarian
                </button>

                {userRole && (
                  <>
                    <button
                      type="button"
                      tabIndex={isOpen ? 0 : -1}
                      onClick={openModal}
                      aria-haspopup="dialog"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors duration-300"
                    >
                      <FaPaperPlane className="text-xs" />
                      Kirim Pesan
                    </button>

                    <a
                      href="/s3/dashboard"
                      tabIndex={isOpen ? 0 : -1}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors duration-300"
                    >
                      <FaTachometerAlt className="text-xs" />
                      Dashboard
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 5. MODAL FORM PESAN */}
      <MessageModal
        isOpen={isModalOpen && !!userRole}
        onClose={closeModal}
        onSendMessage={onSendMessage}
      />
    </>
  )
}