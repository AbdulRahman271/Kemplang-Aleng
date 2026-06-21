import React, { useState, useEffect } from 'react';
import { getSettings, submitContactMessage } from '../utils/api';

export const Contact: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [contactInfo, setContactInfo] = useState({
    whatsapp: '+62 812-3456-7890',
    email: 'halo@kemplangaleng.com',
    address: 'Jalan Demang Lebar Daun No. 12, Lorok Pakjo, Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan 30137',
    mapsUrl: 'https://maps.google.com/?q=Demang+Lebar+Daun+Palembang'
  });

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const settings = await getSettings();
        setContactInfo({
          whatsapp: settings.contact_whatsapp || '+62 812-3456-7890',
          email: settings.contact_email || 'halo@kemplangaleng.com',
          address: settings.contact_address || 'Jalan Demang Lebar Daun No. 12, Lorok Pakjo, Kec. Ilir Barat I, Kota Palembang, Sumatera Selatan 30137',
          mapsUrl: settings.contact_maps_url || 'https://maps.google.com/?q=Demang+Lebar+Daun+Palembang'
        });
      } catch (err) {
        console.error('Failed to load contact settings:', err);
      }
    };
    fetchContactSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.phone.trim() || !formState.message.trim()) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await submitContactMessage(formState);
      setIsSubmitted(true);
      setFormState({ name: '', phone: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err: any) {
      console.error('Failed to send contact message:', err);
      setError(err.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean WhatsApp phone number for link (e.g. +62 812-3456-7890 -> 6281234567890)
  const cleanWhatsAppNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');

  return (
    <section
      id="kontak"
      className="py-24 bg-surface-container-low dark:bg-on-background relative overflow-hidden transition-colors duration-300 scroll-mt-16"
    >
      {/* Decorative radial background gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed-dim/10 dark:bg-primary-container/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-fixed/10 dark:bg-secondary-container/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <span className="font-label-sm text-label-sm text-primary dark:text-secondary-container tracking-widest uppercase bg-primary-fixed dark:bg-primary-container/30 px-4 py-1.5 rounded-full">
            Hubungi Kami
          </span>
          <h2 className="font-headline-lg text-headline-lg md:text-[40px] md:leading-[48px] text-on-surface dark:text-on-primary-container mt-6 mb-4">
            Hubungi Kemplang Aleng
          </h2>
          <p className="text-on-surface-variant dark:text-outline-variant max-w-xl mx-auto font-body-md">
            Punya pertanyaan mengenai produk kami, pemesanan kustom, atau tertarik menjadi reseller? Hubungi kami kapan saja.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Card */}
            <div className="flex gap-5 p-6 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed dark:bg-secondary-container/20 text-secondary dark:text-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">chat</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container">
                  WhatsApp
                </h4>
                <p className="text-on-surface-variant dark:text-outline-variant text-body-md">
                  {contactInfo.whatsapp}
                </p>
                <a
                  href={`https://wa.me/${cleanWhatsAppNumber}?text=Halo%20Kemplang%20Aleng,%20saya%20ingin%20bertanya%20tentang%20kemplang...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-label-md text-primary dark:text-secondary-container hover:underline pt-2 font-bold"
                >
                  Hubungi via WhatsApp
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="flex gap-5 p-6 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed dark:bg-primary-container/20 text-primary dark:text-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">mail</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container">
                  Email Resmi
                </h4>
                <p className="text-on-surface-variant dark:text-outline-variant text-body-md">
                  {contactInfo.email}
                </p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="inline-flex items-center gap-1 text-label-md text-primary dark:text-secondary-container hover:underline pt-2 font-bold"
                >
                  Kirim Email ke Kami
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="flex gap-5 p-6 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-primary-fixed-dim/30 dark:bg-primary-fixed-dim/20 text-on-primary-fixed-variant dark:text-primary-fixed-dim flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container">
                  Alamat Produksi & Toko
                </h4>
                <p className="text-on-surface-variant dark:text-outline-variant text-body-md leading-relaxed">
                  {contactInfo.address}
                </p>
                <a
                  href={contactInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-label-md text-primary dark:text-secondary-container hover:underline pt-2 font-bold"
                >
                  Buka di Google Maps
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-[32px] p-8 shadow-sm">
            <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container mb-2">
              Kirim Pesan Langsung
            </h3>
            <p className="text-on-surface-variant dark:text-outline-variant text-body-md mb-8">
              Isi data di bawah ini dan admin kami akan segera menghubungi Anda kembali.
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-secondary-fixed dark:bg-secondary-container/20 border border-secondary-container/30 text-on-secondary-fixed dark:text-secondary-container rounded-2xl flex items-start gap-4 animate-fadeIn">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
                <div>
                  <h4 className="font-bold text-headline-md mb-1">Pesan Terkirim!</h4>
                  <p className="text-body-md"> Terima kasih telah menghubungi kami. Tim kami akan segera menindaklanjuti pesan Anda.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-2xl flex items-center gap-3 text-label-md">
                    <span className="material-symbols-outlined">error</span>
                    {error}
                  </div>
                )}

                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-label-md font-bold text-on-surface-variant dark:text-outline-variant">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 focus:border-primary dark:focus:border-secondary-container rounded-2xl font-body-md text-on-surface dark:text-on-primary-container transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary-container/20"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-label-md font-bold text-on-surface-variant dark:text-outline-variant">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 focus:border-primary dark:focus:border-secondary-container rounded-2xl font-body-md text-on-surface dark:text-on-primary-container transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary-container/20"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-label-md font-bold text-on-surface-variant dark:text-outline-variant">
                    Isi Pesan Anda
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant dark:border-outline/50 focus:border-primary dark:focus:border-secondary-container rounded-2xl font-body-md text-on-surface dark:text-on-primary-container transition-all outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-secondary-container/20 resize-none"
                    placeholder="Tuliskan pertanyaan atau detail pesanan Anda di sini..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary dark:bg-secondary-container text-on-primary dark:text-on-secondary-container hover:bg-primary-container dark:hover:bg-secondary-fixed font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none hover:shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sedang Mengirim...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      Kirim Pesan Sekarang
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
