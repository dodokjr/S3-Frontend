import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-950 text-white m-0 p-0 overflow-x-hidden">
      {/* Navbar Full Width */}
      <Navbar />

      {/* Main Content: Benar-benar polos tanpa padding/margin/container */}
      <main className="flex-grow w-full m-0 p-0">
        <Outlet />
      </main>

      {/* Footer Full Width */}
      <Footer />
    </div>
  )
}