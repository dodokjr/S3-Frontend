
export default function ServerTab() {
  // Simulasi data grafik beban server (misal 6 jam terakhir)
  const metrics = [
    { time: '10:00', cpu: 20, memory: 40, latency: 45 },
    { time: '11:00', cpu: 35, memory: 45, latency: 50 },
    { time: '12:00', cpu: 75, memory: 60, latency: 120 },
    { time: '13:00', cpu: 50, memory: 55, latency: 65 },
    { time: '14:00', cpu: 30, memory: 50, latency: 48 },
    { time: '15:00', cpu: 42, memory: 52, latency: 52 },
  ];

  // Simulasi log error & bug terbaru
  const errorLogs = [
    {
      id: 'ERR-102',
      timestamp: '14:45:12',
      level: 'CRITICAL',
      message: 'Database query timeout pada endpoint /api/v1/orders',
      status: 'Unresolved',
    },
    {
      id: 'ERR-101',
      timestamp: '12:10:05',
      level: 'WARNING',
      message: 'High CPU usage spike (>80%) terdeteksi',
      status: 'Resolved',
    },
    {
      id: 'ERR-100',
      timestamp: '09:30:22',
      level: 'INFO',
      message: 'Redis cache hit rate di bawah 60%',
      status: 'Investigating',
    },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6 text-zinc-300">
      {/* Header & Status Ringkas */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-4">
          Pengaturan &amp; Status Server
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span>API Endpoint Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Online (Vercel Node.js)
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span>Database Connection:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Connected
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <span>Environment:</span>
            <span className="text-yellow-400 font-semibold">Production</span>
          </div>
        </div>
      </div>

      {/* Metric Visual / Grafis Server */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase text-zinc-400">
            Kondisi &amp; Performa Server (6 Jam Terakhir)
          </h3>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Realtime Sync</span>
        </div>

        {/* Visual Bar Chart menggunakan Tailwind CSS */}
        <div className="grid grid-cols-6 gap-2 items-end h-36 pt-6 border-b border-zinc-800 pb-2">
          {metrics.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full bg-zinc-800/50 rounded-t h-full flex items-end overflow-hidden relative">
                {/* Bar CPU Usage */}
                <div
                  className={`w-full transition-all duration-300 ${
                    item.cpu > 70 ? 'bg-red-500' : item.cpu > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                  }`}
                  style={{ height: `${item.cpu}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500">{item.time}</span>
            </div>
          ))}
        </div>

        {/* Indicator Stats */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block">Avg CPU Load</span>
            <span className="text-xs font-bold text-zinc-200">42%</span>
          </div>
          <div className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block">Memory Usage</span>
            <span className="text-xs font-bold text-zinc-200">2.1 / 4.0 GB</span>
          </div>
          <div className="p-2 bg-zinc-950/50 rounded-lg border border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 block">Avg Response Latency</span>
            <span className="text-xs font-bold text-emerald-400">58 ms</span>
          </div>
        </div>
      </div>

      {/* Laporan Error & Bug Log */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase text-zinc-400">Laporan Bug &amp; Error Terakhir</h3>
          <span className="text-[10px] text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded">
            1 Unresolved Issue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[11px]">
                <th className="pb-2 font-medium">ID / Waktu</th>
                <th className="pb-2 font-medium">Level</th>
                <th className="pb-2 font-medium">Pesan Kendala</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {errorLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30">
                  <td className="py-2.5 font-mono text-[11px]">
                    <div className="text-zinc-300 font-bold">{log.id}</div>
                    <div className="text-zinc-500 text-[10px]">{log.timestamp}</div>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                        log.level === 'CRITICAL'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : log.level === 'WARNING'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="py-2.5 text-zinc-300 max-w-xs truncate pr-2">{log.message}</td>
                  <td className="py-2.5 text-right font-medium">
                    <span
                      className={
                        log.status === 'Unresolved'
                          ? 'text-red-400'
                          : log.status === 'Investigating'
                          ? 'text-yellow-400'
                          : 'text-zinc-500'
                      }
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}