interface NotFoundProps {
  onBackToDashboard?: () => void;
}

export default function NotFound({ onBackToDashboard }: NotFoundProps) {
  const handleBack = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      // Default action: kembali ke halaman sebelumnya atau dashboard
      window.location.href = '/';
    }
  };

  return (
    <div className="bg-black text-white font-sans antialiased flex items-center justify-center min-h-screen selection:bg-red-600 selection:text-white">
      {/* Ukuran card compact (max-w-sm) dan padding konsisten */}
      <div className="w-full max-w-sm p-6 mx-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden text-center">
        
        {/* Aksen Garis Merah di Bagian Atas Card */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>

        {/* Ikon / Ilustrasi Angka 404 */}
        <div className="my-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl mb-2 shadow-inner text-red-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-8 h-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-wider text-white mt-2">404</h1>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">Halaman Tidak Ditemukan</h2>
          <p className="text-xs text-white mt-2 px-2">
            Maaf, halaman yang Anda cari atau akses mungkin telah dihapus, dipindahkan, atau tidak tersedia.
          </p>
        </div>

        {/* Tombol Navigasi Kembali */}
        <button 
          type="button" 
          onClick={handleBack}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 text-xs cursor-pointer mt-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Kembali ke Dashboard</span>
        </button>
      </div>
    </div>
  );
}