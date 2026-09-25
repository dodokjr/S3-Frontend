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
}

export default function StockTab({ items, isViewOnly }: StockTabProps) {
  // Jumlah kolom berubah tergantung apakah kolom "Harga Satuan" ditampilkan,
  // dipakai untuk colSpan baris "Tidak ada data" agar selalu akurat.
  const columnCount = isViewOnly ? 3 : 4;

  return (
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
            {items.length > 0 ? (
              items.map((item, index) => {
                const hargaNumber =
                  typeof item.Harga === 'string' ? Number(item.Harga) : item.Harga;

                // Angka yang valid, termasuk 0, ditampilkan sebagai rupiah;
                // string non-numerik (Number('abc') -> NaN) atau nilai kosong
                // ditampilkan sebagai '-' alih-alih "Rp NaN".
                const hargaDisplay =
                  typeof hargaNumber === 'number' && !Number.isNaN(hargaNumber)
                    ? `Rp ${hargaNumber.toLocaleString('id-ID')}`
                    : '-';

                return (
                  // PERBAIKAN: fallback ke index sebagai bagian key untuk
                  // menghindari duplicate key kalau No_ID kosong/sama pada
                  // lebih dari satu item.
                  <tr
                    key={item.No_ID !== '' ? item.No_ID : `row-${index}`}
                    className="hover:bg-zinc-900/40 transition-colors"
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
                  </tr>
                );
              })
            ) : (
              // PERBAIKAN: sebelumnya tidak ada baris ini sama sekali —
              // tabel kosong tanpa keterangan saat items.length === 0
              // (mis. stock belum ada atau fetch gagal).
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