import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Category, ContactMessage, Review } from '@kemplang/types';
import {
  getSession,
  logout,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSettings,
  updateSettings,
  getContactMessages,
  updateContactMessageStatus,
  getAdminReviews,
  createReview,
  updateReview,
  updateReviewApproval,
  deleteReview
} from '../utils/api';

type AdminTab = 'products' | 'categories' | 'about' | 'contact' | 'reviews';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [adminName, setAdminName] = useState('Administrator');
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- Data States ---
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [messagesList, setMessagesList] = useState<ContactMessage[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [contactSubTab, setContactSubTab] = useState<'info' | 'messages'>('info');

  // --- Form Settings States ---
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');
  const [aboutFeatures, setAboutFeatures] = useState<Array<{ icon: string; title: string; description: string }>>([]);

  const [contactWhatsApp, setContactWhatsApp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactMapsUrl, setContactMapsUrl] = useState('');

  // --- Modals State ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    weight: 0,
    category: '',
    image: '',
    badge: '',
    altText: ''
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: ''
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({
    id: '',
    name: '',
    role: 'Pelanggan',
    rating: 5,
    comment: '',
    isApproved: true
  });

  // Verify auth session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sessionData = await getSession();
        if (!sessionData?.user || sessionData.user.role !== 'admin') {
          navigate('/login');
        } else {
          setAdminName(sessionData.user.name);
          // Initial load
          loadData();
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        navigate('/login');
      } finally {
        setCheckingSession(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats, msgs, settings, revs] = await Promise.all([
        getProducts(),
        getCategories(),
        getContactMessages().catch(() => [] as ContactMessage[]),
        getSettings(),
        getAdminReviews().catch(() => [] as Review[])
      ]);

      setProductsList(prods);
      setCategoriesList(cats);
      setMessagesList(msgs);
      setReviewsList(revs);

      // Load Settings
      setAboutTitle(settings.about_title || 'Kenapa Harus Kami?');
      setAboutDescription(settings.about_description || '');
      if (settings.about_features) {
        setAboutFeatures(JSON.parse(settings.about_features));
      }
      setContactWhatsApp(settings.contact_whatsapp || '');
      setContactEmail(settings.contact_email || '');
      setContactAddress(settings.contact_address || '');
      setContactMapsUrl(settings.contact_maps_url || '');
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setErrorMsg('Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  // --- Product CRUD Actions ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: '',
      name: '',
      description: '',
      price: 0,
      weight: 0,
      category: categoriesList[0]?.id || '',
      image: '',
      badge: '',
      altText: ''
    });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      weight: prod.weight,
      category: prod.category,
      image: prod.image,
      badge: prod.badge || '',
      altText: prod.altText
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description || !productForm.category || !productForm.image) {
      showNotification('Harap isi semua kolom wajib.', true);
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        weight: Number(productForm.weight),
        category: productForm.category,
        image: productForm.image,
        badge: productForm.badge || undefined,
        altText: productForm.altText || productForm.name
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, submitData);
        showNotification('Produk berhasil diperbarui.');
      } else {
        await createProduct({
          ...submitData,
          id: productForm.id || undefined
        });
        showNotification('Produk baru berhasil ditambahkan.');
      }
      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menyimpan produk.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      showNotification('Produk berhasil dihapus.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menghapus produk.', true);
    } finally {
      setLoading(false);
    }
  };

  // --- Category CRUD Actions ---
  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ id: '', name: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ id: cat.id, name: cat.name, description: cat.description || '' });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.id || !categoryForm.name) {
      showNotification('ID Kategori dan Nama wajib diisi.', true);
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: categoryForm.name,
          description: categoryForm.description
        });
        showNotification('Kategori berhasil diperbarui.');
      } else {
        await createCategory(categoryForm);
        showNotification('Kategori baru berhasil ditambahkan.');
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menyimpan kategori.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Menghapus kategori akan berdampak pada produk terkait. Yakin ingin menghapus?')) return;
    try {
      setLoading(true);
      await deleteCategory(id);
      showNotification('Kategori berhasil dihapus.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menghapus kategori.', true);
    } finally {
      setLoading(false);
    }
  };

  // --- About Update ---
  const handleAboutFeatureChange = (index: number, field: string, val: string) => {
    const updated = [...aboutFeatures];
    updated[index] = { ...updated[index], [field]: val };
    setAboutFeatures(updated);
  };

  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateSettings({
        about_title: aboutTitle,
        about_description: aboutDescription,
        about_features: JSON.stringify(aboutFeatures)
      });
      showNotification('Konten Tentang Kami berhasil disimpan.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menyimpan pengaturan Tentang Kami.', true);
    } finally {
      setLoading(false);
    }
  };

  // --- Contact Info Submit ---
  const handleContactInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateSettings({
        contact_whatsapp: contactWhatsApp,
        contact_email: contactEmail,
        contact_address: contactAddress,
        contact_maps_url: contactMapsUrl
      });
      showNotification('Pengaturan Kontak berhasil disimpan.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menyimpan pengaturan Kontak.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageStatusChange = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    try {
      setLoading(true);
      await updateContactMessageStatus(id, newStatus);
      showNotification('Status pesan berhasil diperbarui.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal memperbarui status pesan.', true);
    } finally {
      setLoading(false);
    }
  };

  // --- Review CRUD Actions ---
  const openAddReview = () => {
    setEditingReview(null);
    setReviewForm({
      id: '',
      name: '',
      role: 'Pelanggan',
      rating: 5,
      comment: '',
      isApproved: true
    });
    setIsReviewModalOpen(true);
  };

  const openEditReview = (rev: Review) => {
    setEditingReview(rev);
    setReviewForm({
      id: rev.id,
      name: rev.name,
      role: rev.role,
      rating: rev.rating,
      comment: rev.comment,
      isApproved: rev.isApproved !== false
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      showNotification('Nama dan komentar wajib diisi.', true);
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        name: reviewForm.name,
        role: reviewForm.role,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        isApproved: reviewForm.isApproved
      };

      if (editingReview) {
        await updateReview(editingReview.id, submitData);
        showNotification('Review berhasil diperbarui.');
      } else {
        await createReview(submitData);
        showNotification('Review baru berhasil ditambahkan.');
      }
      setIsReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menyimpan review.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewToggleApproval = async (id: string, currentApproval: boolean) => {
    try {
      setLoading(true);
      await updateReviewApproval(id, !currentApproval);
      showNotification('Status moderasi review berhasil diperbarui.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal memperbarui status moderasi.', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus review ini?')) return;
    try {
      setLoading(true);
      await deleteReview(id);
      showNotification('Review berhasil dihapus.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Gagal menghapus review.', true);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background dark:bg-on-background flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface-container-lowest dark:bg-on-background transition-colors duration-300 text-on-surface dark:text-on-primary-container font-body-md">
      
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant/30 dark:border-outline/10 shrink-0 hidden md:flex flex-col p-6 relative">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div>
            <h2 className="font-bold text-headline-sm leading-tight text-on-surface dark:text-on-primary-container">
              Kemplang Aleng
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-outline-variant">Dashboard Admin</p>
          </div>
        </div>

        {/* Tab List */}
        <nav className="space-y-1.5 flex-grow">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'products'
                ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-sm'
                : 'hover:bg-surface-container-high/50 dark:hover:bg-outline/5 text-on-surface-variant dark:text-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Kelola Produk
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'categories'
                ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-sm'
                : 'hover:bg-surface-container-high/50 dark:hover:bg-outline/5 text-on-surface-variant dark:text-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">category</span>
            Kelola Kategori
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'about'
                ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-sm'
                : 'hover:bg-surface-container-high/50 dark:hover:bg-outline/5 text-on-surface-variant dark:text-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">info</span>
            Tentang Kami
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'contact'
                ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-sm'
                : 'hover:bg-surface-container-high/50 dark:hover:bg-outline/5 text-on-surface-variant dark:text-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">contact_mail</span>
            Hubungi Kami
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-left ${
              activeTab === 'reviews'
                ? 'bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container shadow-sm'
                : 'hover:bg-surface-container-high/50 dark:hover:bg-outline/5 text-on-surface-variant dark:text-outline-variant'
            }`}
          >
            <span className="material-symbols-outlined text-lg">rate_review</span>
            Kelola Review
          </button>
        </nav>

        {/* User Block in Sidebar */}
        <div className="pt-6 border-t border-outline-variant/30 dark:border-outline/10 space-y-3">
          <div className="px-2">
            <p className="text-xs text-on-surface-variant dark:text-outline-variant leading-none">Login sebagai:</p>
            <h4 className="font-bold text-label-md truncate text-on-surface dark:text-on-primary-container mt-1.5">{adminName}</h4>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-outline-variant dark:border-outline/50 hover:bg-error/10 dark:hover:bg-error-container/20 text-error hover:border-error/20 dark:hover:border-error-container/30 rounded-2xl font-bold transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen min-w-0 w-full overflow-x-hidden">
        
        {/* Header (Top Navigation for Mobile) */}
        <header className="bg-surface-container-low dark:bg-inverse-surface border-b border-outline-variant/30 dark:border-outline/10 px-6 py-4 md:py-6 flex items-center justify-between z-20">
          <div className="md:hidden flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <span className="font-bold text-headline-sm">Kemplang Aleng</span>
          </div>

          <div className="hidden md:block">
            <h1 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container capitalize flex items-center gap-2">
              {activeTab === 'products' && 'Kelola Produk'}
              {activeTab === 'categories' && 'Kelola Kategori'}
              {activeTab === 'about' && 'Tentang Kami'}
              {activeTab === 'contact' && 'Pengaturan Kontak & Pesan'}
              {activeTab === 'reviews' && 'Kelola Review Pelanggan'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-label-md text-primary dark:text-secondary-container hover:underline"
            >
              Lihat Web
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-xl border border-outline-variant hover:bg-error/10 text-error hover:border-error/20 transition-all flex items-center"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden bg-surface-container-low dark:bg-inverse-surface border-b border-outline-variant/30 dark:border-outline/10 px-4 py-2 overflow-x-auto flex gap-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
              activeTab === 'products' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-outline/5'
            }`}
          >
            Produk
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
              activeTab === 'categories' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-outline/5'
            }`}
          >
            Kategori
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
              activeTab === 'about' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-outline/5'
            }`}
          >
            Tentang
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
              activeTab === 'contact' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-outline/5'
            }`}
          >
            Kontak
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap text-sm transition-all ${
              activeTab === 'reviews' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-outline/5'
            }`}
          >
            Review
          </button>
        </div>

        {/* Action Notifications */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto relative">
          
          {loading && (
            <div className="absolute top-4 right-8 bg-surface-container-high/80 dark:bg-outline/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/30 dark:border-outline/10 text-label-md text-on-surface shadow-md">
              <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Memproses...
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-secondary-fixed dark:bg-secondary-container/20 border border-secondary-container/30 text-on-secondary-fixed dark:text-secondary-container rounded-2xl flex items-center gap-3 text-label-md animate-fadeIn">
              <span className="material-symbols-outlined">check_circle</span>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-error-container text-on-error-container border border-error/20 rounded-2xl flex items-center gap-3 text-label-md animate-fadeIn">
              <span className="material-symbols-outlined">error</span>
              {errorMsg}
            </div>
          )}

          {/* -------------------- TAB: PRODUCTS -------------------- */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-on-surface-variant dark:text-outline-variant font-body-md hidden sm:block">
                  Kelola katalog produk kemplang yang ditampilkan di landing page.
                </p>
                <button
                  onClick={openAddProduct}
                  className="px-5 py-3 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container hover:bg-primary-container dark:hover:bg-primary font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Tambah Produk
                </button>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsList.length > 0 ? (
                  productsList.map((prod) => (
                    <div key={prod.id} className="bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
                      <div className="space-y-4">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container-highest bg-slate-100 dark:bg-outline/5">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {prod.badge && (
                            <span className="absolute top-3 left-3 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-headline-sm leading-tight text-on-surface dark:text-on-primary-container">{prod.name}</h4>
                          </div>
                          <span className="inline-block px-3 py-1 bg-surface-container-high dark:bg-outline/10 text-on-surface-variant dark:text-outline-variant rounded-full text-xs font-bold capitalize">
                            {categoriesList.find(c => c.id === prod.category)?.name || prod.category}
                          </span>
                          <div className="flex justify-between items-baseline pt-2">
                            <span className="font-bold text-headline-sm text-primary dark:text-secondary-container">
                              Rp {prod.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-on-surface-variant dark:text-outline-variant font-medium">
                              {prod.weight}g
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-5 mt-4 border-t border-outline-variant/10">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm bg-primary/5 hover:bg-primary/10 text-primary dark:text-secondary-container dark:bg-secondary-container/5 dark:hover:bg-secondary-container/10 rounded-2xl font-bold transition-all"
                          title="Edit Produk"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm bg-error/5 hover:bg-error/10 text-error rounded-2xl font-bold transition-all"
                          title="Hapus Produk"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center text-on-surface-variant dark:text-outline-variant bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl">
                    Belum ada produk. Silakan tambahkan produk baru.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------- TAB: CATEGORIES -------------------- */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-on-surface-variant dark:text-outline-variant font-body-md hidden sm:block">
                  Kelola kategori filter produk yang memilah kemplang berdasarkan tipe pengolahan atau rasa.
                </p>
                <button
                  onClick={openAddCategory}
                  className="px-5 py-3 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container hover:bg-primary-container dark:hover:bg-primary font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Tambah Kategori
                </button>
              </div>

              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoriesList.length > 0 ? (
                  categoriesList.map((cat) => (
                    <div key={cat.id} className="bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-headline-sm text-on-surface dark:text-on-primary-container">{cat.name}</h4>
                          <span className="font-mono text-xs text-primary dark:text-secondary-container bg-primary/5 dark:bg-secondary-container/5 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                            {cat.id}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface-variant dark:text-outline-variant">
                          {cat.description || 'Tidak ada deskripsi.'}
                        </p>
                      </div>
                      <div className="flex gap-3 pt-5 mt-4 border-t border-outline-variant/10">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm bg-primary/5 hover:bg-primary/10 text-primary dark:text-secondary-container dark:bg-secondary-container/5 dark:hover:bg-secondary-container/10 rounded-2xl font-bold transition-all"
                          title="Edit Kategori"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm bg-error/5 hover:bg-error/10 text-error rounded-2xl font-bold transition-all"
                          title="Hapus Kategori"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center text-on-surface-variant dark:text-outline-variant bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl">
                    Belum ada kategori. Silakan tambahkan kategori baru.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------- TAB: ABOUT -------------------- */}
          {activeTab === 'about' && (
            <form onSubmit={handleAboutSubmit} className="space-y-8 bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="border-b border-outline-variant/30 dark:border-outline/10 pb-4">
                <h3 className="font-bold text-headline-md">Halaman Tentang Kami (Why Us)</h3>
                <p className="text-sm text-on-surface-variant dark:text-outline-variant mt-1">Ubah judul, sub-judul deskripsi, dan 4 kartu keunggulan kemplang Aleng.</p>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="aboutTitle" className="block text-label-md font-bold">Judul Utama</label>
                  <input
                    type="text"
                    id="aboutTitle"
                    value={aboutTitle}
                    onChange={(e) => setAboutTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="aboutDescription" className="block text-label-md font-bold">Deskripsi Sub-Judul</label>
                  <textarea
                    id="aboutDescription"
                    value={aboutDescription}
                    onChange={(e) => setAboutDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md resize-none"
                    required
                  />
                </div>
              </div>

              {/* 4 Cards Features */}
              <div className="space-y-4">
                <h4 className="font-bold text-label-lg border-b border-outline-variant/20 dark:border-outline/5 pb-2">4 Kartu Keunggulan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {aboutFeatures.map((feat, idx) => (
                    <div key={idx} className="p-5 border border-outline-variant/40 dark:border-outline/10 rounded-2xl bg-surface-container-lowest dark:bg-surface-dim/40 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-primary dark:text-secondary-container tracking-wider uppercase bg-primary-fixed dark:bg-outline/25 px-2.5 py-1 rounded-full">
                          Kartu Keunggulan #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-xs font-bold text-on-surface-variant">Icon Google</label>
                          <input
                            type="text"
                            value={feat.icon}
                            onChange={(e) => handleAboutFeatureChange(idx, 'icon', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl"
                            title="Masukkan ID Icon Material Symbols (misal: verified, local_shipping, chat)"
                            required
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-on-surface-variant">Judul Keunggulan</label>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={(e) => handleAboutFeatureChange(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant">Deskripsi Ringkas</label>
                        <textarea
                          value={feat.description}
                          onChange={(e) => handleAboutFeatureChange(idx, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl resize-none"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container hover:bg-primary-container dark:hover:bg-primary font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-75"
                >
                  Simpan Konten Tentang Kami
                </button>
              </div>
            </form>
          )}

          {/* -------------------- TAB: CONTACT -------------------- */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              
              {/* Secondary Tabs */}
              <div className="flex border-b border-outline-variant/30 dark:border-outline/10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button
                  onClick={() => setContactSubTab('info')}
                  className={`px-5 py-3 font-bold border-b-2 transition-all shrink-0 ${
                    contactSubTab === 'info'
                      ? 'border-primary text-primary dark:border-secondary-container dark:text-secondary-container'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Informasi Kontak Toko
                </button>
                <button
                  onClick={() => setContactSubTab('messages')}
                  className={`px-5 py-3 font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                    contactSubTab === 'messages'
                      ? 'border-primary text-primary dark:border-secondary-container dark:text-secondary-container'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Pesan Masuk Pelanggan
                  {messagesList.filter(m => m.status === 'unread').length > 0 && (
                    <span className="bg-error text-on-error font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {messagesList.filter(m => m.status === 'unread').length}
                    </span>
                  )}
                </button>
              </div>

              {/* Subtab: Info Kontak Form */}
              {contactSubTab === 'info' && (
                <form onSubmit={handleContactInfoSubmit} className="bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contactWhatsApp" className="block text-label-md font-bold">Nomor WhatsApp</label>
                      <input
                        type="text"
                        id="contactWhatsApp"
                        value={contactWhatsApp}
                        onChange={(e) => setContactWhatsApp(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md"
                        placeholder="Contoh: +62 812-3456-7890"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contactEmail" className="block text-label-md font-bold">Email Resmi</label>
                      <input
                        type="email"
                        id="contactEmail"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md"
                        placeholder="Contoh: halo@kemplangaleng.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactAddress" className="block text-label-md font-bold">Alamat Produksi & Toko</label>
                    <textarea
                      id="contactAddress"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md resize-none"
                      placeholder="Tuliskan alamat toko secara lengkap..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="contactMapsUrl" className="block text-label-md font-bold">URL Google Maps Link</label>
                    <input
                      type="url"
                      id="contactMapsUrl"
                      value={contactMapsUrl}
                      onChange={(e) => setContactMapsUrl(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant dark:border-outline/50 rounded-2xl outline-none focus:border-primary transition-all font-body-md"
                      placeholder="Contoh: https://maps.google.com/..."
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3.5 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container hover:bg-primary-container dark:hover:bg-primary font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-75"
                    >
                      Simpan Informasi Kontak
                    </button>
                  </div>
                </form>
              )}

              {/* Subtab: Messages Layout */}
              {contactSubTab === 'messages' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {messagesList.length > 0 ? (
                    messagesList.map((msg) => (
                      <div key={msg.id} className={`border border-outline-variant/30 dark:border-outline/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all duration-300 ${msg.status === 'unread' ? 'bg-primary/5 dark:bg-primary-container/5 border-primary/20 hover:shadow-md' : 'bg-surface-container-low dark:bg-inverse-surface hover:shadow-md'}`}>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-bold text-headline-sm ${msg.status === 'unread' ? 'text-primary dark:text-secondary-container' : 'text-on-surface'}`}>{msg.name}</h4>
                              <a href={`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface-variant dark:text-outline-variant hover:underline flex items-center gap-1 mt-1 font-mono">
                                <span className="material-symbols-outlined text-[10px]">chat</span>
                                {msg.phone}
                              </a>
                            </div>
                            <div className="shrink-0 ml-2">
                              {msg.status === 'unread' && <span className="bg-error-container text-on-error-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Baru</span>}
                              {msg.status === 'read' && <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Dibaca</span>}
                              {msg.status === 'replied' && <span className="bg-secondary-fixed dark:bg-secondary-container/20 text-on-secondary-fixed dark:text-secondary-container px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Dibalas</span>}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed text-on-surface-variant dark:text-outline-variant break-words">
                            {msg.message}
                          </p>
                        </div>
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-outline-variant/10">
                          <span className="text-[10px] text-on-surface-variant dark:text-outline-variant font-medium">
                            {new Date(msg.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <div className="flex gap-2">
                            {msg.status === 'unread' && (
                              <button
                                onClick={() => handleMessageStatusChange(msg.id, 'read')}
                                className="px-3 py-2 bg-surface-container border border-outline-variant text-[11px] font-bold rounded-xl hover:bg-outline-variant/30 transition-all shadow-sm"
                              >
                                Dibaca
                              </button>
                            )}
                            {msg.status !== 'replied' && (
                              <button
                                onClick={() => {
                                  handleMessageStatusChange(msg.id, 'replied');
                                  window.open(`https://wa.me/${msg.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(msg.name)},%20kami%20admin%20Kemplang%20Aleng%20ingin%20membalas%20pesan%20Anda...`, '_blank');
                                }}
                                className="px-3 py-2 bg-[#25D366] text-white text-[11px] font-bold rounded-xl hover:shadow-md flex items-center gap-1 transition-all"
                              >
                                <span className="material-symbols-outlined text-xs">reply</span>
                                Balas
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-12 text-center text-on-surface-variant dark:text-outline-variant bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl">
                      Tidak ada pesan masuk.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* -------------------- TAB: REVIEWS -------------------- */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-on-surface-variant dark:text-outline-variant font-body-md hidden sm:block">
                  Moderasi, tambah, ubah, atau hapus testimoni pelanggan yang ditampilkan di halaman depan.
                </p>
                <button
                  onClick={openAddReview}
                  className="px-5 py-3 bg-primary dark:bg-primary-container text-on-primary dark:text-on-primary-container hover:bg-primary-container dark:hover:bg-primary font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Tambah Review
                </button>
              </div>

              {/* Reviews Table */}
              <div className="bg-surface-container-low dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-high dark:bg-outline/10 text-on-surface-variant dark:text-outline-variant border-b border-outline-variant/30 text-label-md">
                        <th className="p-4 font-bold">Pelanggan</th>
                        <th className="p-4 font-bold">Rating</th>
                        <th className="p-4 font-bold hidden md:table-cell">Komentar</th>
                        <th className="p-4 font-bold hidden sm:table-cell">Tanggal</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 dark:divide-outline/10">
                      {reviewsList.length > 0 ? (
                        reviewsList.map((rev) => {
                          const isHexBg = rev.avatarBg && rev.avatarBg.startsWith('#');
                          const avatarStyle = isHexBg ? { backgroundColor: rev.avatarBg, color: rev.avatarColor } : {};
                          const avatarClass = isHexBg
                            ? "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm select-none"
                            : `w-10 h-10 rounded-full ${rev.avatarBg} ${rev.avatarColor} flex items-center justify-center font-bold text-sm select-none`;

                          return (
                            <tr key={rev.id} className="hover:bg-surface-container/50 dark:hover:bg-outline/5 transition-colors">
                              <td className="p-4 flex items-center gap-3">
                                <div className={avatarClass} style={avatarStyle}>
                                  {rev.initial}
                                </div>
                                <div>
                                  <h4 className="font-bold leading-tight">{rev.name}</h4>
                                  <p className="text-xs text-on-surface-variant dark:text-outline-variant mt-0.5">{rev.role}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex text-secondary dark:text-secondary-fixed-dim select-none font-bold text-sm">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`material-symbols-outlined text-base ${
                                        i < Math.floor(rev.rating) ? 'text-secondary dark:text-secondary-fixed-dim' : 'text-outline-variant/40'
                                      }`}
                                      style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                      star
                                    </span>
                                  ))}
                                  <span className="ml-1 sm:inline hidden text-xs text-on-surface-variant">({rev.rating})</span>
                                </div>
                              </td>
                              <td className="p-4 hidden md:table-cell text-sm leading-relaxed max-w-xs break-words">
                                {rev.comment}
                              </td>
                              <td className="p-4 hidden sm:table-cell text-xs text-on-surface-variant dark:text-outline-variant">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleString('id-ID', { dateStyle: 'short' })
                                  : '-'}
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => handleReviewToggleApproval(rev.id, rev.isApproved !== false)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    rev.isApproved !== false
                                      ? 'bg-secondary-fixed dark:bg-secondary-container/20 text-on-secondary-fixed dark:text-secondary-container border-secondary-container/30 hover:bg-red-500 hover:text-white hover:border-red-600'
                                      : 'bg-error-container text-on-error-container border-error/20 hover:bg-[#25D366] hover:text-white hover:border-green-600'
                                  }`}
                                  title={rev.isApproved !== false ? 'Klik untuk Sembunyikan' : 'Klik untuk Tampilkan'}
                                >
                                  {rev.isApproved !== false ? 'Disetujui' : 'Pending'}
                                </button>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => openEditReview(rev)}
                                    className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                                    title="Edit Review"
                                  >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(rev.id)}
                                    className="p-2 text-error hover:bg-error/10 rounded-xl transition-all"
                                    title="Hapus Review"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-on-surface-variant dark:text-outline-variant">
                            Belum ada review. Silakan tambahkan review baru.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* -------------------- MODAL: PRODUCT (ADD & EDIT) -------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-[32px] w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-headline-md">
                {editingProduct ? 'Edit Produk Kemplang' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-outline/5 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="prodId" className="text-xs font-bold">ID Produk (Opsional)</label>
                  <input
                    type="text"
                    id="prodId"
                    value={productForm.id}
                    onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="Auto-generate"
                    disabled={!!editingProduct}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prodName" className="text-xs font-bold">Nama Kemplang *</label>
                  <input
                    type="text"
                    id="prodName"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="Contoh: Kemplang Tunu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="prodDesc" className="text-xs font-bold">Deskripsi Produk *</label>
                <textarea
                  id="prodDesc"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary resize-none"
                  placeholder="Ceritakan tentang renyah dan gurihnya produk ini..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="prodPrice" className="text-xs font-bold">Harga Rupiah *</label>
                  <input
                    type="number"
                    id="prodPrice"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="45000"
                    min={0}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="prodWeight" className="text-xs font-bold">Berat (Gram) *</label>
                  <input
                    type="number"
                    id="prodWeight"
                    value={productForm.weight || ''}
                    onChange={(e) => setProductForm({ ...productForm, weight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="250"
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="prodCat" className="text-xs font-bold">Kategori Produk *</label>
                  <select
                    id="prodCat"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    required
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="prodBadge" className="text-xs font-bold">Badge Promo (Opsional)</label>
                  <input
                    type="text"
                    id="prodBadge"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="Terlaris, Baru, Diskon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="prodImgUrl" className="text-xs font-bold">URL Foto Produk *</label>
                <input
                  type="url"
                  id="prodImgUrl"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                  placeholder="https://example.com/gambar-kemplang.jpg"
                  required
                />
                
                {productForm.image && (
                  <div className="mt-2 relative w-full h-[180px] rounded-2xl overflow-hidden border border-outline-variant/30">
                    <img
                      src={productForm.image}
                      alt="Pratinjau Produk"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Gambar+Tidak+Valid';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="prodAltText" className="text-xs font-bold">Alt Text Gambar</label>
                <input
                  type="text"
                  id="prodAltText"
                  value={productForm.altText}
                  onChange={(e) => setProductForm({ ...productForm, altText: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                  placeholder="Kemplang Aleng Panggang Ikan Belida"
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-outline-variant rounded-xl font-bold text-sm hover:bg-outline/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-bold text-sm rounded-xl hover:shadow-md"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CATEGORY (ADD & EDIT) -------------------- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-headline-md">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-outline/5 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="catId" className="text-xs font-bold">Slug / ID Kategori *</label>
                <input
                  type="text"
                  id="catId"
                  value={categoryForm.id}
                  onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary font-mono"
                  placeholder="roasted, curly, pedas-daun-jeruk"
                  disabled={!!editingCategory}
                  required
                />
                <p className="text-[10px] text-on-surface-variant mt-0.5">ID berupa huruf kecil, angka, dan strip (tanpa spasi).</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="catName" className="text-xs font-bold">Nama Kategori *</label>
                <input
                  type="text"
                  id="catName"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                  placeholder="Contoh: Panggang Ikan"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="catDesc" className="text-xs font-bold">Deskripsi Ringkas</label>
                <textarea
                  id="catDesc"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary resize-none"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-outline-variant rounded-xl font-bold text-sm hover:bg-outline/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-bold text-sm rounded-xl hover:shadow-md"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODAL: REVIEW (ADD & EDIT) -------------------- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/10 rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-headline-md">
                {editingReview ? 'Edit Review Pelanggan' : 'Tambah Review Baru'}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-xl text-on-surface-variant hover:bg-outline/5 hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="revName" className="text-xs font-bold">Nama Pelanggan *</label>
                <input
                  type="text"
                  id="revName"
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="revRole" className="text-xs font-bold">Pekerjaan / Peran *</label>
                  <input
                    type="text"
                    id="revRole"
                    value={reviewForm.role}
                    onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    placeholder="Contoh: Pelanggan Setia"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="revRating" className="text-xs font-bold">Rating Bintang *</label>
                  <select
                    id="revRating"
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary"
                    required
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Bintang</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Bintang</option>
                    <option value={3}>⭐⭐⭐ 3 Bintang</option>
                    <option value={2}>⭐⭐ 2 Bintang</option>
                    <option value={1}>⭐ 1 Bintang</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="revComment" className="text-xs font-bold">Komentar / Testimoni *</label>
                <textarea
                  id="revComment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant rounded-xl outline-none focus:border-primary resize-none"
                  placeholder="Tuliskan ulasan pelanggan di sini..."
                  required
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="revApproved"
                  checked={reviewForm.isApproved}
                  onChange={(e) => setReviewForm({ ...reviewForm, isApproved: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="revApproved" className="text-sm font-bold cursor-pointer select-none">
                  Tampilkan langsung di halaman utama (Disetujui)
                </label>
              </div>

              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 border border-outline-variant rounded-xl font-bold text-sm hover:bg-outline/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary-container font-bold text-sm rounded-xl hover:shadow-md"
                >
                  Simpan Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
