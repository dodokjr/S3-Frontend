import React, { useState, useEffect, useCallback, useRef } from 'react';

interface FinanceRecord {
  id: string;
  deskripsi: string;
  pemasukan: number;
  pengeluaran: number;
  tgl: string;
  bulan: number;
  tahun: string;
}

interface FinanceTabProps {
  isViewOnly: boolean;
  userRole: string;
  getAuthHeaders: () => HeadersInit;
}

const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';

const NAMA_BULAN = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function FinanceTab({ isViewOnly, userRole, getAuthHeaders }: FinanceTabProps) {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hanya role Finance, Developer, dan Admin yang boleh tambah / ubah / hapus.
  // (Harus huruf kecil semua, karena normalizedRole sudah di-lowercase.)
  const normalizedRole = (userRole || '').toLowerCase();
  const canManageFinance = ['developer', 'admin', 'finance'].includes(normalizedRole);
  const showActions = !isViewOnly && canManageFinance;

  const today = new Date();
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formJenis, setFormJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [formJumlah, setFormJumlah] = useState('');
  const [formTgl, setFormTgl] = useState(String(today.getDate()));
  const [formBulan, setFormBulan] = useState(String(today.getMonth() + 1));
  const [formTahun, setFormTahun] = useState(String(today.getFullYear()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mode edit: berisi id transaksi yang sedang diedit (null = mode tambah)
  const [editingId, setEditingId] = useState<string | null>(null);

  // Konfirmasi hapus: id baris yang sedang menunggu konfirmasi
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Filter bulan ('all' = semua bulan)
  const [filterBulan, setFilterBulan] = useState<string>('all');

  const fetchFinance = useCallback(() => {
    setIsLoading(true);
    // GET /finance sekarang wajib token -> kirim Authorization header
    fetch(`${API_BASE}/finance`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const formatted: FinanceRecord[] = result.data.map((item: any) => ({
            id: String(item.No_id ?? item.No_ID ?? item.no_id ?? item.id ?? ''),
            deskripsi: item.Deskripsi || item.deskripsi || '',
            pemasukan: Number(item.pemasukan) || 0,
            pengeluaran: Number(item.pengeluaran) || 0,
            tgl: item.tgl || '',
            bulan: Number(item.bulan) || 0,
            tahun: item.tahun || '',
          }));
          setRecords(formatted);
          setError(null);
        } else {
          setError(result.message || 'Gagal memuat data keuangan.');
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data keuangan:', err);
        setError('Gagal menghubungi server untuk memuat data keuangan.');
      })
      .finally(() => setIsLoading(false));
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const resetForm = () => {
    setEditingId(null);
    setFormDeskripsi('');
    setFormJenis('pemasukan');
    setFormJumlah('');
    setFormTgl(String(today.getDate()));
    setFormBulan(String(today.getMonth() + 1));
    setFormTahun(String(today.getFullYear()));
  };

  // Klik "Edit" di tabel -> isi form dengan data baris tersebut
  const handleStartEdit = (record: FinanceRecord) => {
    setError(null);
    setSuccess(null);
    setConfirmDeleteId(null);
    setEditingId(record.id);
    setFormDeskripsi(record.deskripsi);
    setFormJenis(record.pemasukan > 0 ? 'pemasukan' : 'pengeluaran');
    setFormJumlah(String(record.pemasukan > 0 ? record.pemasukan : record.pengeluaran));
    setFormTgl(String(record.tgl));
    setFormBulan(String(record.bulan || today.getMonth() + 1));
    setFormTahun(String(record.tahun));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Submit form: POST (tambah) atau PUT (update) tergantung editingId
  const handleSubmitTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (!formDeskripsi || !formJumlah || Number(formJumlah) <= 0) {
      setError('Deskripsi dan jumlah (lebih dari 0) wajib diisi!');
      return;
    }
    if (!formTgl || Number(formTgl) < 1 || Number(formTgl) > 31) {
      setError('Tanggal harus di antara 1 dan 31.');
      return;
    }
    if (!formTahun || formTahun.length !== 4) {
      setError('Tahun harus 4 digit (cth: 2026).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const isEdit = editingId !== null;

    try {
      const res = await fetch(`${API_BASE}/finance`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...(isEdit ? { id: editingId } : {}),
          deskripsi: formDeskripsi,
          pemasukan: formJenis === 'pemasukan' ? formJumlah : '0',
          pengeluaran: formJenis === 'pengeluaran' ? formJumlah : '0',
          tgl: formTgl,
          bulan: formBulan,
          tahun: formTahun,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || (isEdit ? 'Gagal memperbarui transaksi.' : 'Gagal menambahkan transaksi.'));
        return;
      }

      setSuccess(isEdit ? 'Transaksi berhasil diperbarui.' : 'Transaksi berhasil ditambahkan.');
      resetForm();
      fetchFinance();
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      setError('Gagal menghubungi server untuk menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus transaksi (setelah konfirmasi di baris tabel)
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/finance`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || 'Gagal menghapus transaksi.');
        return;
      }

      // Kalau yang dihapus sedang diedit, batalkan mode edit
      if (editingId === id) resetForm();
      setSuccess('Transaksi berhasil dihapus.');
      fetchFinance();
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
      setError('Gagal menghubungi server untuk menghapus transaksi.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredRecords =
    filterBulan === 'all'
      ? records
      : records.filter((r) => String(r.bulan) === filterBulan);

  const totalPendapatan = filteredRecords.reduce((sum, r) => sum + r.pemasukan, 0);
  const totalPengeluaran = filteredRecords.reduce((sum, r) => sum + r.pengeluaran, 0);
  const saldoBersih = totalPendapatan - totalPengeluaran;

  const bulanTersedia = Array.from(new Set(records.map((r) => r.bulan)))
    .filter((b) => b > 0)
    .sort((a, b) => a - b);

  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

  const colCount = showActions ? 5 : 4;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Laporan Keuangan & Transaksi
        </h2>

        {/* Filter Bulan */}
        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-white text-xs focus:outline-none focus:border-red-600"
        >
          <option value="all">Semua Bulan</option>
          {bulanTersedia.map((b) => (
            <option key={b} value={b}>{NAMA_BULAN[b] || b}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-400">Total Pemasukan</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">
            {isLoading ? '...' : formatRupiah(totalPendapatan)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-400">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-400 mt-1">
            {isLoading ? '...' : formatRupiah(totalPengeluaran)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-400">Saldo Bersih</p>
          <p className={`text-lg font-bold mt-1 ${saldoBersih < 0 ? 'text-red-400' : 'text-white'}`}>
            {isLoading ? '...' : formatRupiah(saldoBersih)}
          </p>
        </div>
      </div>

      {/* Form Tambah / Edit Transaksi (Finance, Developer, Admin) */}
      {showActions && (
        <form
          ref={formRef}
          onSubmit={handleSubmitTransaksi}
          className={`bg-zinc-900 border p-4 rounded-xl space-y-3 ${
            editingId !== null ? 'border-amber-700' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId !== null ? `Edit Transaksi #${editingId}` : 'Tambah Transaksi Keuangan'}
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full capitalize">
              Role: {userRole}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Deskripsi (cth: Penjualan barang / Bayar Listrik)"
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
            <select
              value={formJenis}
              onChange={(e) => setFormJenis(e.target.value as 'pemasukan' | 'pengeluaran')}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            >
              <option value="pemasukan">Pemasukan (+)</option>
              <option value="pengeluaran">Pengeluaran (-)</option>
            </select>
            <input
              type="number"
              min="1"
              placeholder="Jumlah (Rp)"
              value={formJumlah}
              onChange={(e) => setFormJumlah(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                placeholder="Tgl"
                value={formTgl}
                onChange={(e) => setFormTgl(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-white text-xs focus:outline-none focus:border-red-600"
              />
              <select
                value={formBulan}
                onChange={(e) => setFormBulan(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-white text-xs focus:outline-none focus:border-red-600"
              >
                {NAMA_BULAN.slice(1).map((nama, idx) => (
                  <option key={idx + 1} value={idx + 1}>{nama}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Tahun"
                value={formTahun}
                onChange={(e) => setFormTahun(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-2 text-white text-xs focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : editingId !== null
                  ? 'Simpan Perubahan'
                  : 'Simpan Transaksi'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setError(null);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      )}

      {/* Tabel Riwayat Transaksi */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Deskripsi</th>
              <th className="py-3 px-4">Pemasukan</th>
              <th className="py-3 px-4">Pengeluaran</th>
              {showActions && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="py-6 text-center text-zinc-500">
                  Memuat data keuangan...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
                const isEditingRow = editingId !== null && editingId === record.id;
                const isConfirming = confirmDeleteId === record.id;
                const isDeleting = deletingId === record.id;

                return (
                  <tr
                    key={record.id || `row-${index}`}
                    className={`transition-colors ${
                      isEditingRow ? 'bg-amber-950/20' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <td className="py-3 px-4 text-zinc-400">
                      {record.tgl} {NAMA_BULAN[record.bulan] || ''} {record.tahun}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{record.deskripsi}</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">
                      {record.pemasukan > 0 ? formatRupiah(record.pemasukan) : '-'}
                    </td>
                    <td className="py-3 px-4 text-red-400 font-semibold">
                      {record.pengeluaran > 0 ? formatRupiah(record.pengeluaran) : '-'}
                    </td>

                    {showActions && (
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {isConfirming ? (
                            <>
                              <span className="text-[10px] text-zinc-400">Hapus?</span>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDelete(record.id)}
                                className="text-[11px] bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isDeleting ? '...' : 'Ya'}
                              </button>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                disabled={!record.id}
                                onClick={() => handleStartEdit(record)}
                                className="text-[11px] bg-zinc-800 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={!record.id}
                                onClick={() => setConfirmDeleteId(record.id)}
                                className="text-[11px] bg-zinc-800 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={colCount} className="py-6 text-center text-zinc-500">
                  Tidak ada data transaksi untuk bulan ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}