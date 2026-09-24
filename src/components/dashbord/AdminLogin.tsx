import { useState, useEffect } from 'react';
import axios from 'axios';

interface LoginResponse {
  success?: boolean;
  message?: string;
  role?: string;
  token?: string | null;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
}

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

export default function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cek apakah user sudah login sebelumnya saat komponen dimuat
  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    const storedName = localStorage.getItem('user_name');
    
    // Jika role atau nama sudah tersimpan di localStorage, langsung arahkan ke dashboard
    if (storedRole || storedName) {
      window.location.href = '/s3/Dashboard';
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ message: 'Nama/Email dan password wajib diisi!', type: 'error' });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      const apiUrl = 'https://s3-backend-seven.vercel.app/s3/api/auth/signin'; 

      const response = await axios.post<LoginResponse>(apiUrl, {
        email, // Backend menangkap key 'email' untuk input nama ataupun email
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      const data = response.data;
      const userRole = data.role || 'admin';
      const token = data.token;

      // Simpan informasi role & user ke localStorage
      localStorage.setItem('user_role', userRole);
      localStorage.setItem('user_name', data.user?.name || '');

      // Logika Penyimpanan Token (Developer = null, Admin/Karyawan = simpan token)
      if (token) {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token'); // Developer tidak menggunakan token
      }

      // Tampilkan indikator berhasil masuk dengan info rolenya
      setAlert({
        message: `Login berhasil sebagai (${userRole.toUpperCase()})! Mengalihkan ke dashboard...`,
        type: 'success',
      });

      // Redirect otomatis ke dashboard setelah 1.5 detik
      setTimeout(() => {
        window.location.href = '/s3/Dashboard';
      }, 1500);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverError = err.response?.data as ApiErrorResponse;
        const errorMessage = serverError?.message || err.message || 'Terjadi kesalahan pada jaringan atau server.';
        setAlert({ message: errorMessage, type: 'error' });
      } else if (err instanceof Error) {
        setAlert({ message: err.message, type: 'error' });
      } else {
        setAlert({ message: 'Terjadi kesalahan yang tidak diketahui.', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black text-white font-sans antialiased flex items-center justify-center min-h-screen selection:bg-red-600 selection:text-white">
      <div className="w-full max-w-sm p-6 mx-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Aksen Garis Merah di Bagian Atas Card */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700"></div>

        {/* Header / Logo & Judul */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-xl mb-3 shadow-inner text-red-600">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-7 h-7" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Admin</h1>
          <p className="text-xs text-zinc-400 mt-1">Silakan masuk menggunakan Nama atau Email Anda</p>
        </div>

        {/* Alert Pesan Error/Sukses */}
        {alert && (
          <div className={`mb-4 p-3 text-xs rounded-xl border transition-all ${
            alert.type === 'success' 
              ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/50 border-red-800 text-red-200'
          }`}>
            {alert.message}
          </div>
        )}

        {/* Form Container */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5" htmlFor="email">
              Nama atau Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              </span>
              <input 
                type="text" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600" 
                placeholder="Masukkan nama atau email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300" htmlFor="password">
                Password
              </label>
              <a href="#forgot" className="text-xs text-zinc-400 hover:text-red-500 transition-colors">
                Lupa password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-3 text-white text-xs focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600" 
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Eksekusi API */}
          <button 
            type="button" 
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 text-xs cursor-pointer ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </div>

        {/* Footer / Copyright */}
        <div className="mt-6 text-center text-[10px] text-zinc-500">
          &copy; {new Date().getFullYear()} Admin Panel. All rights reserved.
        </div>
      </div>
    </div>
  );
}