import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardHeader from './DashboardHeader';
import LogoutModal from './LogoutModal';
import StockTab from './Tabs/StockTab';
import FinanceTab from './Tabs/FinanceTab';
import ServerTab from './Tabs/ServerTab';
import UsersTab from './Tabs/UsersTab';

interface Item {
  No_ID: number | string;
  Nama_Barang: string;
  Box?: number | string;
  PerPcs: number | string;
  PerDus: number | string;
  Harga?: number | string;
  Satuan: string;
  Gambar: string;
}

interface UserAccount {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status?: string;
  password?: string;
}

const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';

export default function Dashboard() {
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [activeTab, setActiveTab] = useState('stock');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutInput, setLogoutInput] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('karyawan');

  // State untuk Notifikasi Modern dengan animasi slide-in dari kanan
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ message, type });
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimeoutRef.current = null;
    }, 3500);
  };

  // Bersihkan timeout notifikasi saat komponen unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Helper: ambil token JWT tersimpan dan bentuk header Authorization.
  // Dipusatkan di satu tempat supaya semua fetch yang butuh proteksi
  // memakai token yang sama, konsisten dengan backend yang sekarang
  // memvalidasi JWT di setiap route yang dilindungi.
  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    return token
      ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  }, []);

  useEffect(() => {
    const localRole = localStorage.getItem('user_role');
    const localName = localStorage.getItem('user_name');
    const localEmail = localStorage.getItem('user_email');
    const sessionRole = sessionStorage.getItem('user_role');
    const sessionName = sessionStorage.getItem('user_name');
    const sessionEmail = sessionStorage.getItem('user_email');

    const activeRole = (localRole || sessionRole || '').toLowerCase();
    const activeName = localName || sessionName;
    const activeEmail = localEmail || sessionEmail;

    if (!activeRole && !activeName) {
      setIsViewOnly(true);
    } else {
      setUserRole(activeRole);
      setUserName(activeName || 'Pengguna');
      setUserEmail(activeEmail || '');
    }
  }, []);

  // Fetch data stock dari API dengan struktur data baru
  useEffect(() => {
    fetch(`${API_BASE}/stock`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const formattedItems: Item[] = result.data.map((item: any) => ({
            No_ID: item.No_ID || item.id || '',
            // Menangani kemungkinan spasi pada key "Nama_Barang " dari response API
            Nama_Barang: item['Nama_Barang '] || item.Nama_Barang || item.name || '',
            Box: item.Box || 0,
            PerPcs: item.PerPcs || 0,
            PerDus: item.PerDus || 0,
            Harga: item.Harga || 0,
            Satuan: item.Satuan || '',
            Gambar: item.Gambar || '',
          }));
          setItems(formattedItems);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data stock:', err);
        showNotification('Gagal memuat data stock dari server.', 'error');
      });
  }, []);

  // Fungsi bantu untuk memuat ulang daftar user dari server.
  // Backend melakukan headers.map(h => h.trim().toLowerCase()) sebelum
  // mengirim response, sehingga semua key yang dikirim SELALU lowercase
  // (id, name, email, role, is_login).
  const fetchUsers = useCallback(() => {
    fetch(`${API_BASE}/users`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const formattedUsers: UserAccount[] = result.data.map((item: any) => ({
            id: item.id ?? '',
            name: item.name || '',
            email: item.email || '',
            role: (item.role || 'karyawan').trim().toLowerCase(),
            status: item.is_login === true || item.is_login === 'TRUE' ? 'TRUE' : 'FALSE',
            // Password sengaja tidak diminta/ditampilkan; backend juga tidak
            // lagi mengirimkannya (lihat perbaikan endpoint GET /users).
          }));
          setUsersList(formattedUsers);
        } else if (result.message) {
          showNotification(result.message, 'error');
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data users:', err);
        showNotification('Gagal memuat data pengguna dari server.', 'error');
      });
  }, [getAuthHeaders]);

  // Fetch data dari API users ketika tab 'users' aktif
  useEffect(() => {
    if (activeTab === 'users' && (userRole === 'developer' || userRole === 'admin' || userRole === 'semi dev')) {
      fetchUsers();
    }
  }, [activeTab, userRole, fetchUsers]);

  // Memanggil endpoint logout di server (dengan token JWT sebagai bukti
  // identitas) sebelum membersihkan sesi lokal dan redirect.
  const handleLogoutConfirm = async () => {
    if (logoutInput.toLowerCase() !== 'keluar') return;

    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error('Gagal memproses logout di server:', err);
    } finally {
      setIsLoggingOut(false);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/s3/signup';
    }
  };

  // Memanggil PUT /users, lalu memperbarui state lokal hanya setelah
  // server mengonfirmasi berhasil.
  const handleRoleChange = async (targetId: number | string, newRoleTarget: string) => {
    if (userRole === 'semi dev') {
      showNotification('Semi Dev tidak memiliki izin untuk mengubah role pengguna!', 'error');
      return;
    }

    const targetUser = usersList.find(u => u.id === targetId);

    if (userRole === 'admin') {
      if (targetUser?.role === 'developer' || targetUser?.role === 'semi dev') {
        showNotification('Admin tidak memiliki izin untuk mengubah role seorang Developer/Semi Dev!', 'error');
        return;
      }
      if (newRoleTarget === 'developer' || newRoleTarget === 'semi dev') {
        showNotification('Admin tidak diizinkan mempromosikan user menjadi Developer/Semi Dev!', 'error');
        return;
      }
    }

    if (!targetUser?.email) {
      showNotification('Email pengguna tidak ditemukan, tidak bisa memperbarui role.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: targetUser.email, role: newRoleTarget }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        showNotification(result.message || 'Gagal memperbarui role pengguna.', 'error');
        return;
      }

      setUsersList(usersList.map(u => u.id === targetId ? { ...u, role: newRoleTarget } : u));
      showNotification('Role pengguna berhasil diperbarui.');
    } catch (err) {
      console.error('Gagal memperbarui role:', err);
      showNotification('Gagal menghubungi server untuk memperbarui role.', 'error');
    }
  };

  // Memanggil DELETE /users dengan email target, baru menghapus dari
  // state lokal setelah server mengonfirmasi berhasil.
  const handleDeleteUser = async (targetId: number | string) => {
    if (userRole === 'semi dev') {
      showNotification('Semi Dev tidak memiliki izin untuk menghapus akun/role!', 'error');
      return;
    }
    if (userRole !== 'developer') {
      showNotification('Hanya Developer yang dapat menghapus akun/role!', 'error');
      return;
    }

    const targetUser = usersList.find(u => u.id === targetId);
    if (!targetUser?.email) {
      showNotification('Email pengguna tidak ditemukan, tidak bisa menghapus akun.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: targetUser.email }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        showNotification(result.message || 'Gagal menghapus akun pengguna.', 'error');
        return;
      }

      setUsersList(usersList.filter(u => u.id !== targetId));
      showNotification('Akun pengguna berhasil dihapus.');
    } catch (err) {
      console.error('Gagal menghapus user:', err);
      showNotification('Gagal menghubungi server untuk menghapus akun.', 'error');
    }
  };

  // Memanggil POST /users, lalu memuat ulang daftar dari server untuk
  // mendapatkan id sebenarnya yang di-generate backend (auto-increment).
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'semi dev') {
      showNotification('Semi Dev tidak memiliki izin untuk menambahkan role baru!', 'error');
      return;
    }
    if (userRole !== 'developer') {
      showNotification('Hanya Developer yang dapat menambahkan role baru!', 'error');
      return;
    }
    if (!newUserName || !newUserEmail) {
      showNotification('Nama dan Email wajib diisi!', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          is_login: false,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        showNotification(result.message || 'Gagal menambahkan user baru.', 'error');
        return;
      }

      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('karyawan');
      showNotification('Role/User baru berhasil ditambahkan!');
      fetchUsers(); // muat ulang daftar agar mencerminkan data server
    } catch (err) {
      console.error('Gagal menambah user:', err);
      showNotification('Gagal menghubungi server untuk menambah user.', 'error');
    }
  };

  // Role yang diizinkan mengakses tab Server & Manajemen Role
  const canAccessServer = userRole === 'developer' || userRole === 'semi dev';
  const canAccessUsers = userRole === 'developer' || userRole === 'admin' || userRole === 'semi dev';

  return (
    <div className="bg-black text-white font-sans antialiased min-h-screen p-6 selection:bg-red-600 selection:text-white relative overflow-x-hidden">

      {/* Toast Notifikasi Animasi Geser dari Kanan ke Kiri */}
      <div className="fixed top-6 right-6 z-50 pointer-events-none">
        {notification && (
          <div className="transform translate-x-0 opacity-100 transition-all duration-300 ease-out animate-[slideInRight_0.3s_ease-out]">
            <div className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-medium shadow-2xl backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-zinc-900/95 border-emerald-800/80 text-emerald-400'
                : 'bg-zinc-900/95 border-red-800/80 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
              {notification.message}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Dashboard */}
        <DashboardHeader
          isViewOnly={isViewOnly}
          userRole={userRole}
          userName={userName}
          onOpenLogout={() => {
            setLogoutInput('');
            setShowLogoutModal(true);
          }}
        />

        {/* Tab Navigasi Menu */}
        {!isViewOnly && (
          <div className="flex flex-wrap gap-2 bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
            <button
              onClick={() => setActiveTab('stock')}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stock' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Laporan Stock
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'finance' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Laporan Keuangan
            </button>

            {canAccessServer && (
              <button
                onClick={() => setActiveTab('server')}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'server' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Pengaturan Server
              </button>
            )}

            {canAccessUsers && (
              <button
                onClick={() => setActiveTab('users')}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'users' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Manajemen Role
              </button>
            )}
          </div>
        )}

        {/* KONTEN TAB */}
        {activeTab === 'stock' && <StockTab items={items} isViewOnly={isViewOnly} />}

        {/* PERBAIKAN: FinanceTab sebelumnya dirender tanpa props sama sekali
            (<FinanceTab />), padahal komponen itu sekarang butuh isViewOnly,
            userRole, dan getAuthHeaders untuk menampilkan form tambah
            transaksi dan mengirim token JWT saat submit. Tanpa ini, form
            tambah pemasukan/pengeluaran tidak akan pernah muncul karena
            userRole di dalam FinanceTab selalu undefined. */}
        {activeTab === 'finance' && !isViewOnly && (
          <FinanceTab
            isViewOnly={isViewOnly}
            userRole={userRole}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'server' && canAccessServer && <ServerTab />}
        {activeTab === 'users' && canAccessUsers && (
          <UsersTab
            usersList={usersList}
            userRole={userRole}
            newUserName={newUserName}
            setNewUserName={setNewUserName}
            newUserEmail={newUserEmail}
            setNewUserEmail={setNewUserEmail}
            newUserRole={newUserRole}
            setNewUserRole={setNewUserRole}
            handleAddUser={handleAddUser}
            handleRoleChange={handleRoleChange}
            handleDeleteUser={handleDeleteUser}
          />
        )}

      </div>

      {/* Modal Konfirmasi Log Out */}
      <LogoutModal
        isOpen={showLogoutModal}
        logoutInput={logoutInput}
        setLogoutInput={setLogoutInput}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isSubmitting={isLoggingOut}
      />
    </div>
  );
}