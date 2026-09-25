import { useState } from 'react';

interface DeveloperTabProps {
  userRole: string;
  getAuthHeaders: () => HeadersInit;
}

export default function DeveloperTab({ userRole, getAuthHeaders }: DeveloperTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'api' | 'env' | 'database'>('logs');

  return (
    <div className="space-y-6">
      {/* Header Tab */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Developer Console</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-800 text-red-400 uppercase tracking-wide">
              {userRole} Mode
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Panel kontrol pengembang untuk pemantauan sistem, log, dan konfigurasi API.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'logs' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'api' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            API Endpoints
          </button>
          <button
            onClick={() => setActiveSubTab('database')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'database' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Database Status
          </button>
          <button
            onClick={() => setActiveSubTab('env')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'env' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Environment
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Server Uptime</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">99.98%</p>
          <span className="text-[10px] text-zinc-400">Running for 14d 6h</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">API Latency</p>
          <p className="text-lg font-bold text-white mt-1">42 ms</p>
          <span className="text-[10px] text-emerald-400">Optimal response speed</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Active Sessions</p>
          <p className="text-lg font-bold text-white mt-1">12</p>
          <span className="text-[10px] text-zinc-400">Users currently online</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs text-zinc-500 font-medium">Errors (24h)</p>
          <p className="text-lg font-bold text-red-400 mt-1">0</p>
          <span className="text-[10px] text-emerald-400">No critical issues</span>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'logs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Live Console Output</h3>
            <button className="text-[11px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-300 hover:bg-zinc-800">
              Clear Console
            </button>
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-2 h-64 overflow-y-auto">
            <div className="text-zinc-500">[2026-09-25 16:15:00] [INFO] System initialized successfully.</div>
            <div className="text-emerald-400">[2026-09-25 16:15:02] [SUCCESS] Database connected to pool (PostgreSQL).</div>
            <div className="text-zinc-400">[2026-09-25 16:16:10] [GET /s3/api/stock] 200 OK - 42ms</div>
            <div className="text-amber-400">[2026-09-25 16:16:45] [WARN] Auth token refresh triggered for user ID #8.</div>
            <div className="text-zinc-400">[2026-09-25 16:17:01] [GET /s3/api/users] 200 OK - 38ms</div>
          </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Registered API Endpoints</h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">GET</span>
                <span className="text-zinc-200">/s3/api/stock</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Public / Authenticated</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">GET</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Requires Bearer Token</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-bold">POST</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Dev Restricted</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded font-bold">DELETE</span>
                <span className="text-zinc-200">/s3/api/users</span>
              </div>
              <span className="text-zinc-500 text-[11px]">Dev Restricted</span>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'database' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Database Pool Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg space-y-2">
              <p className="text-zinc-400 font-medium">Connection Details</p>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Host</span>
                <span className="font-mono text-zinc-300">s3-backend-seven.vercel.app</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Status</span>
                <span className="text-emerald-400 font-semibold">Connected</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">SSL</span>
                <span className="text-zinc-300">Enabled (TLS 1.3)</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg space-y-2">
              <p className="text-zinc-400 font-medium">Pool Metrics</p>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Active Connections</span>
                <span className="font-mono text-zinc-300">3 / 20</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/80 py-1">
                <span className="text-zinc-500">Idle Connections</span>
                <span className="font-mono text-zinc-300">5</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Max Connections</span>
                <span className="font-mono text-zinc-300">20</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'env' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Environment Configuration</h3>
            {userRole === 'semi dev' && (
              <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                Read-Only (Semi Dev Limit)
              </span>
            )}
          </div>
          <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">NODE_ENV</span>
              <span className="text-emerald-400">"production"</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">API_BASE_URL</span>
              <span className="text-zinc-300">"https://s3-backend-seven.vercel.app/s3/api"</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-400">JWT_EXPIRATION</span>
              <span className="text-zinc-300">"8h"</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">DATABASE_SSL</span>
              <span className="text-emerald-400">true</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}