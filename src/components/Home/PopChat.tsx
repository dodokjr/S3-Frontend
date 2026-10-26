'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FiLogOut, FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { EmojiPicker, LinkifiedText } from '../utilities/PopChatShared';
import LogoS3 from '../../assets/LogoS3.svg';

// ==========================================
// KONFIGURASI
// ==========================================
const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';
const POLL_OPEN_MS = 5000; // cek pesan baru saat chat terbuka
const POLL_CLOSED_MS = 15000; // cek pesan baru saat chat tertutup (untuk badge)

const TOKEN_KEY = 'popchat_token';
const USER_KEY = 'popchat_user';
const SEEN_KEY = 'popchat_seen_cs_no';

// ==========================================
// TIPE
// ==========================================
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface CustomerUser {
  nama: string;
  email: string;
}

interface TokenData extends CustomerUser {
  token: string;
}

interface Reply {
  no: string;
  id: string;
  key: string;
  nama: string;
  email: string;
  pesan: string;
  pengirim: 'cs' | 'customer';
  tgl: string;
  reply_to: string;
}

interface Thread {
  no: string;
  id: string;
  key: string;
  nama: string;
  email: string;
  pesan: string;
  tgl: string;
  balasan: Reply[];
}

interface ChatMessage {
  no: string;
  nama: string;
  pesan: string;
  tgl: string;
  pengirim: 'cs' | 'customer';
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ==========================================
// HELPER
// ==========================================
const storage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* abaikan */
    }
  },
  del(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* abaikan */
    }
  },
};

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server.', 0);
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    /* respons bukan JSON */
  }

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(json?.message || `Terjadi kesalahan (${res.status}).`, res.status);
  }
  return json.data;
}

