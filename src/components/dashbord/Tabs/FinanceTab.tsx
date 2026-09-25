import React, { useState, useEffect, useCallback } from 'react';

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

  // Hanya developer & admin yang boleh menambah transaksi, sesuai middleware
  // allowDeveloperAndAdmin di backend — form disembunyikan untuk role lain
  // supaya tidak menampilkan aksi yang pasti akan ditolak server.
  const canManageFinance = userRole === 'developer' || userRole === 'admin';

  const today = new Date();
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formJenis, setFormJenis] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [formJumlah, setFormJumlah] = useState('');
  const [formTgl, setFormTgl] = useState(String(today.getDate()));
  const [formBulan, setFormBulan] = useState(String(today.getMonth() + 1));
  const [formTahun, setFormTahun] = useState(String(today.getFullYear()));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tampilan tabel & ringkasan berdasarkan bulan yang dipilih.
  // 'all' berarti menampilkan seluruh data tanpa difilter.
  const [filterBulan, setFilterBulan] = useState<string>('all');

  const fetchFinance = useCallback(() => {
    setIsLoading(true);
    fetch(`${API_BASE}/finance`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          const formatted: FinanceRecord[] = result.data.map((item: any) => ({
            id: item.No_id || '',
            deskripsi: item.Deskripsi || '',
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
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  const handleAddTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      const res = await fetch(`${API_BASE}/finance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
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
        setError(result.message || 'Gagal menambahkan transaksi.');
        return;
      }

      setFormDeskripsi('');
      setFormJumlah('');
      fetchFinance(); // muat ulang agar tabel & ringkasan mencerminkan data server
    } catch (err) {
      console.error('Gagal menambah transaksi:', err);
      setError('Gagal menghubungi server untuk menambah transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Data yang sudah difilter sesuai bulan terpilih (dipakai baik oleh
  // kartu ringkasan maupun tabel riwayat, supaya keduanya selalu konsisten).
  const filteredRecords =
    filterBulan === 'all'
      ? records
      : records.filter((r) => String(r.bulan) === filterBulan);

  const totalPendapatan = filteredRecords.reduce((sum, r) => sum + r.pemasukan, 0);
  const totalPengeluaran = filteredRecords.reduce((sum, r) => sum + r.pengeluaran, 0);
  const saldoBersih = totalPendapatan - totalPengeluaran;

  // Daftar bulan unik yang benar-benar ada di data, untuk mengisi opsi filter
  // tanpa menampilkan bulan yang datanya belum ada sama sekali.
  const bulanTersedia = Array.from(new Set(records.map((r) => r.bulan)))
    .filter((b) => b > 0)
    .sort((a, b) => a - b);

  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Laporan Keuangan & Transaksi</h2>

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

      {/* Kartu Ringkasan (mengikuti filter bulan aktif) */}
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

      {/* Form Tambah Transaksi (Hanya Developer & Admin) */}
      {!isViewOnly && canManageFinance && (
        <form onSubmit={handleAddTransaksi} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tambah Transaksi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Deskripsi (cth: Penjualan barang)"
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
            <select
              value={formJenis}
              onChange={(e) => setFormJenis(e.target.value as 'pemasukan' | 'pengeluaran')}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            >
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : 'Tambah Transaksi'}
          </button>
        </form>
      )}

      {/* Tabel Riwayat Transaksi (mengikuti filter bulan aktif) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Deskripsi</th>
              <th className="py-3 px-4">Pemasukan</th>
              <th className="py-3 px-4">Pengeluaran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-500">
                  Memuat data keuangan...
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={record.id || `row-${index}`} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 text-zinc-400">
                    {record.tgl} {NAMA_BULAN[record.bulan] || ''} {record.tahun}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{record.deskripsi}</td>
                  <td className="py-3 px-4 text-emerald-400">
                    {record.pemasukan > 0 ? formatRupiah(record.pemasukan) : '-'}
                  </td>
                  <td className="py-3 px-4 text-red-400">
                    {record.pengeluaran > 0 ? formatRupiah(record.pengeluaran) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-zinc-500">
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