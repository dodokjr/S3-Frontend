import { useEffect, useRef, useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
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

export default function MessageModal({ isOpen, onClose, onSendMessage }: MessageModalProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [message, setMessage] = useState('')
  const [messageTouched, setMessageTouched] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // Ref supaya effect di bawah tidak jalan ulang (dan mencuri fokus) tiap parent re-render
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Saat modal terbuka: kunci scroll halaman, fokus ke input tag, Escape untuk menutup
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = setTimeout(() => tagInputRef.current?.focus(), 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

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
      setErrorMessage('Sesi login tidak ditemukan. Silakan login ulang.')
      return
    }

    setIsSending(true)
    setErrorMessage('')

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
        setErrorMessage(
          res.status === 401 || res.status === 403
            ? 'Sesi login habis atau tidak punya akses. Silakan login ulang.'
            : result.message || 'Gagal mengirim pesan. Coba lagi.'
        )
        return
      }

      onSendMessage?.({ tags: finalTags, message: text })

      setTags([])
      setTagInput('')
      setMessage('')
      setMessageTouched(false)
      onClose()
    } catch {
      setErrorMessage('Tidak bisa terhubung ke server. Periksa koneksi Anda.')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 text-white border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 id="message-modal-title" className="text-base font-bold">
            Kirim Pesan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-5 py-5 space-y-4">
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
                  className="flex-1 min-w-[8rem] bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
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
                      className={`px-3.5 py-2 text-sm cursor-pointer transition-colors ${
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
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-400 focus:bg-white/15 focus:outline-none focus:border-red-500 transition-colors resize-none"
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

          {errorMessage && (
            <p
              role="alert"
              className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300"
            >
              {errorMessage}
            </p>
          )}

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
  )
}