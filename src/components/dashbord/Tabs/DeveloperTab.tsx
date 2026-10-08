import { useCallback, useEffect, useRef, useState } from 'react';

interface DeveloperTabProps {
  userRole: string;
  getAuthHeaders: () => HeadersInit;
}

type MessageStatus = 'unread' | 'read' | 'pending' | 'success';

interface MessageItem {
  id: string;
  nama: string;
  email: string;
  pesan: string;
  tag: string[];
  status?: MessageStatus;
  statusLabel?: string;
}

type SubTab = 'logs' | 'api' | 'env' | 'database' | 'messages';
type TagFilter = 'all' | 'developer' | 'semidev';
type StatusFilter = 'all' | MessageStatus;

const API_MESSAGES_URL = 'https://s3-backend-seven.vercel.app/s3/api/messages';

// Role yang boleh mengubah status (harus sama dengan VIEW_ALL_ROLES di backend)
const CAN_EDIT_STATUS_ROLES = ['admin', 'developer'];

const STATUS_ORDER: MessageStatus[] = ['unread', 'read', 'pending', 'success'];

const STATUS_META: Record<MessageStatus, { label: string; badge: string; active: string }> = {
  unread: {
    label: 'Belum dibaca',
    badge: 'bg-blue-950/80 border-blue-800 text-blue-400',
    active: 'bg-blue-600 text-white border-blue-600',
  },
  read: {
    label: 'Dibaca',
    badge: 'bg-zinc-900 border-zinc-700 text-zinc-300',
    active: 'bg-zinc-600 text-white border-zinc-600',
  },
  pending: {
    label: 'Sedang dikerjakan',
    badge: 'bg-amber-950/60 border-amber-800/60 text-amber-400',
    active: 'bg-amber-600 text-white border-amber-600',
  },
  success: {
    label: 'Selesai',
    badge: 'bg-emerald-950 border-emerald-800 text-emerald-400',
    active: 'bg-emerald-600 text-white border-emerald-600',
  },
};

const getStatus = (m: MessageItem): MessageStatus =>
  m.status && STATUS_ORDER.includes(m.status) ? m.status : 'unread';

