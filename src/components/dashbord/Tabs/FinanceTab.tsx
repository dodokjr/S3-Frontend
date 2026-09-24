
export default function FinanceTab() {
  return (
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
  );
}