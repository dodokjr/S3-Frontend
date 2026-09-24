
interface LogoutModalProps {
  isOpen: boolean;
  logoutInput: string;
  setLogoutInput: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  logoutInput,
  setLogoutInput,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>
        
        <h3 className="text-sm font-bold tracking-tight text-white">Konfirmasi Log Out</h3>
        <p className="text-xs text-zinc-400">
          Untuk keluar dari sesi ini, silakan ketik kata <strong className="text-red-500">keluar</strong> pada kolom di bawah ini:
        </p>

        <input
          type="text"
          value={logoutInput}
          onChange={(e) => setLogoutInput(e.target.value)}
          placeholder="Ketik 'keluar' di sini"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={logoutInput.toLowerCase() !== 'keluar'}
            className={`text-xs font-medium px-4 py-2 rounded-xl transition-all ${
              logoutInput.toLowerCase() === 'keluar'
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-900/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
            }`}
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}