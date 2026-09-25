import React, { useState, useEffect, useCallback } from 'react';

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

interface SalesTabProps {
  items: Item[];
  isViewOnly: boolean;
  userRole: string;
  getAuthHeaders: () => HeadersInit;
}

interface SaleData {
  id?: string;
  Deskripsi: string;
  Costumer: string;
  'harga jual': string;
  'harga beli': string;
  tgl: string;
  status: string;
  nama_seles: string;
  satuan?: string;
  jumlah?: number | string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type UnitTab = 'Pcs' | 'Pack' | 'Kilogram';

export default function SalesTab({
  items,
  isViewOnly,
  userRole,
  getAuthHeaders,
}: SalesTabProps) {
  // Tab Satuan Form (Pcs / Pack / Kilogram)
  const [activeUnitTab, setActiveUnitTab] = useState<UnitTab>('Pcs');

  // Toggle Mode Input (Database vs Manual)
  const [inputMode, setInputMode] = useState<'database' | 'manual'>('database');

  // State Form Input Utama
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [deskripsi, setDeskripsi] = useState<string>('');
  const [costumer, setCostumer] = useState<string>('');
  const [hargaJual, setHargaJual] = useState<string>('');
  const [hargaBeli, setHargaBeli] = useState<string>('');
  const [namaSeles, setNamaSeles] = useState<string>('');
  const [jumlah, setJumlah] = useState<number | string>(1);
  const [tgl, setTgl] = useState<string>(
    new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  );
  const [status, setStatus] = useState<string>('success');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State Toast Notification (Pesan Samping Kanan)
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  // State Tabel Riwayat Penjualan
  const [salesHistory, setSalesHistory] = useState<SaleData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Switch Tab Form Unit
  const handleTabChange = (tab: UnitTab) => {
    setActiveUnitTab(tab);
    setJumlah(tab === 'Kilogram' ? 0.5 : 1);
  };

  // Auto fill jika memilih opsi stok dari Database
  const handleSelectBarangDatabase = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedItemId(selectedId);

    const item = items.find((i) => String(i.No_ID) === String(selectedId));
    if (item) {
      setDeskripsi(item.Nama_Barang);
      setHargaJual(String(item.Harga || ''));
    } else {
      setDeskripsi('');
      setHargaJual('');
    }
  };

  // Switch Mode Input Handler
  const handleSwitchMode = (mode: 'database' | 'manual') => {
    setInputMode(mode);
    setDeskripsi('');
    setSelectedItemId('');
    setHargaJual('');
  };

  // Fetch Data Riwayat Transaksi Penjualan
  const fetchSalesHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('https://s3-backend-seven.vercel.app/s3/api/sales', {
        headers: getAuthHeaders(),
      });
      const resData = await response.json();
      if (response.ok && resData.success && Array.isArray(resData.data)) {
        setSalesHistory(resData.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data penjualan:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchSalesHistory();
  }, [fetchSalesHistory]);

