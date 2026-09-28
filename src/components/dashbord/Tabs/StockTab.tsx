import React, { useState, useRef } from 'react';

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

interface StockTabProps {
  items: Item[];
  isViewOnly: boolean;
  userRole?: string;
  getAuthHeaders?: () => HeadersInit;
  // Dipanggil setelah tambah / ubah / hapus berhasil, supaya Dashboard memuat ulang data stock
  onRefresh?: () => void;
}

const API_BASE = 'https://s3-backend-seven.vercel.app/s3/api';

// Role yang boleh tambah / ubah / hapus stock (harus sama dengan MODULE_ROLES.gudang di backend)
const STOCK_MANAGER_ROLES = ['developer', 'admin', 'sales', 'gudang'];

export default function StockTab({
  items,
  isViewOnly,
  userRole = '',
  getAuthHeaders,
  onRefresh,
}: StockTabProps) {
  const normalizedRole = (userRole || '').toLowerCase();
  const canManageStock =
    !isViewOnly && !!getAuthHeaders && STOCK_MANAGER_ROLES.includes(normalizedRole);

  // Kolom: #, Nama Barang, Stock, (Harga Satuan), (Aksi)
  const columnCount = 3 + (isViewOnly ? 0 : 1) + (canManageStock ? 1 : 0);

  // ===== State form =====
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNoId, setFormNoId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formBox, setFormBox] = useState('');
  const [formPerPcs, setFormPerPcs] = useState('');
  const [formPerDus, setFormPerDus] = useState('');
  const [formHarga, setFormHarga] = useState('');
  const [formSatuan, setFormSatuan] = useState('');
  const [formGambar, setFormGambar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Saran No_ID berikutnya (angka terbesar + 1)
  const suggestNextId = () => {
    let max = 0;
    items.forEach((i) => {
      const n = Number(i.No_ID);
      if (!Number.isNaN(n) && n > max) max = n;
    });
    return String(max + 1);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormNoId('');
    setFormNama('');
    setFormBox('');
    setFormPerPcs('');
    setFormPerDus('');
    setFormHarga('');
    setFormSatuan('');
    setFormGambar('');
  };

  const handleStartEdit = (item: Item) => {
    setError(null);
    setSuccess(null);
    setConfirmDeleteId(null);
    setEditingId(String(item.No_ID));
    setFormNoId(String(item.No_ID));
    setFormNama(item.Nama_Barang || '');
    setFormBox(item.Box !== undefined ? String(item.Box) : '');
    setFormPerPcs(String(item.PerPcs ?? ''));
    setFormPerDus(String(item.PerDus ?? ''));
    setFormHarga(item.Harga !== undefined ? String(item.Harga) : '');
    setFormSatuan(item.Satuan || '');
    setFormGambar(item.Gambar || '');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Submit: POST (tambah) atau PUT (update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getAuthHeaders) return;

    setError(null);
    setSuccess(null);

    const isEdit = editingId !== null;
    const noId = (isEdit ? editingId : formNoId).toString().trim();

    if (!noId || !formNama.trim()) {
      setError('No_ID dan Nama Barang wajib diisi!');
      return;
    }

    // Cegah No_ID ganda saat tambah baru
    if (!isEdit && items.some((i) => String(i.No_ID) === noId)) {
      setError(`No_ID ${noId} sudah dipakai. Gunakan No_ID lain.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/stock`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          No_ID: noId,
          Nama_Barang: formNama.trim(),
          Box: formBox,
          PerPcs: formPerPcs,
          PerDus: formPerDus,
          Harga: formHarga,
          Satuan: formSatuan,
          Gambar: formGambar,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || (isEdit ? 'Gagal memperbarui stock.' : 'Gagal menambahkan stock.'));
        return;
      }

      setSuccess(isEdit ? 'Stock barang berhasil diperbarui.' : 'Stock barang berhasil ditambahkan.');
      resetForm();
      onRefresh?.();
    } catch (err) {
      console.error('Gagal menyimpan stock:', err);
      setError('Gagal menghubungi server untuk menyimpan stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (noId: string) => {
    if (!getAuthHeaders) return;

    setDeletingId(noId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/stock`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ No_ID: noId }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setError(result.message || 'Gagal menghapus stock.');
        return;
      }

      if (editingId === noId) resetForm();
      setSuccess('Stock barang berhasil dihapus.');
      onRefresh?.();
    } catch (err) {
      console.error('Gagal menghapus stock:', err);
      setError('Gagal menghubungi server untuk menghapus stock.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const inputClass =
    'bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600';

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
        Laporan Stock Barang
      </h2>

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

      {/* Form Tambah / Edit Stock (Developer, Admin, Sales, Gudang) */}
      {canManageStock && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`bg-zinc-900 border p-4 rounded-xl space-y-3 ${
            editingId !== null ? 'border-amber-700' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId !== null ? `Edit Stock #${editingId}` : 'Tambah Stock Barang'}
            </h3>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full capitalize">
              Role: {userRole}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="No_ID"
                value={editingId !== null ? editingId : formNoId}
                onChange={(e) => setFormNoId(e.target.value)}
                disabled={editingId !== null}
                className={`${inputClass} w-full disabled:opacity-60`}
              />
              {editingId === null && (
                <button
                  type="button"
                  onClick={() => setFormNoId(suggestNextId())}
                  title="Isi No_ID berikutnya"
                  className="text-[11px] bg-zinc-800 hover:bg-zinc-700 text-white px-2.5 rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Auto
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Nama Barang"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              className={`${inputClass} md:col-span-2`}
            />
            <input
              type="number"
              min="0"
              placeholder="Box"
              value={formBox}
              onChange={(e) => setFormBox(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="Stock Per Pcs"
              value={formPerPcs}
              onChange={(e) => setFormPerPcs(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="Stock Per Dus"
              value={formPerDus}
              onChange={(e) => setFormPerDus(e.target.value)}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              placeholder="Harga Satuan (Rp)"
              value={formHarga}
              onChange={(e) => setFormHarga(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Satuan (cth: Pcs, Pack, Kg)"
              value={formSatuan}
              onChange={(e) => setFormSatuan(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="URL Gambar (opsional)"
              value={formGambar}
              onChange={(e) => setFormGambar(e.target.value)}
              className={inputClass}
            />
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
                  : 'Simpan Stock'}
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Nama Barang</th>
              <th className="py-3 px-4">Stock</th>
              {!isViewOnly && <th className="py-3 px-4">Harga Satuan</th>}
              {canManageStock && <th className="py-3 px-4 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {items.length > 0 ? (
              items.map((item, index) => {
                const noId = String(item.No_ID ?? '');
                const hargaNumber =
                  typeof item.Harga === 'string' ? Number(item.Harga) : item.Harga;

                // Angka valid (termasuk 0) tampil sebagai rupiah;
                // nilai kosong / non-numerik tampil '-' (bukan "Rp NaN").
                const hargaDisplay =
                  typeof hargaNumber === 'number' && !Number.isNaN(hargaNumber)
                    ? `Rp ${hargaNumber.toLocaleString('id-ID')}`
                    : '-';

                const isEditingRow = editingId !== null && editingId === noId;
                const isConfirming = confirmDeleteId === noId && noId !== '';
                const isDeleting = deletingId === noId;

                return (
                  <tr
                    key={noId !== '' ? noId : `row-${index}`}
                    className={`transition-colors ${
                      isEditingRow ? 'bg-amber-950/20' : 'hover:bg-zinc-900/40'
                    }`}
                  >
                    <td className="py-3 px-4 text-zinc-500">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-white">{item.Nama_Barang}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
                        {item.PerPcs} {item.Satuan}
                      </span>
                    </td>
                    {!isViewOnly && (
                      <td className="py-3 px-4 text-emerald-400">{hargaDisplay}</td>
                    )}

                    {canManageStock && (
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {isConfirming ? (
                            <>
                              <span className="text-[10px] text-zinc-400">Hapus?</span>
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDelete(noId)}
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
                                disabled={!noId}
                                onClick={() => handleStartEdit(item)}
                                className="text-[11px] bg-zinc-800 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={!noId}
                                onClick={() => setConfirmDeleteId(noId)}
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
                <td colSpan={columnCount} className="py-6 text-center text-zinc-500">
                  Tidak ada data stock ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}