import { useCallback, useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaGripLines, FaPaperPlane } from 'react-icons/fa'
import { HiX } from 'react-icons/hi'

export interface MessageData {
  // id user yang di-tag, tanpa "@" (mis. 'developer', 'semidev')
  tags: string[]
  message: string
}

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  // Dipanggil setelah pesan BERHASIL tersimpan di server (opsional, mis. untuk refresh daftar pesan).
  onSendMessage?: (data: MessageData) => void
}

// User yang bisa di-tag
const TAG_USERS = [
  { id: 'developer', label: '@developer' },
  { id: 'semidev', label: '@semidev' },
]

const MAX_MESSAGE = 500
const API_URL = 'https://s3-backend-seven.vercel.app/s3/api/messages'
// Key tempat token login disimpan. Kalau sudah tahu key-nya, isi di sini (mis. 'access_token')
// supaya langsung dipakai tanpa menebak.
const TOKEN_KEY = 'admin_token'
const COMMON_TOKEN_KEYS = ['token', 'access_token', 'accessToken', 'authToken', 'auth_token', 'user_token', 'jwt']

// Bersihkan nilai: buang tanda kutip (kalau disimpan lewat JSON.stringify) dan awalan "Bearer "
const cleanToken = (value: string | null) =>
  (value ?? '').trim().replace(/^"|"$/g, '').replace(/^Bearer\s+/i, '')

const looksLikeJwt = (value: string) => /^eyJ[\w-]+\.[\w-]+\.[\w-]*$/.test(value)

const getToken = () => {
  for (const store of [localStorage, sessionStorage]) {
    try {
      // 1. Key yang diset manual, lalu key-key umum
      const keys = [TOKEN_KEY, ...COMMON_TOKEN_KEYS].filter(Boolean)
      for (const key of keys) {
        const value = cleanToken(store.getItem(key))
        if (value) return value
      }
      // 2. Terakhir: cari nilai apa pun yang bentuknya JWT
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        if (!key) continue
        const value = cleanToken(store.getItem(key))
        if (looksLikeJwt(value)) return value
      }
    } catch {
      // storage tidak bisa diakses: lanjut ke storage berikutnya
    }
  }
  return ''
}

interface Position {
  x: number
  y: number
}

// Alert di tengah layar setelah kirim pesan
interface NoticeState {
  type: 'success' | 'error'
  title: string
  text: string
}

// Alert sukses menutup sendiri setelah beberapa detik; alert gagal menunggu ditutup manual
const SUCCESS_NOTICE_MS = 2500

