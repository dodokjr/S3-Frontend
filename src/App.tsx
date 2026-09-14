import React from 'react'
import HeroBanner from './components/Home/HeroBanner'
import AboutUs from './components/Home/AboutUs'
import OurCustomers from './components/Home/OurCustomers'
import PartnerBrands from './components/Home/PartnerBrands'
import ContactSection from './components/Home/ContactSection'

export default function App() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900 overflow-x-hidden antialiased">
      <main className="flex flex-col w-full">
        {/* Hero / Home Section */}
        <section id="home" className="w-full scroll-mt-20">
          <HeroBanner />
        </section>

        {/* Tentang Kami Section */}
        <section id="about" className="w-full scroll-mt-20">
          <AboutUs />
        </section>

        {/* Klien / Pelanggan Section */}
        <section id="customers" className="w-full scroll-mt-20">
          <OurCustomers />
        </section>

        {/* Mitra / Brand Partner Section */}
        <section id="partners" className="w-full scroll-mt-20">
          <PartnerBrands />
        </section>

        {/* Kontak Section */}
        <section id="contact" className="w-full scroll-mt-20">
          <ContactSection />
        </section>
      </main>
    </div>
  )
}