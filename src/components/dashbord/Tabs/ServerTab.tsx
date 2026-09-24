
export default function ServerTab() {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Pengaturan & Status Server</h2>
      <div className="space-y-3 text-xs text-zinc-300">
        <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span>API Endpoint Status:</span>
          <span className="text-emerald-400 font-semibold">Online (Vercel Node.js)</span>
        </div>
        <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span>Database Connection:</span>
          <span className="text-emerald-400 font-semibold">Connected</span>
        </div>
        <div className="flex justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
          <span>Environment:</span>
          <span className="text-yellow-400 font-semibold">Production</span>
        </div>
      </div>
    </div>
  );
}