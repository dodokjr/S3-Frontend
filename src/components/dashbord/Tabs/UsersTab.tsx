import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';

// ====== KONFIGURASI API (sesuai backend routes.js) ======
// GET    {API_BASE}/users   -> { success, data: [...] }   (password tidak dikirim server)
// POST   {API_BASE}/users   -> body { name, email, password, role, is_login }
// PUT    {API_BASE}/users   -> body { email, name?, password?, role?, is_login? }  (email = kunci user)
// DELETE {API_BASE}/users   -> body { email }
const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';
const POLL_INTERVAL_MS = 10000; // sinkronisasi otomatis tiap 10 detik

type UserStatus = 'TRUE' | 'FALSE';

interface UserAccount {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: UserStatus; // dipetakan dari kolom is_login di sheet
}

interface UsersTabProps {
  userRole: string;
}

// Urutan field form: name, password, email, role, status
interface UserForm {
  name: string;
  password: string;
  email: string;
  role: string;
  status: UserStatus;
}

// Role yang diterima backend (di luar daftar ini backend akan mengabaikannya).
const AVAILABLE_ROLES = ['developer', 'admin', 'karyawan', 'sales', 'finance', 'gudang'];
// Hanya role ini yang boleh tambah / edit / hapus / ganti role (sesuai allowDeveloperAndAdmin).
const MANAGER_ROLES = ['developer', 'admin'];

const EMPTY_FORM: UserForm = { name: '', password: '', email: '', role: 'karyawan', status: 'FALSE' };