// Ratakan thread { ...pesanCustomer, balasan: [...] } menjadi satu timeline
function flatten(threads: Thread[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  threads.forEach((t) => {
    out.push({ no: t.no, nama: t.nama, pesan: t.pesan, tgl: t.tgl, pengirim: 'customer' });
    (t.balasan || []).forEach((b) => {
      out.push({ no: b.no, nama: b.nama, pesan: b.pesan, tgl: b.tgl, pengirim: b.pengirim || 'cs' });
    });
  });
  return out.sort((a, b) => Number(a.no) - Number(b.no));
}

function readUser(): CustomerUser | null {
  try {
    return JSON.parse(storage.get(USER_KEY) || 'null') as CustomerUser | null;
  } catch {
    return null;
  }
}

// ==========================================
// KOMPONEN
// ==========================================
export default function PopChat() {
  const [mounted, setMounted] = useState(false); // hindari mismatch SSR (Next.js)
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [seenNo, setSeenNo] = useState(0);

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [chatError, setChatError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Baca sesi tersimpan setelah mount
  useEffect(() => {
    setToken(storage.get(TOKEN_KEY));
    setUser(readUser());
    setSeenNo(Number(storage.get(SEEN_KEY) || 0));
    setMounted(true);
  }, []);

  const logout = useCallback(() => {
    storage.del(TOKEN_KEY);
    storage.del(USER_KEY);
    storage.del(SEEN_KEY);
    setToken(null);
    setUser(null);
    setMessages([]);
    setSeenNo(0);
    setChatError('');
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const threads = await request<Thread[]>('/popchat', { token });
      setMessages(flatten(threads || []));
      setChatError('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        setLoginError('Sesi berakhir, silakan isi data kamu lagi.');
      } else if (err instanceof Error) {
        setChatError(err.message);
      }
    }
  }, [token, logout]);

  // Polling: lebih sering saat chat terbuka
  useEffect(() => {
    if (!token) return;
    refresh();
    const timer = setInterval(refresh, open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => clearInterval(timer);
  }, [token, open, refresh]);

  // Tandai balasan CS sudah dibaca saat chat terbuka
  useEffect(() => {
    if (!open) return;
    const maxCs = messages
      .filter((m) => m.pengirim === 'cs')
      .reduce((max, m) => Math.max(max, Number(m.no)), 0);
    if (maxCs > seenNo) {
      setSeenNo(maxCs);
      storage.set(SEEN_KEY, String(maxCs));
    }
  }, [open, messages, seenNo]);

  // Scroll otomatis ke pesan terbaru
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages.length]);

  const unread = useMemo(
    () => messages.filter((m) => m.pengirim === 'cs' && Number(m.no) > seenNo).length,
    [messages, seenNo]
  );

  // ----- Aksi -----
  const handleLogin = async () => {
    const n = nama.trim();
    const e = email.trim();
    setLoginError('');

    if (!n || !e) return setLoginError('Nama dan email wajib diisi.');
    if (!/^\S+@\S+$/.test(e)) return setLoginError('Format email tidak valid.');

    setLoggingIn(true);
    try {
      const data = await request<TokenData>('/popchat/token', {
        method: 'POST',
        body: { nama: n, email: e },
      });
      const u: CustomerUser = { nama: data.nama, email: data.email };
      storage.set(TOKEN_KEY, data.token);
      storage.set(USER_KEY, JSON.stringify(u));
      setUser(u);
      setToken(data.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Gagal membuat sesi chat.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSend = async () => {
    const pesan = input.trim();
    if (!pesan || sending || !token) return;

    setSending(true);
    setChatError('');
    try {
      // Jika CS sudah pernah membalas -> balas ke CS (customer-reply).
      // Jika belum -> kirim pesan baru (createChat).
      const lastCs = [...messages].reverse().find((m) => m.pengirim === 'cs');
      if (lastCs) {
        await request('/popchat/customer-reply', {
          method: 'POST',
          token,
          body: { pesan, reply_to: lastCs.no },
        });
      } else {
        await request('/popchat', { method: 'POST', token, body: { pesan } });
      }
      setInput('');
      await refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        setLoginError('Sesi berakhir, silakan isi data kamu lagi.');
      } else {
        setChatError(err instanceof Error ? err.message : 'Gagal mengirim pesan.');
      }
    } finally {
      setSending(false);
    }
  };

  // Sisipkan emoji di posisi kursor
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      setInput((v) => v + emoji);
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? start;
    setInput(input.slice(0, start) + emoji + input.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onLoginKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLogin();
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[9999] flex flex-col items-end gap-3 font-sans sm:bottom-5 sm:left-auto sm:right-5">
      {open && (
        <div
          role="dialog"
          aria-label="Pop Chat"
          className="flex h-[75vh] max-h-[calc(100vh-110px)] w-full flex-col overflow-hidden rounded-2xl border border-black bg-white text-black shadow-2xl sm:h-[520px] sm:w-[360px]"
        >
          {/* Header */}
          <div className="flex items-center gap-1 border-b-4 border-red-600 bg-black py-3.5 pl-4 pr-3 text-white">
            <img
              src={LogoS3}
              alt="Logo S3"
              className="mr-2 h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px] font-semibold">Customer Service</strong>
              <small className="text-xs opacity-90">
                {token && user ? `Masuk sebagai ${user.nama}` : 'Kami siap membantu kamu'}
              </small>
            </div>
            {token && (
              <button
                type="button"
                onClick={logout}
                aria-label="Keluar"
                title="Keluar"
                className="flex rounded-lg p-1.5 hover:bg-red-600"
              >
                <FiLogOut size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="flex rounded-lg p-1.5 hover:bg-red-600"
            >
              <FiX size={20} />
            </button>
          </div>

          {!token ? (
            /* Form nama & email */
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
              <p className="text-sm leading-relaxed text-gray-600">
                Isi nama dan email kamu untuk memulai chat dengan tim kami.
              </p>
              <div>
                <label htmlFor="pc-nama" className="mb-1 block text-xs font-semibold">
                  Nama
                </label>
                <input
                  id="pc-nama"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  onKeyDown={onLoginKeyDown}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="pc-email" className="mb-1 block text-xs font-semibold">
                  Email
                </label>
                <input
                  id="pc-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={onLoginKeyDown}
                  className={inputCls}
                />
              </div>
              <div className="min-h-[18px] text-[13px] text-red-600">{loginError}</div>
              <button type="button" onClick={handleLogin} disabled={loggingIn} className={btnCls}>
                {loggingIn ? 'Memproses...' : 'Mulai Chat'}
              </button>
            </div>
          ) : (
            /* Percakapan */
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-gray-50 p-3.5">
                {messages.length === 0 ? (
                  <div className="m-auto px-5 text-center text-sm leading-relaxed text-gray-600">
                    Belum ada pesan. Tulis pesan pertamamu di bawah, tim kami akan segera membalas.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isCs = m.pengirim === 'cs';
                    return (
                      <div
                        key={m.no}
                        className={`flex max-w-[82%] flex-col gap-0.5 ${
                          isCs ? 'items-start self-start' : 'items-end self-end'
                        }`}
                      >
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm leading-snug ${
                            isCs
                              ? 'rounded-bl-sm bg-black text-white'
                              : 'rounded-br-sm bg-red-600 text-white'
                          }`}
                        >
                          <LinkifiedText
                            text={m.pesan}
                            linkClassName={
                              isCs ? 'text-red-400 underline hover:text-red-300' : 'font-medium text-white underline'
                            }
                          />
                        </div>
                        <div className="px-1 text-[11px] text-gray-600">
                          {isCs ? `${m.nama || 'CS'} · ` : ''}
                          {m.tgl}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {chatError && <div className="px-3 pb-1.5 text-[13px] text-red-600">{chatError}</div>}

              <div className="flex items-end gap-2 border-t border-black/10 bg-white p-2.5">
                <EmojiPicker onSelect={insertEmoji} variant="light" />
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Tulis pesan..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  className={`${inputCls} max-h-24 resize-none leading-snug`}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  aria-label="Kirim"
                  className={`${btnCls} !px-3`}
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-red-600 bg-black px-4 py-2 text-[10px] text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" aria-hidden="true" />
            <span>
              &copy; {new Date().getFullYear()} <strong className="font-semibold text-white">S3</strong> &middot;
              Customer Service
            </span>
          </div>
        </div>
      )}

      {/* Tombol floating */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Tutup chat' : 'Buka chat'}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl ring-2 ring-black hover:bg-red-700"
      >
        {open ? <FiX size={26} /> : <FiMessageCircle size={26} />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-black px-1 text-xs font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}

// ==========================================
// CLASS TAILWIND YANG DIPAKAI BERULANG
// ==========================================
const inputCls =
  'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600';

const btnCls =
  'flex items-center justify-center rounded-xl bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50';