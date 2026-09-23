import React, { useState, useEffect } from 'react';

interface Item {
  id: number;
  name: string;
  stock: number;
  price?: number;
}

interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: 'developer' | 'admin' | 'karyawan' | string;
}

export default function Dashboard() {
  const [isViewOnly, setIsViewOnly] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  
  // Tab Navigation: 'stock' | 'finance' | 'server' | 'users'
  const [activeTab, setActiveTab] = useState<string>('stock');

  // State untuk Modal Log Out
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [logoutInput, setLogoutInput] = useState<string>('');

  // State Manajemen Role & Users (Khusus Developer/Admin)
  const [usersList, setUsersList] = useState<UserAccount[]>([
    { id: 1, name: 'Muhammad Fikri Ardiyansah', email: 'fikri@admin.com', role: 'developer' },
    { id: 2, name: 'Budi Santoso', email: 'budi@admin.com', role: 'admin' },
    { id: 3, name: 'Siti Rahma', email: 'siti@karyawan.com', role: 'karyawan' },
  ]);

  // State form tambah role baru
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('karyawan');

  // Dummy data stock barang
  const items: Item[] = [
    { id: 1, name: 'Mata Boor Besi OSG Dia 0,6 mm', stock: 20, price: 50000 },
    { id: 2, name: 'Mitsubishi VCMT 160404', stock: 15, price: 125000 },
    { id: 3, name: 'Gas Lens 45V64 2.4 mm', stock: 8, price: 75000 },
    { id: 4, name: 'SUNON KD2406PHB2 Cooling Fan', stock: 12, price: 90000 },
  ];

  useEffect(() => {
    const localRole = localStorage.getItem('user_role');
    const localName = localStorage.getItem('user_name');
    const sessionRole = sessionStorage.getItem('user_role');
    const sessionName = sessionStorage.getItem('user_name');

    const activeRole = (localRole || sessionRole || '').toLowerCase();
    const activeName = localName || sessionName;

    if (!activeRole && !activeName) {
      setIsViewOnly(true);
    } else {
      setUserRole(activeRole);
      setUserName(activeName || 'Pengguna');
    }
  }, []);

  const handleLogoutConfirm = () => {
    if (logoutInput.toLowerCase() === 'keluar') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/s3/signup'; 
    }
  };

  // Fungsi Ganti Role (Admin tidak bisa ubah role developer kecuali dia developer)
  const handleRoleChange = (targetId: number, newRoleTarget: string) => {
    const targetUser = usersList.find(u => u.id === targetId);
    
    // Validasi aturan Admin
    if (userRole === 'admin') {
      if (targetUser?.role === 'developer') {
        alert('Admin tidak memiliki izin untuk mengubah role seorang Developer!');
        return;
      }
      if (newRoleTarget === 'developer') {
        alert('Admin tidak diizinkan mempromosikan user menjadi Developer!');
        return;
      }
    }

    setUsersList(usersList.map(u => u.id === targetId ? { ...u, role: newRoleTarget } : u));
  };

  // Fungsi Hapus Role/User (Hanya Developer)
  const handleDeleteUser = (targetId: number) => {
    if (userRole !== 'developer') {
      alert('Hanya Developer yang dapat menghapus akun/role!');
      return;
    }
    setUsersList(usersList.filter(u => u.id !== targetId));
  };

  // Fungsi Tambah Role/User Baru (Hanya Developer)
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'developer') {
      alert('Hanya Developer yang dapat menambahkan role baru!');
      return;
    }
    if (!newUserName || !newUserEmail) {
      alert('Nama dan Email wajib diisi!');
      return;
    }

    const newUser: UserAccount = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
    };

    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('karyawan');
    alert('Role/User baru berhasil ditambahkan!');
  };

  return (
    <div className="bg-black text-white font-sans antialiased min-h-screen p-6 selection:bg-red-600 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {isViewOnly ? 'Katalog Stock Barang' : `Dashboard ${userRole.toUpperCase()}`}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {isViewOnly ? 'Mode Publik / Viewer (Informasi Keuangan Disembunyikan)' : `Selamat datang kembali, ${userName}`}
            </p>
          </div>

          {!isViewOnly ? (
            <button
              onClick={() => {
                setLogoutInput('');
                setShowLogoutModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-900/20 cursor-pointer"
            >
              Log Out
            </button>
          ) : (
            <a
              href="/s3/signup"
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Sign Up
            </a>
          )}
        </div>

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
            
            {userRole === 'developer' && (
              <button
                onClick={() => setActiveTab('server')}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'server' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Pengaturan Server
              </button>
            )}

            {(userRole === 'developer' || userRole === 'admin') && (
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

        {/* KONTEN TAB: LAPORAN STOCK */}
        {activeTab === 'stock' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">Laporan Stock Barang</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Nama Barang</th>
                    <th className="py-3 px-4">Stock</th>
                    {!isViewOnly && <th className="py-3 px-4">Harga Satuan</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 text-zinc-500">{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
                          {item.stock} pcs
                        </span>
                      </td>
                      {!isViewOnly && (
                        <td className="py-3 px-4 text-emerald-400">
                          Rp {item.price?.toLocaleString('id-ID')}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KONTEN TAB: LAPORAN KEUANGAN */}
        {activeTab === 'finance' && !isViewOnly && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Laporan Keuangan & Transaksi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <p className="text-xs text-zinc-400">Total Pendapatan (Bulan Ini)</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">Rp 12.450.000</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <p className="text-xs text-zinc-400">Total Pengeluaran Procurement</p>
                <p className="text-lg font-bold text-red-400 mt-1">Rp 4.800.000</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                <p className="text-xs text-zinc-400">Saldo Bersih</p>
                <p className="text-lg font-bold text-white mt-1">Rp 7.650.000</p>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB: SERVER (KHUSUS DEVELOPER) */}
        {activeTab === 'server' && userRole === 'developer' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Pengaturan & Status Server</h2>
            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span>API Endpoint Status:</span>
                <span className="text-emerald-400 font-semibold">Online (Vercel Node.js)</span>
              </div>
              <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span>Database Connection:</span>
                <span className="text-emerald-400 font-semibold">Connected</span>
              </div>
              <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span>Environment:</span>
                <span className="text-yellow-400 font-semibold">Production</span>
              </div>
            </div>
          </div>
        )}

        {/* KONTEN TAB: MANAJEMEN ROLE */}
        {activeTab === 'users' && (userRole === 'developer' || userRole === 'admin') && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Manajemen Role & Pengguna</h2>
            
            {/* Form Tambah Role Baru (Hanya Developer) */}
            {userRole === 'developer' && (
              <form onSubmit={handleAddUser} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tambah Role / User Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nama Pengguna"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="email"
                    placeholder="Email Pengguna"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Role Baru (cth: supervisor)"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  Tambahkan Role Baru
                </button>
              </form>
            )}

            {/* Tabel Daftar Pengguna & Ubah Role */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Saat Ini</th>
                    <th className="py-3 px-4">Aksi Ganti Role</th>
                    {userRole === 'developer' && <th className="py-3 px-4">Hapus</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">{usr.name}</td>
                      <td className="py-3 px-4 text-zinc-400">{usr.email}</td>
                      <td className="py-3 px-4 uppercase font-semibold text-red-500">{usr.role}</td>
                      <td className="py-3 px-4">
                        <select
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-red-600"
                        >
                          <option value="developer">developer</option>
                          <option value="admin">admin</option>
                          <option value="karyawan">karyawan</option>
                          <option value={usr.role}>{usr.role}</option>
                        </select>
                      </td>
                      {userRole === 'developer' && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleDeleteUser(usr.id)}
                            className="bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer"
                          >
                            Hapus
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Modal Konfirmasi Log Out */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>
            
            <h3 className="text-sm font-bold tracking-tight text-white">Konfirmasi Log Out</h3>
            <p className="text-xs text-zinc-400">
              Untuk keluar dari sesi ini, silakan ketik kata <strong className="text-red-500">keluar</strong> pada kolom di bawah ini:
            </p>

            <input
              type="text"
              value={logoutInput}
              onChange={(e) => setLogoutInput(e.target.value)}
              placeholder="Ketik 'keluar' di sini"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={logoutInput.toLowerCase() !== 'keluar'}
                className={`text-xs font-medium px-4 py-2 rounded-xl transition-all ${
                  logoutInput.toLowerCase() === 'keluar'
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-900/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                }`}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}