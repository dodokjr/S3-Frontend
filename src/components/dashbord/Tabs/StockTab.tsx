
interface Item {
  id: number;
  name: string;
  stock: number;
  price?: number;
}

interface StockTabProps {
  items: Item[];
  isViewOnly: boolean;
}

export default function StockTab({ items, isViewOnly }: StockTabProps) {
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
  );
}