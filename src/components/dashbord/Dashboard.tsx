import { useCallback, useEffect, useRef, useState } from 'react';
import DashboardHeader from './DashboardHeader';
import LogoutModal from './LogoutModal';
import StockTab from './Tabs/StockTab';
import FinanceTab from './Tabs/FinanceTab';
import ServerTab from './Tabs/ServerTab';
import UsersTab from './Tabs/UsersTab';
import SalesTab from './Tabs/SalesTab';
import DeveloperTab from './Tabs/DeveloperTab';

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

const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';

const normalizeRole = (role: unknown): string =>
  String(role ?? '').trim().toLowerCase();

const readStorageValue = (key: string): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(key) || sessionStorage.getItem(key) || '';
};

export default function Dashboard() {
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeTab, setActiveTab] = useState('stock');

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutInput, setLogoutInput] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      setNotification({ message, type });

      notificationTimeoutRef.current = setTimeout(() => {
        setNotification(null);
        notificationTimeoutRef.current = null;
      }, 3500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token =
      (typeof window !== 'undefined' &&
        (localStorage.getItem('admin_token') ||
          sessionStorage.getItem('admin_token'))) ||
      '';

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  useEffect(() => {
    const role = normalizeRole(readStorageValue('user_role'));
    const name = readStorageValue('user_name');

    if (!role && !name) {
      setIsViewOnly(true);
      return;
    }

    setIsViewOnly(false);
    setUserRole(role);
    setUserName(name || 'Pengguna');

    if (role === 'sales' || role === 'seles') {
      setActiveTab('sales');
    } else if (role === 'finance') {
      setActiveTab('finance');
    }
  }, []);

  const fetchStock = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/stock`, {
        headers: getAuthHeaders(),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || `Gagal memuat stock (${response.status}).`);
      }

      if (!result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || 'Format data stock dari server tidak valid.');
      }

      const formattedItems: Item[] = result.data.map((item: Record<string, unknown>) => ({
        No_ID: item.No_ID ?? item.id ?? '',
        Nama_Barang: String(item['Nama_Barang '] ?? item.Nama_Barang ?? item.name ?? ''),
        Box: item.Box ?? 0,
        PerPcs: item.PerPcs ?? 0,
        PerDus: item.PerDus ?? 0,
        Harga: item.Harga ?? 0,
        Satuan: String(item.Satuan ?? ''),
        Gambar: String(item.Gambar ?? ''),
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Gagal mengambil data stock:', error);
      showNotification(
        error instanceof Error ? error.message : 'Gagal memuat data stock dari server.',
        'error'
      );
    }
  }, [getAuthHeaders, showNotification]);

  useEffect(() => {
    void fetchStock();
  }, [fetchStock]);

  const handleLogoutConfirm = async () => {
    if (logoutInput.trim().toLowerCase() !== 'keluar' || isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Gagal memproses logout di server:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        window.location.assign('/s3/signup');
      }
    }
  };

  const canAccessServer = userRole === 'developer' || userRole === 'semi dev';
  const canAccessUsers =
    userRole === 'developer' || userRole === 'admin' || userRole === 'semi dev';
  const canAccessFinance =
    userRole === 'developer' ||
    userRole === 'admin' ||
    userRole === 'semi dev' ||
    userRole === 'finance';
  const canAccessSales =
    userRole === 'developer' ||
    userRole === 'admin' ||
    userRole === 'semi dev' ||
    userRole === 'sales' ||
    userRole === 'seles';
  const canAccessDeveloper = userRole === 'developer' || userRole === 'semi dev';

  const handleTabChange = (tab: string, allowed: boolean) => {
    if (allowed) setActiveTab(tab);
  };

  return (
    <div className="bg-black text-white font-sans antialiased min-h-screen p-6 selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      <div className="fixed top-6 right-6 z-50 pointer-events-none" aria-live="polite">
        {notification && (
          <div className="transform translate-x-0 opacity-100 transition-all duration-300 ease-out">
            <div
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-medium shadow-2xl backdrop-blur-md ${
                notification.type === 'success'
                  ? 'bg-zinc-900/95 border-emerald-800/80 text-emerald-400'
                  : 'bg-zinc-900/95 border-red-800/80 text-red-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  notification.type === 'success'
                    ? 'bg-emerald-500'
                    : 'bg-red-500'
                }`}
              />
              {notification.message}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <DashboardHeader
          isViewOnly={isViewOnly}
          userRole={userRole}
          userName={userName}
          onOpenLogout={() => {
            setLogoutInput('');
            setShowLogoutModal(true);
          }}
        />

        {!isViewOnly && (
          <div className="flex flex-wrap gap-2 bg-zinc-950 border border-zinc-800 p-2 rounded-xl">
            <button
              type="button"
              onClick={() => handleTabChange('stock', true)}
              className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Laporan Stock
            </button>

            {canAccessSales && (
              <button
                type="button"
                onClick={() => handleTabChange('sales', canAccessSales)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Penjualan (Sales)
              </button>
            )}

            {canAccessFinance && (
              <button
                type="button"
                onClick={() => handleTabChange('finance', canAccessFinance)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'finance'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Keuangan (Finance)
              </button>
            )}

            {canAccessServer && (
              <button
                type="button"
                onClick={() => handleTabChange('server', canAccessServer)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'server'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Pengaturan Server
              </button>
            )}

            {canAccessUsers && (
              <button
                type="button"
                onClick={() => handleTabChange('users', canAccessUsers)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Manajemen Role
              </button>
            )}

            {canAccessDeveloper && (
              <button
                type="button"
                onClick={() => handleTabChange('developer', canAccessDeveloper)}
                className={`text-xs font-medium px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'developer'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                Developer
              </button>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <StockTab
            items={items}
            isViewOnly={isViewOnly}
            userRole={userRole}
            getAuthHeaders={getAuthHeaders}
            onRefresh={fetchStock}
          />
        )}

        {activeTab === 'sales' && canAccessSales && (
          <SalesTab
            items={items}
            isViewOnly={isViewOnly}
            userRole={userRole}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'finance' && canAccessFinance && (
          <FinanceTab
            isViewOnly={isViewOnly}
            userRole={userRole}
            getAuthHeaders={getAuthHeaders}
          />
        )}

        {activeTab === 'server' && canAccessServer && <ServerTab />}

        {activeTab === 'users' && canAccessUsers && (
          <UsersTab userRole={userRole} />
        )}

        {activeTab === 'developer' && canAccessDeveloper && (
          <DeveloperTab userRole={userRole} getAuthHeaders={getAuthHeaders} />
        )}
      </div>

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
