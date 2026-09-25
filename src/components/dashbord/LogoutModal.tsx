interface LogoutModalProps {
  isOpen: boolean;
  logoutInput: string;
  setLogoutInput: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function LogoutModal({
  isOpen,
  logoutInput,
  setLogoutInput,
  onClose,
  onConfirm,
  isSubmitting = false,
}: LogoutModalProps) {
  if (!isOpen) return null;

  const isConfirmEnabled = logoutInput.toLowerCase() === 'keluar' && !isSubmitting;

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
          disabled={isSubmitting}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className={`text-xs font-medium px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              isConfirmEnabled
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-900/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting && (
              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? 'Memproses...' : 'Ya, Keluar'}
          </button>
        </div>
      </div>
    </div>
  );
}