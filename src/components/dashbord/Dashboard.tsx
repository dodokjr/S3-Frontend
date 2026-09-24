import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import LogoutModal from './LogoutModal';
import StockTab from './Tabs/StockTab';
import FinanceTab from './Tabs/FinanceTab';
import ServerTab from './Tabs/ServerTab';
import UsersTab from './Tabs/UsersTab';

interface Item {
  id: number;
  name: string;
  stock: number;
  price?: number;
}

interface UserAccount {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status?: string;
  password?: string;
}

export default function Dashboard() {
  const [isViewOnly, setIsViewOnly] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<string>('stock');

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [logoutInput, setLogoutInput] = useState<string>('');

  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('karyawan');

  // State untuk Notifikasi Modern dengan animasi slide-in dari kanan
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

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

  // Fetch data dari API users ketika tab 'users' aktif
  useEffect(() => {
    if (activeTab === 'users' && (userRole === 'developer' || userRole === 'admin')) {
      fetch('https://s3-backend-seven.vercel.app/s3/api/users')
        .then((res) => res.json())
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            const formattedUsers: UserAccount[] = result.data.map((item: any) => ({
              id: item.Id,
              name: item[' Name'] || item.name || '',
              email: item.Email || item.email || '',
              role: (item['role '] || item.role || 'karyawan').trim().toLowerCase(),
              status: item.status,
              password: item.Password || '',
            }));
            setUsersList(formattedUsers);
          }
        })
        .catch((err) => {
          console.error('Gagal mengambil data users:', err);
          showNotification('Gagal memuat data pengguna dari server.', 'error');
        });
    }
  }, [activeTab, userRole]);

  const handleLogoutConfirm = () => {
    if (logoutInput.toLowerCase() === 'keluar') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/s3/signup'; 
    }
  };

  const handleRoleChange = (targetId: number | string, newRoleTarget: string) => {
    const targetUser = usersList.find(u => u.id === targetId);
    
    if (userRole === 'admin') {
      if (targetUser?.role === 'developer') {
        showNotification('Admin tidak memiliki izin untuk mengubah role seorang Developer!', 'error');
        return;
      }
      if (newRoleTarget === 'developer') {
        showNotification('Admin tidak diizinkan mempromosikan user menjadi Developer!', 'error');
        return;
      }
    }

    setUsersList(usersList.map(u => u.id === targetId ? { ...u, role: newRoleTarget } : u));
    showNotification('Role pengguna berhasil diperbarui.');
  };

  const handleDeleteUser = (targetId: number | string) => {
    if (userRole !== 'developer') {
      showNotification('Hanya Developer yang dapat menghapus akun/role!', 'error');
      return;
    }
    setUsersList(usersList.filter(u => u.id !== targetId));
    showNotification('Akun pengguna berhasil dihapus.');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'developer') {
      showNotification('Hanya Developer yang dapat menambahkan role baru!', 'error');
      return;
    }
    if (!newUserName || !newUserEmail) {
      showNotification('Nama dan Email wajib diisi!', 'error');
      return;
    }

    const newUser: UserAccount = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'TRUE',
    };

    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('karyawan');
    showNotification('Role/User baru berhasil ditambahkan!');
  };

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

        {/* KONTEN TAB */}
        {activeTab === 'stock' && <StockTab items={items} isViewOnly={isViewOnly} />}
        {activeTab === 'finance' && !isViewOnly && <FinanceTab />}
        {activeTab === 'server' && userRole === 'developer' && <ServerTab />}
        {activeTab === 'users' && (userRole === 'developer' || userRole === 'admin') && (
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
      />
    </div>
  );
}