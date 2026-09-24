interface DashboardHeaderProps {
  isViewOnly: boolean;
  userRole: string;
  userName: string;
  onOpenLogout: () => void;
}

export default function DashboardHeader({
  isViewOnly,
  userRole,
  userName,
  onOpenLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          {isViewOnly ? 'Katalog Stock Barang' : `Dashboard ${userRole.toUpperCase()}`}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {isViewOnly ? 'Mode Publik / Viewer (Informasi Keuangan Disembunyikan)' : `Selamat datang kembali, ${userName}`}
        </p>
      </div>

      {!isViewOnly ? (
        <button
          onClick={onOpenLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-900/20 cursor-pointer"
        >
          Log Out
        </button>
      ) : (
        <a
          href="/s3/signup"
          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          Sign Up
        </a>
      )}
    </div>
  );
}