const api = axios.create({ baseURL: API_BASE, headers: { Accept: 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RawUser = Record<string, unknown>;

const toStatus = (v: unknown): UserStatus => (String(v ?? '').trim().toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE');

// Backend membalas { success, data: [...] }; array langsung / { users: [] } juga didukung.
const extractList = (payload: unknown): RawUser[] => {
  if (Array.isArray(payload)) return payload as RawUser[];
  if (payload && typeof payload === 'object') {
    const obj = payload as { users?: unknown; data?: unknown };
    if (Array.isArray(obj.data)) return obj.data as RawUser[];
    if (Array.isArray(obj.users)) return obj.users as RawUser[];
  }
  return [];
};

const normalizeUsers = (payload: unknown): UserAccount[] =>
  extractList(payload)
    .map((raw) => ({
      id: (raw.id as string | number | undefined) ?? '',
      name: String(raw.name ?? ''),
      email: String(raw.email ?? ''),
      role: String(raw.role ?? '').trim().toLowerCase(),
      status: toStatus(raw.is_login ?? raw.status),
    }))
    .filter((u) => u.email !== '');

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
    const msg = (err.response.data as { message?: string } | undefined)?.message;
    if (msg) return msg;
    if (err.response.status === 401) return 'Sesi login berakhir. Silakan login ulang.';
    if (err.response.status === 403) return 'Anda tidak punya akses untuk aksi ini.';
    if (err.response.status === 429) return 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.';
    return err.message || 'Terjadi kesalahan pada jaringan atau server.';
  }
  return err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.';
};

export default function UsersTab({ userRole }: UsersTabProps) {
  const canManage = MANAGER_ROLES.includes((userRole || '').trim().toLowerCase());
  // ID, Nama, Email, Role, Status (+ Ganti Role, Aksi untuk yang boleh mengelola)
  const columnCount = canManage ? 7 : 5;

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [editingEmail, setEditingEmail] = useState<string | null>(null); // email = kunci user di backend
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  // Hitung mutasi yang sedang berjalan supaya polling tidak menimpa update optimistik.
  const pendingMutations = useRef<number>(0);
  // Selalu simpan data terbaru supaya snapshot rollback akurat.
  const usersRef = useRef<UserAccount[]>([]);
  usersRef.current = users;

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
    // Hemat kuota: jangan polling saat tab sedang tidak dibuka
    if (silent && typeof document !== 'undefined' && document.hidden) return;
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
    const snapshot = usersRef.current;
    setUsers(optimistic(snapshot));
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
    setEditingEmail(null);
    setShowFormPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || isSubmitting) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const role = form.role.trim().toLowerCase();

    if (!name || !email || !role) {
      showNotice('Nama, email, dan role wajib diisi!', 'error');
      return;
    }
    if (!AVAILABLE_ROLES.includes(role)) {
      showNotice('Role tidak valid. Pilih salah satu dari daftar.', 'error');
      return;
    }
    if (editingEmail === null && !form.password) {
      showNotice('Password wajib diisi untuk user baru!', 'error');
      return;
    }
    if (editingEmail === null && users.some((u) => sameEmail(u.email, email))) {
      showNotice('Email sudah terdaftar. Gunakan email lain.', 'error');
      return;
    }

    const isActive = form.status === 'TRUE';
    setIsSubmitting(true);

    try {
      if (editingEmail !== null) {
        // UPDATE: backend mencari user lewat email; password hanya dikirim kalau diisi
        const payload: Record<string, unknown> = { email: editingEmail, name, role, is_login: isActive };
        if (form.password) payload.password = form.password;

        const ok = await runMutation(
          (prev) =>
            prev.map((u) => (sameEmail(u.email, editingEmail) ? { ...u, name, role, status: form.status } : u)),
          () => api.put('/users', payload),
          'User berhasil diperbarui.'
        );
        if (ok) resetForm();
      } else {
        // CREATE
        const payload = { name, email, password: form.password, role, is_login: isActive };
        const tempId = `tmp-${Date.now()}`;

        const ok = await runMutation(
          (prev) => [...prev, { id: tempId, name, email, role, status: form.status }],
          () => api.post('/users', payload),
          'User baru berhasil ditambahkan.'
        );
        if (ok) resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (usr: UserAccount) => {
    setEditingEmail(usr.email);
    setForm({
      name: usr.name,
      password: '', // dikosongkan; isi hanya kalau ingin mengganti password
      email: usr.email,
      role: usr.role,
      status: usr.status,
    });
    setShowFormPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ====== UPDATE cepat: ganti role langsung dari tabel ======
  const handleRoleChange = (targetEmail: string, newRole: string) => {
    if (!canManage) return;
    runMutation(
      (prev) => prev.map((u) => (sameEmail(u.email, targetEmail) ? { ...u, role: newRole } : u)),
      () => api.put('/users', { email: targetEmail, role: newRole }),
      'Role berhasil diubah.'
    );
  };

  // ====== DELETE ======
  const handleDeleteUser = (usr: UserAccount) => {
    if (!canManage) return;
    if (!window.confirm(`Hapus user "${usr.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    if (editingEmail !== null && sameEmail(editingEmail, usr.email)) resetForm();
    runMutation(
      (prev) => prev.filter((u) => !sameEmail(u.email, usr.email)),
      () => api.delete('/users', { data: { email: usr.email } }),
      'User berhasil dihapus.'
    );
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
    'w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed';

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

      {/* Form Tambah / Edit User (Developer & Admin) */}
      {canManage && (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingEmail !== null ? 'Edit User' : 'Tambah User Baru'}
            </h3>
            {editingEmail !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Batal edit
              </button>
            )}
          </div>

          {/* Urutan field: name, password, email, role, status */}
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
              <label htmlFor="user-password" className="block text-[10px] text-zinc-400 mb-1">
                Password {editingEmail !== null && <span className="text-zinc-600">(kosongkan jika tidak diubah)</span>}
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showFormPassword ? 'text' : 'password'}
                  placeholder={editingEmail !== null ? 'Password baru' : '••••••••'}
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
              <label htmlFor="user-email" className="block text-[10px] text-zinc-400 mb-1">
                Email {editingEmail !== null && <span className="text-zinc-600">(tidak bisa diubah)</span>}
              </label>
              <input
                id="user-email"
                type="email"
                placeholder="email@contoh.com"
                value={form.email}
                disabled={editingEmail !== null}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="user-role" className="block text-[10px] text-zinc-400 mb-1">
                Role
              </label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user-status" className="block text-[10px] text-zinc-400 mb-1">
                Status
              </label>
              <select
                id="user-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}
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
            {isSubmitting ? 'Menyimpan...' : editingEmail !== null ? 'Simpan Perubahan' : 'Tambahkan User'}
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

      {/* Tabel Daftar Pengguna (password tidak ditampilkan; server memang tidak mengirimnya) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              {canManage && <th className="py-3 px-4">Ganti Role</th>}
              {canManage && <th className="py-3 px-4">Aksi</th>}
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

                return (
                  <tr
                    key={`${usr.email}-${usr.id}`}
                    className={`hover:bg-zinc-900/40 transition-colors ${isTemp ? 'opacity-60' : ''} ${
                      editingEmail !== null && sameEmail(editingEmail, usr.email) ? 'bg-zinc-900/60' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-zinc-400">{isTemp ? '...' : usr.id}</td>
                    <td className="py-3 px-4 font-medium text-white">{usr.name}</td>
                    <td className="py-3 px-4 text-zinc-400">{usr.email}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-red-500">{usr.role}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          usr.status === 'TRUE'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {usr.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4">
                        <select
                          value={usr.role}
                          disabled={isTemp}
                          onChange={(e) => handleRoleChange(usr.email, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-red-600 disabled:opacity-50"
                        >
                          {roleOptions.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {canManage && (
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
                  {search
                    ? 'Tidak ada pengguna yang cocok dengan pencarian.'
                    : canManage
                      ? 'Belum ada pengguna. Tambahkan lewat form di atas.'
                      : 'Belum ada data pengguna.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}