export default function MessageModal({ isOpen, onClose, onSendMessage }: MessageModalProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [message, setMessage] = useState('')
  const [messageTouched, setMessageTouched] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const noticeRef = useRef<NoticeState | null>(null)
  const noticeButtonRef = useRef<HTMLButtonElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // ===== Geser modal (drag) =====
  // pos = selisih posisi dari tengah layar (0,0 = di tengah)
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  // Batasi posisi supaya seluruh modal tetap berada di dalam layar
  const clampPosition = useCallback((x: number, y: number): Position => {
    const panel = panelRef.current
    if (!panel) return { x, y }
    const { width, height } = panel.getBoundingClientRect()
    const maxX = Math.max((window.innerWidth - width) / 2, 0)
    const maxY = Math.max((window.innerHeight - height) / 2, 0)
    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    }
  }, [])

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    // Hanya klik kiri / sentuhan, dan jangan mulai geser saat menekan tombol (mis. tombol tutup)
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if ((e.target as HTMLElement).closest('button')) return

    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
  }

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    setPos(clampPosition(drag.originX + (e.clientX - drag.startX), drag.originY + (e.clientY - drag.startY)))
  }

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return
    dragRef.current = null
    setIsDragging(false)
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const resetPosition = () => setPos({ x: 0, y: 0 })

  // Ref supaya effect di bawah tidak jalan ulang (dan mencuri fokus) tiap parent re-render
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Alert: fokus ke tombol, Escape menutup alert, alert sukses menutup sendiri
  useEffect(() => {
    noticeRef.current = notice
    if (!notice) return

    const focusTimer = setTimeout(() => noticeButtonRef.current?.focus(), 50)
    const autoCloseTimer =
      notice.type === 'success' ? setTimeout(() => setNotice(null), SUCCESS_NOTICE_MS) : undefined

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNotice(null)
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      if (autoCloseTimer) clearTimeout(autoCloseTimer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [notice])

  // Saat modal terbuka: posisi di tengah, kunci scroll halaman, fokus ke input tag, Escape untuk menutup
  useEffect(() => {
    if (!isOpen) return

    setPos({ x: 0, y: 0 })

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = setTimeout(() => tagInputRef.current?.focus(), 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      // Kalau alert sedang tampil, Escape hanya menutup alert (ditangani effect di atas)
      if (e.key === 'Escape' && !noticeRef.current) onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Layar berubah ukuran / HP diputar / keyboard muncul: pastikan modal tidak keluar layar
  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => setPos((p) => clampPosition(p.x, p.y))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, clampPosition])

  // Saran user: yang belum dipilih dan cocok dengan yang diketik (tanda "@" di depan diabaikan)
  const typed = tagInput.trim().replace(/^@+/, '').toLowerCase()
  const suggestions = TAG_USERS.filter((u) => !tags.includes(u.id) && u.id.includes(typed))
  const showSuggestions = isSuggestOpen && suggestions.length > 0
  const highlighted = Math.min(activeIndex, Math.max(suggestions.length - 1, 0))

  const selectUser = (id: string) => {
    setTags((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setTagInput('')
    setActiveIndex(0)
    tagInputRef.current?.focus()
  }

  const removeTag = (id: string) => setTags((prev) => prev.filter((t) => t !== id))

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!suggestions.length) return
      e.preventDefault()
      setIsSuggestOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((highlighted + step + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      // Enter di input tag tidak boleh men-submit form
      e.preventDefault()
      const pick = suggestions[highlighted]
      if (pick) selectUser(pick.id)
    } else if (e.key === 'Escape' && showSuggestions) {
      // Tutup daftar saran saja, jangan menutup modal
      e.stopPropagation()
      setIsSuggestOpen(false)
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSending) return

    const text = message.trim()
    if (!text) {
      setMessageTouched(true)
      messageRef.current?.focus()
      return
    }

    // Kalau yang diketik persis nama user tapi belum dipilih, ikut dimasukkan
    const exact = TAG_USERS.find((u) => u.id === typed)
    const finalTags = exact && !tags.includes(exact.id) ? [...tags, exact.id] : tags

    const token = getToken()
    if (!token) {
      setNotice({
        type: 'error',
        title: 'Pesan gagal terkirim',
        text: 'Sesi login tidak ditemukan. Silakan login ulang.',
      })
      return
    }

    setIsSending(true)

    try {
      // Nama & email tidak dikirim: server mengambilnya dari token + sheet Users
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pesan: text, tags: finalTags }),
      })

      const result: { message?: string } = await res.json().catch(() => ({}))

      if (!res.ok) {
        setNotice({
          type: 'error',
          title: 'Pesan gagal terkirim',
          text:
            res.status === 401 || res.status === 403
              ? 'Sesi login habis atau tidak punya akses. Silakan login ulang.'
              : result.message || 'Gagal mengirim pesan. Coba lagi.',
        })
        return
      }

      onSendMessage?.({ tags: finalTags, message: text })
      setNotice({
        type: 'success',
        title: 'Pesan terkirim',
        text: 'Pesan Anda berhasil dikirim.',
      })

      setTags([])
      setTagInput('')
      setMessage('')
      setMessageTouched(false)
      onClose()
    } catch {
      setNotice({
        type: 'error',
        title: 'Pesan gagal terkirim',
        text: 'Tidak bisa terhubung ke server. Periksa koneksi Anda.',
      })
    } finally {
      setIsSending(false)
    }
  }

  // Alert di tengah layar (sukses / gagal). Dirender di luar pengecekan isOpen supaya
  // alert sukses tetap terlihat setelah modal menutup.
  const noticeView = notice && (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="message-alert-title"
      aria-describedby="message-alert-text"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setNotice(null)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 text-white border border-white/10 shadow-2xl px-6 py-7 text-center">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            notice.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}
        >
          {notice.type === 'success' ? (
            <FaCheckCircle className="text-3xl" aria-hidden="true" />
          ) : (
            <FaExclamationCircle className="text-3xl" aria-hidden="true" />
          )}
        </div>

        <h3 id="message-alert-title" className="text-base font-bold">
          {notice.title}
        </h3>
        <p id="message-alert-text" className="mt-1.5 text-sm text-gray-300">
          {notice.text}
        </p>

        <button
          ref={noticeButtonRef}
          type="button"
          onClick={() => setNotice(null)}
          className={`mt-5 w-full px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-colors active:scale-95 ${
            notice.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {notice.type === 'success' ? 'OK' : 'Tutup'}
        </button>
      </div>
    </div>
  )

  if (!isOpen) return <>{noticeView}</>

  return (
    <>
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: lebar penuh di HP, maks. 28rem di layar besar. Tinggi dibatasi dvh supaya aman
          saat keyboard HP muncul; isi form yang scroll, header tetap terlihat. */}
      <div
        ref={panelRef}
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
        className={`relative flex flex-col w-full max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh] rounded-2xl bg-slate-900 text-white border border-white/10 shadow-2xl ${
          isDragging ? 'shadow-black/60' : ''
        }`}
      >
        {/* Header = area untuk menggeser modal */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          onDoubleClick={resetPosition}
          title="Seret untuk memindahkan, klik dua kali untuk kembali ke tengah"
          className={`shrink-0 flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 border-b border-white/10 rounded-t-2xl select-none touch-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FaGripLines className="shrink-0 text-gray-500 text-sm" aria-hidden="true" />
            <h2 id="message-modal-title" className="text-base font-bold truncate">
              Kirim Pesan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-5 space-y-4"
        >
          {/* Tag */}
          <div>
            <label htmlFor="message-tag-input" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Tag
            </label>

            <div className="relative">
              <div
                className="flex flex-wrap items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus-within:border-red-500 transition-colors cursor-text"
                onClick={() => {
                  tagInputRef.current?.focus()
                  setIsSuggestOpen(true)
                }}
              >
                {tags.map((id) => (
                  <span
                    key={id}
                    className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-red-600/90 rounded-full text-xs font-medium"
                  >
                    @{id}
                    <button
                      type="button"
                      aria-label={`Hapus tag @${id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(id)
                      }}
                      className="p-0.5 rounded-full hover:bg-black/20 transition-colors"
                    >
                      <HiX className="text-xs" />
                    </button>
                  </span>
                ))}
                <input
                  id="message-tag-input"
                  ref={tagInputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-controls="message-tag-options"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    showSuggestions ? `message-tag-option-${suggestions[highlighted].id}` : undefined
                  }
                  autoComplete="off"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value)
                    setActiveIndex(0)
                    setIsSuggestOpen(true)
                  }}
                  onFocus={() => setIsSuggestOpen(true)}
                  onBlur={() => setIsSuggestOpen(false)}
                  onKeyDown={handleTagKeyDown}
                  maxLength={20}
                  disabled={tags.length >= TAG_USERS.length}
                  placeholder={tags.length ? '' : 'Pilih @developer atau @semidev'}
                  // text-base di HP mencegah iOS memperbesar layar otomatis saat input difokus
                  className="flex-1 min-w-[8rem] bg-transparent text-base sm:text-sm text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
                />
              </div>

              {showSuggestions && (
                <ul
                  id="message-tag-options"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 z-10 overflow-hidden rounded-xl bg-slate-800 border border-white/15 shadow-xl"
                >
                  {suggestions.map((user, i) => (
                    <li
                      key={user.id}
                      id={`message-tag-option-${user.id}`}
                      role="option"
                      aria-selected={i === highlighted}
                      // mouseDown + preventDefault supaya input tidak blur sebelum klik terbaca
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectUser(user.id)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`px-3.5 py-2.5 sm:py-2 text-sm cursor-pointer transition-colors ${
                        i === highlighted ? 'bg-red-600 text-white' : 'text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      {user.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-1.5 text-[11px] text-gray-400">
              Ketik atau pilih user yang ingin di-tag: @developer atau @semidev.
            </p>
          </div>

          {/* Pesan */}
          <div>
            <label htmlFor="message-body" className="block text-xs font-semibold text-gray-300 mb-1.5">
              Pesan
            </label>
            <textarea
              id="message-body"
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => setMessageTouched(true)}
              maxLength={MAX_MESSAGE}
              rows={5}
              required
              aria-invalid={messageTouched && !message.trim()}
              aria-describedby="message-body-hint"
              placeholder="Tulis pesan Anda di sini..."
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-base sm:text-sm text-white placeholder-gray-400 focus:bg-white/15 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
            <div id="message-body-hint" className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-red-400">
                {messageTouched && !message.trim() ? 'Pesan wajib diisi.' : ''}
              </span>
              <span className="text-gray-400">
                {message.length}/{MAX_MESSAGE}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <FaPaperPlane className="text-[11px]" />
              {isSending ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      </div>
    </div>
    {noticeView}
    </>
  )
}