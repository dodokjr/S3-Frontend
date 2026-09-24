import React from 'react';

interface UserAccount {
  id: string | number;
  name: string;
  email: string;
  role: string;
  password?: string;
  status?: string;
}

interface UsersTabProps {
  usersList: UserAccount[];
  userRole: string;
  newUserName: string;
  setNewUserName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserRole: string;
  setNewUserRole: (val: string) => void;
  handleAddUser: (e: React.FormEvent) => void;
  handleRoleChange: (targetId: string | number, newRole: string) => void;
  handleDeleteUser: (targetId: string | number) => void;
}

export default function UsersTab({
  usersList,
  userRole,
  newUserName,
  setNewUserName,
  newUserEmail,
  setNewUserEmail,
  newUserRole,
  setNewUserRole,
  handleAddUser,
  handleRoleChange,
  handleDeleteUser,
}: UsersTabProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">Manajemen Role & Pengguna</h2>
      
      {/* Form Tambah Role Baru (Hanya Developer) */}
      {userRole === 'developer' && (
        <form onSubmit={handleAddUser} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tambah Role / User Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Nama Pengguna"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
            <input
              type="email"
              placeholder="Email Pengguna"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
            <input
              type="text"
              placeholder="Role Baru (cth: supervisor)"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-red-600"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            Tambahkan Role Baru
          </button>
        </form>
      )}

      {/* Tabel Daftar Pengguna & Ubah Role */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Password</th>
              <th className="py-3 px-4">Role Saat Ini</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Aksi Ganti Role</th>
              {userRole === 'developer' && <th className="py-3 px-4">Hapus</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {usersList.length > 0 ? (
              usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-4 text-zinc-400">{usr.id}</td>
                  <td className="py-3 px-4 font-medium text-white">{usr.name}</td>
                  <td className="py-3 px-4 text-zinc-400">{usr.email}</td>
                  <td className="py-3 px-4 text-zinc-500 font-mono">{usr.password || '••••••••'}</td>
                  <td className="py-3 px-4 uppercase font-semibold text-red-500">{usr.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        usr.status === 'TRUE'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {usr.status || 'TRUE'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={usr.role}
                      onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg py-1 px-2 text-white text-xs focus:outline-none focus:border-red-600"
                    >
                      <option value="developer">developer</option>
                      <option value="admin">admin</option>
                      <option value="karyawan">karyawan</option>
                      <option value="users">users</option>
                      <option value={usr.role}>{usr.role}</option>
                    </select>
                  </td>
                  {userRole === 'developer' && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-6 text-center text-zinc-500">
                  Tidak ada data pengguna ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}