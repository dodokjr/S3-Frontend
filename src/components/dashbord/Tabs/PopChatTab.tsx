import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FiArrowLeft, FiMessageCircle, FiRefreshCw, FiSend, FiTrash2 } from 'react-icons/fi';
import { EmojiPicker, LinkifiedText } from '../../utilities/PopChatShared';

// ==========================================
// KONFIGURASI
// ==========================================
const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';
const POLL_MS = 5000; // cek pesan baru tiap 5 detik

// ==========================================
// TIPE
// ==========================================
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

interface Conversation {
  key: string;
  nama: string;
  email: string;
  messages: ChatMessage[];
  lastNo: number;
  needsReply: boolean; // pesan terakhir dari customer = belum dibalas
}

interface PopChatTabProps {
  userRole: string;
  getAuthHeaders: () => HeadersInit;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

// ==========================================
// HELPER
// ==========================================
const readStaffName = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('user_name') || sessionStorage.getItem('user_name') || '';
};

// Kelompokkan semua thread menjadi satu percakapan per customer (berdasarkan key)
function buildConversations(threads: Thread[]): Conversation[] {
  const map = new Map<string, Conversation>();

  threads.forEach((t) => {
    let conv = map.get(t.key);
    if (!conv) {
      conv = { key: t.key, nama: t.nama, email: t.email, messages: [], lastNo: 0, needsReply: false };
      map.set(t.key, conv);
    }
    conv.messages.push({ no: t.no, nama: t.nama, pesan: t.pesan, tgl: t.tgl, pengirim: 'customer' });
    (t.balasan || []).forEach((b) => {
      conv!.messages.push({ no: b.no, nama: b.nama, pesan: b.pesan, tgl: b.tgl, pengirim: b.pengirim || 'cs' });
    });
  });

  const list = Array.from(map.values());
  list.forEach((c) => {
    c.messages.sort((a, b) => Number(a.no) - Number(b.no));
    const last = c.messages[c.messages.length - 1];
    c.lastNo = last ? Number(last.no) : 0;
    c.needsReply = !!last && last.pengirim === 'customer';
  });

  // yang belum dibalas di atas, lalu yang terbaru
  return list.sort((a, b) => {
    if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1;
    return b.lastNo - a.lastNo;
  });
}