  // Submit Penjualan ke Backend API
  const handleSubmitSales = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deskripsi.trim() || !costumer || !hargaJual) {
      showToast('Mohon lengkapi Deskripsi Barang, Costumer, dan Harga Jual!', 'error');
      return;
    }

    setIsSubmitting(true);

    const payload: SaleData = {
      Deskripsi: deskripsi,
      Costumer: costumer,
      'harga jual': hargaJual,
      'harga beli': hargaBeli || '0',
      satuan: activeUnitTab,
      jumlah: jumlah,
      tgl: tgl || new Date().toLocaleDateString('id-ID'),
      status: status,
      nama_seles: namaSeles || userRole,
    };

    try {
      const response = await fetch('https://s3-backend-seven.vercel.app/s3/api/sales', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        showToast(`Transaksi penjualan (${activeUnitTab}) berhasil disimpan!`, 'success');
        // Reset Form
        setDeskripsi('');
        setSelectedItemId('');
        setCostumer('');
        setHargaJual('');
        setHargaBeli('');
        setNamaSeles('');
        setJumlah(activeUnitTab === 'Kilogram' ? 0.5 : 1);
        fetchSalesHistory();
      } else {
        showToast(resData.message || 'Gagal menyimpan transaksi penjualan.', 'error');
      }
    } catch (err) {
      console.error('Error transaksi sales:', err);
      showToast('Terjadi kesalahan jaringan saat mengirim data penjualan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter pencarian
  const filteredSalesHistory = salesHistory.filter((sale) =>
    (sale.Deskripsi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sale.Costumer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sale.nama_seles || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sale.satuan || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* SIDE TOAST NOTIFICATION (SLIDE-IN DARI KANAN) */}
      <div
        className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all duration-300 transform ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        } ${
          toast.type === 'success'
            ? 'bg-zinc-950 border-emerald-500/50 text-emerald-400'
            : 'bg-zinc-950 border-red-500/50 text-red-400'
        }`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
        <div className="text-xs font-medium pr-2">{toast.message}</div>
        <button
          onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          className="text-zinc-500 hover:text-white text-xs font-bold ml-auto pl-2 border-l border-zinc-800"
        >
          ✕
        </button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            Area Input Penjualan (Sales)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Formulir pendaftaran dan transaksi penjualan barang berdasarkan satuan barang.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Role Saat Ini</span>
          <span className="text-xs font-semibold text-red-500 uppercase">{userRole}</span>
        </div>
      </div>

      {/* TAB NAVIGASI SATUAN FORM (PCS, PACK, KILOGRAM) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 border border-zinc-800 p-2.5 rounded-2xl">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('Pcs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeUnitTab === 'Pcs'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            📦 Form Penjualan Pcs
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('Pack')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeUnitTab === 'Pack'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            🛍️ Form Penjualan Pack
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('Kilogram')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeUnitTab === 'Kilogram'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            ⚖️ Form Penjualan Kilogram (Kg)
          </button>
        </div>

        {/* Toggle Mode Input Database / Manual */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => handleSwitchMode('database')}
            className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              inputMode === 'database'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pilih Dari Stok
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('manual')}
            className={`text-[11px] px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              inputMode === 'manual'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ketik Manual
          </button>
        </div>
      </div>

      {/* FORM INPUT SESUAI TAB BERJALAN */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">
            Form Transaksi — Penjualan Per Satuan <span className="text-red-500 font-bold">[{activeUnitTab}]</span>
          </h3>
          <span className="text-[10px] bg-red-950 border border-red-800 text-red-400 px-2.5 py-0.5 rounded-full uppercase font-mono">
            Unit: {activeUnitTab}
          </span>
        </div>

        <form onSubmit={handleSubmitSales} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Conditional Input: Dropdown Stok vs Text Manual */}
            {inputMode === 'database' ? (
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Pilih Barang Dari Database Stok <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedItemId}
                  onChange={handleSelectBarangDatabase}
                  disabled={isViewOnly}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="">-- Pilih Barang Dari Database --</option>
                  {items.map((item) => (
                    <option key={item.No_ID} value={item.No_ID}>
                      {item.Nama_Barang} - Rp {Number(item.Harga || 0).toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Deskripsi Barang ({activeUnitTab}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={`Masukkan nama barang (${activeUnitTab})...`}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  disabled={isViewOnly}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            )}

            {/* Costumer */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Costumer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Geomed"
                value={costumer}
                onChange={(e) => setCostumer(e.target.value)}
                disabled={isViewOnly}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Jumlah Field Spesifik Sesuai Tab Satuan */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Jumlah ({activeUnitTab === 'Pcs' ? 'Pcs' : activeUnitTab === 'Pack' ? 'Pack' : 'Kg / Kilogram'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={activeUnitTab === 'Kilogram' ? '0.01' : '1'}
                step={activeUnitTab === 'Kilogram' ? '0.01' : '1'}
                placeholder={activeUnitTab === 'Kilogram' ? '0.5' : '1'}
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                disabled={isViewOnly}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Nama Sales */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Nama Sales
              </label>
              <input
                type="text"
                placeholder="Contoh: ibrahim"
                value={namaSeles}
                onChange={(e) => setNamaSeles(e.target.value)}
                disabled={isViewOnly}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Harga Jual Per {activeUnitTab} (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="25000"
                value={hargaJual}
                onChange={(e) => setHargaJual(e.target.value)}
                disabled={isViewOnly}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Harga Beli */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Harga Beli Per {activeUnitTab} (Rp)
              </label>
              <input
                type="number"
                placeholder="24500"
                value={hargaBeli}
                onChange={(e) => setHargaBeli(e.target.value)}
                disabled={isViewOnly}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Tanggal (DD/MM/YYYY)
              </label>
              <input
                type="text"
                placeholder="19/09/2026"
                value={tgl}
                onChange={(e) => setTgl(e.target.value)}
                disabled={isViewOnly}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Status Transaksi
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isViewOnly}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="cancel">Cancel</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isViewOnly || isSubmitting}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            {isSubmitting ? 'Memproses...' : `Simpan Penjualan (${activeUnitTab})`}
          </button>
        </form>
      </div>

      {/* TABEL RIWAYAT PENJUALAN */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Riwayat Penjualan</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Daftar transaksi penjualan dari database</p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari deskripsi / costumer / sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {isLoadingHistory ? (
          <div className="py-10 text-center text-zinc-500 text-xs">Memuat data penjualan...</div>
        ) : filteredSalesHistory.length === 0 ? (
          <div className="py-10 text-center text-zinc-600 text-xs">Belum ada data transaksi penjualan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                  <th className="pb-3 font-medium">Deskripsi</th>
                  <th className="pb-3 font-medium">Costumer</th>
                  <th className="pb-3 font-medium">Jumlah & Satuan</th>
                  <th className="pb-3 font-medium">Nama Sales</th>
                  <th className="pb-3 font-medium">Harga Beli</th>
                  <th className="pb-3 font-medium">Harga Jual</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredSalesHistory.map((sale, idx) => (
                  <tr key={sale.id || idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 text-zinc-400">#{sale.id || idx + 1}</td>
                    <td className="py-3 text-zinc-400">{sale.tgl || '-'}</td>
                    <td className="py-3 text-zinc-200 font-medium">{sale.Deskripsi}</td>
                    <td className="py-3 text-zinc-300">{sale.Costumer}</td>
                    <td className="py-3 text-zinc-300">
                      <span className="font-semibold text-white">{sale.jumlah || 1}</span>{' '}
                      <span className="text-[11px] text-zinc-400">({sale.satuan || 'Pcs'})</span>
                    </td>
                    <td className="py-3 text-zinc-400 capitalize">{sale.nama_seles}</td>
                    <td className="py-3 text-zinc-400">
                      Rp {Number(sale['harga beli'] || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      Rp {Number(sale['harga jual'] || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                          sale.status === 'success'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                            : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {sale.status || 'success'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}