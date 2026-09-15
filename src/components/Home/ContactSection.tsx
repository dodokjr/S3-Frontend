import { useState } from 'react'
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaClock, FaExclamationCircle } from 'react-icons/fa'

export default function ContactSection() {
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Alamat email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon/WA wajib diisi'
    if (!formData.message.trim()) newErrors.message = 'Rincian pesan wajib diisi'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!validateForm()) return

    const whatsappMessage = `Halo Tim CV. Sinergi Solusi Sejahtera,%0A%0APerkenalkan saya: *${formData.name}* (${formData.company.trim() || 'Personal'})%0AEmail: ${formData.email}%0ANo. Telp: ${formData.phone}%0A%0APesan:%0A${formData.message}`
    
    window.open(`https://wa.me/6281234567890?text=${whatsappMessage}`, '_blank')
  }

  const mapAddressQuery = encodeURIComponent('CV. Sinergi Solusi Sejahtera, Jl. Bukit Seruni V No 132 RT.07 RW.19 SendangMulyo, Tembalang, Kota Semarang')

  return (
    <section id="contact" className="bg-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans border-t border-gray-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 self-start order-2 md:order-1">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center flex-none">
              <FaClock className="text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-black">Jam Operasional</p>
              <p className="text-[11px] text-gray-500">Senin - Jumat: 08:00 - 17:00 WIB</p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-2 order-1 md:order-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Layanan Pelanggan
            </span>

            <div className="group relative inline-block cursor-pointer">
              <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
                HUBUNGI KAMI
              </h2>
              <span className="block h-[4px] w-full bg-black rounded-full transition-all duration-300 group-hover:bg-red-600 relative overflow-hidden mt-1">
                <span className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-500 opacity-50" />
              </span>
            </div>

            <p className="text-sm text-gray-500 max-w-xl">
              Siap membantu kebutuhan suku cadang industri, perbaikan, dan kustomisasi komponen pabrik Anda.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Info Kontak */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 space-y-6">
              <h3 className="text-lg font-bold text-black border-b border-gray-200 pb-3 text-left">
                Informasi Kontak
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-none mt-0.5 shadow-sm">
                    <FaMapMarkerAlt className="text-sm" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none">
                      Alamat Kantor
                    </h4>
                    <p className="text-xs font-semibold text-black mt-1.5 leading-relaxed">
                      Jl. Bukit Seruni V No 132 RT.07 RW.19 SendangMulyo, Tembalang, Kota Semarang, Jawa Tengah (50272)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-none mt-0.5 shadow-sm">
                    <FaPhoneAlt className="text-sm" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none">
                      Telepon / Hotline
                    </h4>
                    <p className="text-xs font-semibold text-black mt-1.5">
                      +62 812-3456-7890
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center flex-none mt-0.5 shadow-sm">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none">
                      Email Respon Cepat
                    </h4>
                    <p className="text-xs font-semibold text-black mt-1.5">
                      s3semarang@gmail.com
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-600 text-white p-5 rounded-xl space-y-3 shadow-md text-left">
                <div className="flex items-center gap-3">
                  <FaWhatsapp className="text-2xl flex-none" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Butuh Penawaran Cepat?</h4>
                    <p className="text-[11px] text-emerald-100">Konsultasikan kebutuhan teknis via WhatsApp</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-white text-emerald-700 font-bold text-xs py-2.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Chat WhatsApp Sales
                </a>
              </div>
            </div>
          </div>

          {/* Form Kirim Pesan */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm text-left">
            <h3 className="text-lg font-bold text-black mb-1">Formulir Permintaan Penawaran</h3>
            <p className="text-xs text-gray-500 mb-6">Isi formulir di bawah ini untuk mendapatkan estimasi harga dan ketersediaan stok.</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                      errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:bg-white'
                    } rounded-xl text-xs font-medium focus:outline-none focus:border-red-600 transition-all`}
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <FaExclamationCircle className="text-[10px]" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nama Perusahaan / Perorangan
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Contoh: PT Kubota Indonesia"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="nama@perusahaan.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:bg-white'
                    } rounded-xl text-xs font-medium focus:outline-none focus:border-red-600 transition-all`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <FaExclamationCircle className="text-[10px]" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nomor Telepon / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                      errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:bg-white'
                    } rounded-xl text-xs font-medium focus:outline-none focus:border-red-600 transition-all`}
                  />
                  {errors.phone && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <FaExclamationCircle className="text-[10px]" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Rincian Pesan / Kebutuhan Produk <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Sebutkan nama barang, tipe/spesifikasi, dan jumlah kuantitas yang dibutuhkan..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border ${
                    errors.message ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:bg-white'
                  } rounded-xl text-xs font-medium focus:outline-none focus:border-red-600 transition-all`}
                />
                {errors.message && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <FaExclamationCircle className="text-[10px]" /> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md mt-2"
              >
                <FaPaperPlane className="text-xs" /> Kirim Pesan via WhatsApp
              </button>
            </form>
          </div>

        </div>

        {/* Google Maps Section */}
        <div className="space-y-4 pt-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-600" /> Lokasi CV. Sinergi Solusi Sejahtera
              </h3>
              <p className="text-xs text-gray-500">Jl. Bukit Seruni V No 132 RT.07 RW.19, SendangMulyo, Tembalang, Semarang</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapAddressQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              Buka Petunjuk Arah &rarr;
            </a>
          </div>

          <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100 relative">
            <iframe
              title="Google Maps Location - CV. Sinergi Solusi Sejahtera"
              src={`https://maps.google.com/maps?q=${mapAddressQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </section>
  )
}