// ==========================================
// KOMPONEN
// ==========================================
export default function PopChatTab({ userRole, getAuthHeaders, onNotify }: PopChatTabProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const canReply = userRole === 'developer' || userRole === 'admin' || userRole === 'cs';
  const canDelete = userRole === 'developer' || userRole === 'admin';

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/popchat`, { headers: getAuthHeaders() });
        const json = await res.json().catch(() => null);

        if (!res.ok || !json?.success || !Array.isArray(json.data)) {
          throw new Error(json?.message || `Gagal memuat chat (${res.status}).`);
        }
        setThreads(json.data as Thread[]);
        setError('');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Gagal memuat chat.';
        setError(msg);
        if (!silent) onNotify?.(msg, 'error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [getAuthHeaders, onNotify]
  );

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(true), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const conversations = useMemo(() => buildConversations(threads), [threads]);
  const selected = useMemo(
    () => conversations.find((c) => c.key === selectedKey) || null,
    [conversations, selectedKey]
  );
  const pendingCount = useMemo(() => conversations.filter((c) => c.needsReply).length, [conversations]);

  // Scroll ke pesan terbaru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedKey, selected?.messages.length]);

  const handleSend = async () => {
    const pesan = input.trim();
    if (!pesan || !selected || sending || !canReply) return;

    setSending(true);
    try {
      const staffName = readStaffName();
      const res = await fetch(`${API_BASE}/popchat/reply`, {
        method: 'POST',
        headers: getAuthHeaders(),
        // reply_to dikosongkan -> backend membalas pesan customer terakhir di chat ini
        body: JSON.stringify({ key: selected.key, pesan, ...(staffName ? { nama: staffName } : {}) }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Gagal mengirim balasan (${res.status}).`);
      }
      setInput('');
      await load(true);
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Gagal mengirim balasan.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || deleting || !canDelete) return;
    if (!window.confirm(`Hapus seluruh chat dengan ${selected.nama}? Tindakan ini tidak bisa dibatalkan.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/popchat`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key: selected.key }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || `Gagal menghapus chat (${res.status}).`);
      }
      onNotify?.(json.message || 'Chat berhasil dihapus!', 'success');
      setSelectedKey(null);
      await load(true);
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Gagal menghapus chat.', 'error');
    } finally {
      setDeleting(false);
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

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <section className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header tab */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <FiMessageCircle className="text-red-500" size={18} />
          <h2 className="text-sm font-semibold">Balas Pop Chat</h2>
          {pendingCount > 0 && (
            <span className="text-[10px] font-semibold bg-red-600 text-white rounded-full px-2 py-0.5">
              {pendingCount} belum dibalas
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
        >
          <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Muat ulang
        </button>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] h-[560px]">
        {/* Daftar percakapan */}
        <div
          className={`${selectedKey ? 'hidden md:flex' : 'flex'} flex-col min-h-0 border-r border-zinc-800 overflow-y-auto`}
        >
          {error && <p className="px-4 py-3 text-xs text-red-400">{error}</p>}

          {!error && !loading && conversations.length === 0 && (
            <p className="px-4 py-8 text-xs text-zinc-500 text-center">Belum ada chat dari customer.</p>
          )}

          {loading && conversations.length === 0 && (
            <p className="px-4 py-8 text-xs text-zinc-500 text-center">Memuat chat...</p>
          )}

          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const active = c.key === selectedKey;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedKey(c.key)}
                className={`text-left px-4 py-3 border-b border-zinc-900 cursor-pointer transition-colors ${
                  active ? 'bg-zinc-900' : 'hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold truncate">{c.nama}</span>
                  {c.needsReply && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-label="Belum dibalas" />}
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{c.email}</p>
                {last && (
                  <p className="text-[11px] text-zinc-400 truncate mt-1">
                    {last.pengirim === 'cs' ? 'Kamu: ' : ''}
                    {last.pesan}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Percakapan terpilih */}
        <div className={`${selectedKey ? 'flex' : 'hidden md:flex'} flex-col min-h-0`}>
          {!selected ? (
            <div className="m-auto text-center text-xs text-zinc-500 px-6">
              Pilih salah satu chat di sebelah kiri untuk melihat dan membalas pesan.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedKey(null)}
                  className="md:hidden text-zinc-400 hover:text-white cursor-pointer"
                  aria-label="Kembali"
                >
                  <FiArrowLeft size={18} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{selected.nama}</p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {selected.email} · {selected.key}
                  </p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 disabled:opacity-50 cursor-pointer"
                  >
                    <FiTrash2 size={14} />
                    Hapus
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2.5">
                {selected.messages.map((m) => {
                  const isStaff = m.pengirim === 'cs';
                  return (
                    <div
                      key={m.no}
                      className={`max-w-[80%] flex flex-col gap-0.5 ${
                        isStaff ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm leading-snug whitespace-pre-wrap break-words ${
                          isStaff
                            ? 'bg-red-600 text-white rounded-br-sm'
                            : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                        }`}
                      >
                        <LinkifiedText
                          text={m.pesan}
                          linkClassName={isStaff ? 'text-white underline' : 'text-red-400 underline hover:text-red-300'}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 px-1">
                        {isStaff ? `${m.nama || 'CS'} · ` : ''}
                        {m.tgl}
                      </span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {canReply ? (
                <div className="flex items-end gap-2 p-3 border-t border-zinc-800">
                  <EmojiPicker onSelect={insertEmoji} variant="dark" />
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Tulis balasan... (Enter kirim, Shift+Enter baris baru)"
                    className="flex-1 resize-none max-h-28 bg-black border border-zinc-800 focus:border-red-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !input.trim()}
                    aria-label="Kirim balasan"
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-xl px-3.5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              ) : (
                <p className="px-4 py-3 border-t border-zinc-800 text-xs text-zinc-500">
                  Role kamu hanya bisa melihat chat, tidak bisa membalas.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}