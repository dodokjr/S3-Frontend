import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

// ====== KONFIGURASI API (sesuaikan dengan backend kamu) ======
// GET    {API_BASE}/users        -> daftar user (array, atau { users: [] } / { data: [] })
// POST   {API_BASE}/users        -> tambah user
// PUT    {API_BASE}/users/:id    -> update user (partial)
// DELETE {API_BASE}/users/:id    -> hapus user
const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';
const POLL_INTERVAL_MS = 10000; // sinkronisasi otomatis tiap 10 detik

interface UserAccount {
  id: string | number;
  name: string;
  email: string;
  role: string;
  password?: string;
  status?: string; // 'TRUE' | 'FALSE'
}

interface UsersTabProps {
  userRole: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  status: 'TRUE' | 'FALSE';
}

// Daftar role yang sah di sistem, dipakai untuk saran input & dropdown ganti role.
const AVAILABLE_ROLES = ['developer', 'semi dev', 'admin', 'karyawan', 'users'];

const EMPTY_FORM: UserForm = { name: '', email: '', password: '', role: 'karyawan', status: 'TRUE' };

const api = axios.create({ baseURL: API_BASE, headers: { Accept: 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend bisa membalas array langsung atau dibungkus object; ratakan di sini.
const normalizeUsers = (payload: unknown): UserAccount[] => {
  if (Array.isArray(payload)) return payload as UserAccount[];
  if (payload && typeof payload === 'object') {
    const obj = payload as { users?: unknown; data?: unknown };
    if (Array.isArray(obj.users)) return obj.users as UserAccount[];
    if (Array.isArray(obj.data)) return obj.data as UserAccount[];
  }
  return [];
};

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message;
    return msg || err.message || 'Terjadi kesalahan pada jaringan atau server.';
  }
  return err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
};

export default function UsersTab({ userRole }: UsersTabProps) {
  const isDeveloper = userRole === 'developer';
  const columnCount = isDeveloper ? 8 : 7;

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<Set<string | number>>(new Set());
  const [search, setSearch] = useState<string>('');

  // Hitung mutasi yang sedang berjalan supaya polling tidak menimpa update optimistik.
  const pendingMutations = useRef<number>(0);

  const showNotice = (message: string, type: 'success' | 'error') => {
    setNotice({ message, type });
  };

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // ====== READ (realtime via polling) ======
  const fetchUsers = useCallback(async (silent = false) => {
    if (pendingMutations.current > 0) return;
    if (!silent) setIsSyncing(true);
    try {
      const res = await api.get('/users');
      if (pendingMutations.current > 0) return; // ada mutasi yang mulai selama request
      setUsers(normalizeUsers(res.data));
      setLastSync(new Date());
    } catch (err) {
      if (!silent) showNotice(getErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
      if (!silent) setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => fetchUsers(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // ====== Helper mutasi optimistik: update UI dulu, rollback kalau gagal ======
  const runMutation = async (
    optimistic: (prev: UserAccount[]) => UserAccount[],
    request: () => Promise<unknown>,
    successMessage: string
  ): Promise<boolean> => {
    let snapshot: UserAccount[] = [];
    setUsers((prev) => {
      snapshot = prev;
      return optimistic(prev);
    });
    pendingMutations.current += 1;
    try {
      await request();
      showNotice(successMessage, 'success');
      return true;
    } catch (err) {
      setUsers(snapshot);
      showNotice(getErrorMessage(err), 'error');
      return false;
    } finally {
      pendingMutations.current -= 1;
      fetchUsers(true); // sinkronkan dengan data asli server (id baru, dsb.)
    }
  };

  // ====== CREATE & UPDATE (form) ======
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowFormPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const role = form.role.trim().toLowerCase();

    if (!name || !email || !role) {
      showNotice('Nama, email, dan role wajib diisi!', 'error');
      return;
    }
    if (editingId === null && !form.password) {
      showNotice('Password wajib diisi untuk user baru!', 'error');
      return;
    }

    setIsSubmitting(true);

    if (editingId !== null) {
      // UPDATE: password hanya dikirim kalau diisi (kosong = tidak diubah)
      const payload: Partial<UserForm> = { name, email, role, status: form.status };
      if (form.password) payload.password = form.password;

      const ok = await runMutation(
        (prev) =>
          prev.map((u) =>
            u.id === editingId
              ? { ...u, name, email, role, status: form.status, ...(form.password ? { password: form.password } : {}) }
              : u
          ),
        () => api.put(`/users/${editingId}`, payload),
        'User berhasil diperbarui.'
      );
      if (ok) resetForm();
    } else {
      // CREATE
      const payload = { name, email, password: form.password, role, status: form.status };
      const tempId = `tmp-${Date.now()}`;

      const ok = await runMutation(
        (prev) => [...prev, { id: tempId, name, email, password: form.password, role, status: form.status }],
        () => api.post('/users', payload),
        'User baru berhasil ditambahkan.'
      );
      if (ok) resetForm();
    }

    setIsSubmitting(false);
  };

  const handleEdit = (usr: UserAccount) => {
    setEditingId(usr.id);
    setForm({
      name: usr.name,
      email: usr.email,
      password: '', // dikosongkan; isi hanya kalau ingin mengganti password
      role: usr.role,
      status: usr.status === 'TRUE' ? 'TRUE' : 'FALSE',
    });
    setShowFormPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ====== UPDATE cepat: ganti role langsung dari tabel ======
  const handleRoleChange = (targetId: string | number, newRole: string) => {
    runMutation(
      (prev) => prev.map((u) => (u.id === targetId ? { ...u, role: newRole } : u)),
      () => api.put(`/users/${targetId}`, { role: newRole }),
      'Role berhasil diubah.'
    );
  };

  // ====== DELETE ======
  const handleDeleteUser = (usr: UserAccount) => {
    if (!window.confirm(`Hapus user "${usr.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    if (editingId === usr.id) resetForm();
    runMutation(
      (prev) => prev.filter((u) => u.id !== usr.id),
      () => api.delete(`/users/${usr.id}`),
      'User berhasil dihapus.'
    );
  };

  const toggleReveal = (id: string | number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        String(u.name).toLowerCase().includes(q) ||
        String(u.email).toLowerCase().includes(q) ||
        String(u.role).toLowerCase().includes(q)
    );
  }, [users, search]);

  const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600';

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Manajemen Role & Pengguna
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1">
            {lastSync
              ? `Sinkron terakhir ${lastSync.toLocaleTimeString('id-ID')} • otomatis tiap ${POLL_INTERVAL_MS / 1000} detik`
              : 'Memuat data...'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchUsers()}
          disabled={isSyncing}
          className="bg-zinc-900 border border-zinc-800 hover:border-red-600 text-zinc-300 text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Notifikasi hasil aksi */}
      {notice && (
        <div
          role="status"
          className={`p-3 text-xs rounded-xl border ${
            notice.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              : 'bg-red-950/50 border-red-800 text-red-200'
          }`}
        >
          {notice.message}
        </div>
      )}

      {/* Form Tambah / Edit User (Hanya Developer) */}
      {isDeveloper && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId !== null ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Batal edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label htmlFor="user-name" className="block text-[10px] text-zinc-400 mb-1">
                Nama
              </label>
              <input
                id="user-name"
                type="text"
                placeholder="Nama pengguna"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="user-email" className="block text-[10px] text-zinc-400 mb-1">
                Email
              </label>
              <input
                id="user-email"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="user-password" className="block text-[10px] text-zinc-400 mb-1">
                Password {editingId !== null && <span className="text-zinc-600">(kosongkan jika tidak diubah)</span>}
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showFormPassword ? 'text' : 'password'}
                  placeholder={editingId !== null ? 'Password baru' : '••••••••'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-[10px] text-zinc-400 hover:text-red-500 cursor-pointer"
                >
                  {showFormPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="user-role" className="block text-[10px] text-zinc-400 mb-1">
                Role
              </label>
              <input
                id="user-role"
                type="text"
                list="role-suggestions"
                placeholder="cth: supervisor"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              />
              <datalist id="role-suggestions">
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="user-status" className="block text-[10px] text-zinc-400 mb-1">
                Status
              </label>
              <select
                id="user-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'TRUE' | 'FALSE' })}
                className={inputClass}
              >
                <option value="TRUE">TRUE (aktif)</option>
                <option value="FALSE">FALSE (nonaktif)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan User'}
          </button>
        </form>
      )}

      {/* Pencarian */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama, email, atau role..."
        className={`${inputClass} md:max-w-xs`}
      />

      {/* Tabel Daftar Pengguna */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Ganti Role</th>
              {isDeveloper && <th className="py-3 px-4">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={columnCount} className="py-6 text-center text-zinc-500">
                  Memuat data pengguna...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((usr) => {
                const roleOptions = AVAILABLE_ROLES.includes(usr.role)
                  ? AVAILABLE_ROLES
                  : [...AVAILABLE_ROLES, usr.role];
                const isTemp = String(usr.id).startsWith('tmp-');
                const isRevealed = revealed.has(usr.id);

                return (
                  <tr
                    key={usr.id}
                    className={`hover:bg-zinc-900/40 transition-colors ${isTemp ? 'opacity-60' : ''} ${
                      editingId === usr.id ? 'bg-zinc-900/60' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-zinc-400">{isTemp ? '...' : usr.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{usr.name}</td>
                    <td className="py-3 px-4 text-zinc-400">{usr.email}</td>
                    <td className="py-3 px-4">
                      {usr.password ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono text-zinc-400 max-w-[140px] truncate">
                            {isRevealed ? usr.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(usr.id)}
                            className="text-[10px] text-zinc-500 hover:text-red-500 cursor-pointer"
                          >
                            {isRevealed ? 'Sembunyi' : 'Lihat'}
                          </button>
                        </span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-red-500">{usr.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          usr.status === 'TRUE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {usr.status || 'FALSE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={usr.role}
                        disabled={isTemp}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-red-600 disabled:opacity-50"
                      >
                        {roleOptions.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                      </select>
                    </td>
                    {isDeveloper && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isTemp}
                            onClick={() => handleEdit(usr)}
                            className="bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-red-600 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isTemp}
                            onClick={() => handleDeleteUser(usr)}
                            className="bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columnCount} className="py-6 text-center text-zinc-500">
                  {search ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada pengguna. Tambahkan lewat form di atas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}