export default function DeveloperTab({ userRole, getAuthHeaders }: DeveloperTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('logs');

  // Pesan (GET /s3/api/messages)
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [tagFilter, setTagFilter] = useState<TagFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Ubah status (PATCH /s3/api/messages/:id/status)
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusError, setStatusError] = useState('');

  const canEditStatus = CAN_EDIT_STATUS_ROLES.includes((userRole || '').toLowerCase());

  // Ref supaya fetch tidak ikut berubah kalau parent membuat ulang getAuthHeaders tiap render
  const authHeadersRef = useRef(getAuthHeaders);
  useEffect(() => {
    authHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

  const fetchMessages = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingMessages(true);
    setMessagesError('');

    try {
      const res = await fetch(API_MESSAGES_URL, {
        headers: authHeadersRef.current(),
        signal,
      });
      const result: { data?: MessageItem[]; message?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setMessagesError(
          res.status === 401 || res.status === 403
            ? 'Sesi login habis atau tidak punya akses. Silakan login ulang.'
            : result.message || 'Gagal memuat pesan.'
        );
        return;
      }

      setMessages(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessagesError('Tidak bisa terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Muat pesan setiap kali sub tab "Messages" dibuka
  useEffect(() => {
    if (activeSubTab !== 'messages') return;
    const controller = new AbortController();
    fetchMessages(controller.signal);
    return () => controller.abort();
  }, [activeSubTab, fetchMessages]);

  // Ubah status pesan: update tampilan langsung (optimistic), rollback kalau gagal
  const updateStatus = useCallback(
    async (id: string, next: MessageStatus) => {
      const target = messages.find((m) => m.id === id);
      if (!target || getStatus(target) === next || updatingId) return;

      const previous = getStatus(target);
      setStatusError('');
      setUpdatingId(id);
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, status: next } : m)));

      try {
        const headers = new Headers(authHeadersRef.current());
        headers.set('Content-Type', 'application/json');

        const res = await fetch(`${API_MESSAGES_URL}/${encodeURIComponent(id)}/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status: next }),
        });
        const result: { message?: string } = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            res.status === 401 || res.status === 403
              ? 'Tidak punya akses untuk mengubah status, atau sesi login habis.'
              : result.message || 'Gagal mengubah status.'
          );
        }
      } catch (err) {
        setMessages((list) => list.map((m) => (m.id === id ? { ...m, status: previous } : m)));
        setStatusError(
          err instanceof TypeError
            ? 'Tidak bisa terhubung ke server. Periksa koneksi Anda.'
            : (err as Error).message
        );
      } finally {
        setUpdatingId(null);
      }
    },
    [messages, updatingId]
  );

  const visibleMessages = messages.filter(
    (m) =>
      (tagFilter === 'all' || m.tag.includes(tagFilter)) &&
      (statusFilter === 'all' || getStatus(m) === statusFilter)
  );

  const statusCount = (s: MessageStatus) => messages.filter((m) => getStatus(m) === s).length;

  const subTabClass = (tab: SubTab) =>
    `text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
      activeSubTab === tab ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      {/* Header Tab */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Developer Console</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 uppercase tracking-wide">
              {userRole} Mode
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Panel kontrol pengembang untuk pemantauan sistem, log, dan konfigurasi API.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
          <button onClick={() => setActiveSubTab('logs')} className={subTabClass('logs')}>
            System Logs
          </button>
          <button onClick={() => setActiveSubTab('api')} className={subTabClass('api')}>
            API Endpoints
          </button>
          <button onClick={() => setActiveSubTab('database')} className={subTabClass('database')}>
            Database Status
          </button>
          <button onClick={() => setActiveSubTab('messages')} className={subTabClass('messages')}>
            Messages
            {statusCount('unread') > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                {statusCount('unread')}
              </span>
            )}
          </button>
          <button onClick={() => setActiveSubTab('env')} className={subTabClass('env')}>
            Environment
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Server Uptime</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">99.98%</p>
          <span className="text-[10px] text-zinc-400">Running for 14d 6h</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">API Latency</p>
          <p className="text-lg font-bold text-white mt-1">42 ms</p>
          <span className="text-[10px] text-emerald-400">Optimal response speed</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Active Sessions</p>
          <p className="text-lg font-bold text-white mt-1">12</p>
          <span className="text-[10px] text-zinc-400">Users currently online</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Errors (24h)</p>
          <p className="text-lg font-bold text-red-400 mt-1">0</p>
          <span className="text-[10px] text-emerald-400">No critical issues</span>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'logs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live Console Output</h3>
            <button className="text-[11px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 hover:bg-zinc-800">
              Clear Console
            </button>
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-2 h-64 overflow-y-auto">
            <div className="text-zinc-500">[2026-09-25 16:15:00] [INFO] System initialized successfully.</div>
            <div className="text-emerald-400">[2026-09-25 16:15:02] [SUCCESS] Database connected to pool (PostgreSQL).</div>
            <div className="text-zinc-400">[2026-09-25 16:16:10] [GET /s3/api/stock] 200 OK - 42ms</div>
            <div className="text-amber-400">[2026-09-25 16:16:45] [WARN] Auth token refresh triggered for user ID #8.</div>
            <div className="text-zinc-400">[2026-09-25 16:17:01] [GET /s3/api/users] 200 OK - 38ms</div>
          </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Registered API Endpoints</h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">GET</span>
                <span className="text-zinc-200">/s3/api/stock</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Public / Authenticated</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">GET</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Requires Bearer Token</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-bold">POST</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Dev Restricted</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-bold">DELETE</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Dev Restricted</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">GET</span>
                <span className="text-zinc-200">/s3/api/messages</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Requires Bearer Token</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-bold">POST</span>
                <span className="text-zinc-200">/s3/api/messages</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Requires Bearer Token</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold">PATCH</span>
                <span className="text-zinc-200">/s3/api/messages/:id/status</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Admin / Developer Only</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'messages' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Pesan Masuk</h3>
              {!isLoadingMessages && !messagesError && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {visibleMessages.length}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
                {(['all', 'developer', 'semidev'] as TagFilter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTagFilter(f)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                      tagFilter === f ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'Semua' : `@${f}`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchMessages()}
                disabled={isLoadingMessages}
                className="text-[11px] px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoadingMessages ? 'Memuat...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filter status */}
          <div className="flex flex-wrap gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 w-fit max-w-full">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'all' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Semua status ({messages.length})
            </button>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === s ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {STATUS_META[s].label} ({statusCount(s)})
              </button>
            ))}
          </div>

          {messagesError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-300"
            >
              <span>{messagesError}</span>
              <button
                onClick={() => fetchMessages()}
                className="shrink-0 px-2 py-1 rounded border border-red-800 hover:bg-red-950 text-red-200"
              >
                Coba lagi
              </button>
            </div>
          )}

          {statusError && (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-300"
            >
              <span>{statusError}</span>
              <button
                onClick={() => setStatusError('')}
                className="shrink-0 px-2 py-1 rounded border border-red-800 hover:bg-red-950 text-red-200"
              >
                Tutup
              </button>
            </div>
          )}

          {isLoadingMessages && messages.length === 0 && !messagesError && (
            <p className="text-xs text-zinc-500 py-6 text-center">Memuat pesan...</p>
          )}

          {!isLoadingMessages && !messagesError && visibleMessages.length === 0 && (
            <p className="text-xs text-zinc-500 py-6 text-center">
              {messages.length === 0
                ? 'Belum ada pesan.'
                : 'Tidak ada pesan dengan filter ini.'}
            </p>
          )}

          {visibleMessages.length > 0 && (
            <ul className="space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
              {visibleMessages.map((m) => {
                const status = getStatus(m);
                const isUpdating = updatingId === m.id;

                return (
                  <li
                    key={m.id}
                    className={`p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2 ${
                      status === 'unread' ? 'border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {m.nama || '(tanpa nama)'}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono truncate">{m.email}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_META[status].badge}`}
                        >
                          {STATUS_META[status].label}
                        </span>
                        {m.tag.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-red-400"
                          >
                            @{t}
                          </span>
                        ))}
                        <span className="text-[10px] font-mono text-zinc-600">#{m.id}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 whitespace-pre-wrap break-words">{m.pesan}</p>

                    {/* Ubah status (hanya admin & developer) */}
                    {canEditStatus && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-zinc-500 mr-1">Ubah status:</span>
                        {STATUS_ORDER.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(m.id, s)}
                            disabled={isUpdating || status === s}
                            className={`text-[10px] px-2 py-1 rounded border transition-all disabled:cursor-not-allowed ${
                              status === s
                                ? STATUS_META[s].active
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50'
                            }`}
                          >
                            {STATUS_META[s].label}
                          </button>
                        ))}
                        {isUpdating && <span className="text-[10px] text-zinc-500">Menyimpan...</span>}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {activeSubTab === 'database' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Database Pool Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg space-y-2">
              <p className="text-zinc-400 font-medium">Connection Details</p>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Host</span>
                <span className="font-mono text-zinc-300">s3-backend-seven.vercel.app</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-400 font-semibold">Connected</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">SSL</span>
                <span className="text-zinc-300">Enabled (TLS 1.3)</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg space-y-2">
              <p className="text-zinc-400 font-medium">Pool Metrics</p>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Active Connections</span>
                <span className="font-mono text-zinc-300">3 / 20</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Idle Connections</span>
                <span className="font-mono text-zinc-300">5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Max Connections</span>
                <span className="font-mono text-zinc-300">20</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'env' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Environment Configuration</h3>
            {userRole === 'semi dev' && (
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                Read-Only (Semi Dev Limit)
              </span>
            )}
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">NODE_ENV</span>
              <span className="text-emerald-400">"production"</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">API_BASE_URL</span>
              <span className="text-zinc-300">"https://s3-backend-seven.vercel.app/s3/api"</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">JWT_EXPIRATION</span>
              <span className="text-zinc-300">"8h"</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">DATABASE_SSL</span>
              <span className="text-emerald-400">true</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}