import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Check,
  CreditCard,
  Banknote,
  Printer,
  Download,
  AlertCircle,
  QrCode,
  Sparkles,
  Smartphone,
  RefreshCw,
  Building2,
  Receipt,
  Layers,
  X,
  FileCheck,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { QaydPosIcon } from '../icons/AppIcons';
import { QaydProduct, QaydCartItem, QaydInvoice } from '../../types/suite';
import { appRegistry } from '../../services/appRegistry';

interface QaydPosAppProps {
  onBack: () => void;
  lang: 'en' | 'ar';
  onOpenPwaModal?: () => void;
}

const INITIAL_PRODUCTS: QaydProduct[] = [
  {
    id: 'p-1',
    barcode: '6281001001',
    sku: 'QYD-COF-01',
    nameAr: 'قهوة سعودية بالهيل والزعفران (دلة فاخرة)',
    nameEn: 'Saudi Coffee with Saffron (Luxury Dallah)',
    category: 'beverages',
    categoryAr: 'مشروبات ساخنة',
    price: 35.0,
    taxRate: 0.15,
    cost: 12.0,
    stock: 48,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-2',
    barcode: '6281001002',
    sku: 'QYD-ESP-02',
    nameAr: 'إسبريسو دبل شوت حبوب إثيوبية مختصة',
    nameEn: 'Double Espresso Ethiopian Roast',
    category: 'beverages',
    categoryAr: 'مشروبات ساخنة',
    price: 16.0,
    taxRate: 0.15,
    cost: 5.5,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-3',
    barcode: '6281001003',
    sku: 'QYD-PAS-03',
    nameAr: 'كرواسون لوز فرنسي مخبوز طازج',
    nameEn: 'Almond French Croissant Freshly Baked',
    category: 'food',
    categoryAr: 'مخبوزات وحلويات',
    price: 18.0,
    taxRate: 0.15,
    cost: 7.0,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-4',
    barcode: '6281001004',
    sku: 'QYD-SWT-04',
    nameAr: 'كعكة تمر سكري مع صوص الكراميل والمكسرات',
    nameEn: 'Sukari Date Cake with Caramel & Nuts',
    category: 'food',
    categoryAr: 'مخبوزات وحلويات',
    price: 24.0,
    taxRate: 0.15,
    cost: 9.0,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-5',
    barcode: '6281001005',
    sku: 'QYD-MAT-05',
    nameAr: 'ماتشا مثلجة بحليب الشوفان العضوي',
    nameEn: 'Iced Matcha with Organic Oat Milk',
    category: 'beverages',
    categoryAr: 'مشروبات باردة',
    price: 22.0,
    taxRate: 0.15,
    cost: 8.0,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-6',
    barcode: '6281001006',
    sku: 'QYD-BEV-06',
    nameAr: 'مياه إيفيان معدنية 500 مل',
    nameEn: 'Evian Mineral Water 500ml',
    category: 'beverages',
    categoryAr: 'مشروبات باردة',
    price: 6.0,
    taxRate: 0.15,
    cost: 2.2,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-7',
    barcode: '6281001007',
    sku: 'QYD-RET-07',
    nameAr: 'كوب حافظ حراري من التيتانيوم بشعار المنظومة',
    nameEn: 'Titanium Thermal Tumbler SNNS Edition',
    category: 'retail',
    categoryAr: 'منتجات التجزئة',
    price: 85.0,
    taxRate: 0.15,
    cost: 40.0,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p-8',
    barcode: '6281001008',
    sku: 'QYD-RET-08',
    nameAr: 'بن قهوة مختصة 250 جرام كولومبي معالج بالتجفيف',
    nameEn: 'Specialty Coffee Beans 250g Colombia Natural',
    category: 'retail',
    categoryAr: 'منتجات التجزئة',
    price: 65.0,
    taxRate: 0.15,
    cost: 32.0,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80',
  },
];

export const QaydPosApp: React.FC<QaydPosAppProps> = ({ onBack, lang, onOpenPwaModal }) => {
  const isAr = lang === 'ar';
  const activeTenant = appRegistry.getActiveTenant();

  const [products] = useState<QaydProduct[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [cart, setCart] = useState<QaydCartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1, discount: 0 },
    { product: INITIAL_PRODUCTS[2], quantity: 2, discount: 0 },
  ]);

  // Payment & Invoice Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mada' | 'cash' | 'visa' | 'split'>('mada');
  const [cashReceived, setCashReceived] = useState<string>('100');
  const [generatedInvoice, setGeneratedInvoice] = useState<QaydInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const vatAmount = subtotal * 0.15;
  const grandTotal = subtotal + vatAmount;

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleAddToCart = (product: QaydProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, discount: 0 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as QaydCartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );
    if (found) {
      handleAddToCart(found);
      showToast(isAr ? `تمت إضافة "${found.nameAr}" بالسكان` : `Added "${found.nameEn}" via scan`);
      setBarcodeInput('');
    } else {
      showToast(isAr ? 'الباركود غير معرف في المخزون' : 'Barcode not found in catalog');
    }
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) return;

    const invoice: QaydInvoice = {
      id: `INV-DRAFT-${Date.now()}`,
      invoiceNumber: `DRAFT-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: isAr ? item.product.nameAr : item.product.nameEn,
        qty: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.product.price * item.quantity,
        vat: item.product.price * item.quantity * 0.15,
        total: item.product.price * item.quantity * 1.15,
      })),
      subtotal,
      vatAmount,
      discount: 0,
      total: grandTotal,
      paymentMethod: selectedPaymentMethod,
      cashierName: 'محمد الشهري (كاشير معتمد)',
      branchName: activeTenant.activeBranch,
      timestamp: new Date().toLocaleString('ar-SA'),
      zatcaQrReady: true,
    };

    setGeneratedInvoice(invoice);
    setShowPaymentModal(false);
    setShowInvoiceModal(true);
  };

  const filteredProducts = products
    .filter((p) => (selectedCategory === 'all' ? true : p.category === selectedCategory))
    .filter((p) =>
      searchQuery
        ? p.nameAr.includes(searchQuery) ||
          p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-screen">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-4 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 font-bold text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Top POS Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title={isAr ? 'العودة لمركز التطبيقات' : 'Back to Launcher'}
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>

          <div className="flex items-center gap-2.5">
            <QaydPosIcon className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>QAYD POS</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {isAr ? 'كاشير نقاط البيع' : 'Retail Cashier'}
                  </span>
                </h1>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.2 rounded font-mono">
                  ZATCA Phase-2 Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-slate-300">{activeTenant.nameAr}</span>
                <span>•</span>
                <span>{activeTenant.activeBranch}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Status & PWA Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Hardware Terminal Status */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-slate-400 text-[11px]">
              {isAr ? 'جهاز الدفع EDC / مدى:' : 'EDC Terminal:'}
            </span>
            <span className="text-amber-400 font-bold text-[11px]">
              {isAr ? 'بانتظار الربط' : 'Awaiting Link'}
            </span>
          </div>

          {/* Standalone PWA Button */}
          {onOpenPwaModal && (
            <button
              onClick={onOpenPwaModal}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer border border-emerald-400/20"
              title={isAr ? 'تثبيت كاشير قيد كتطبيق مستقل على جهازك' : 'Install Standalone POS App'}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'تثبيت PWA مستقل' : 'Install POS'}</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Session / Cashier Badge */}
          <div className="text-end hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-mono">وردية اليوم #892</span>
            <span className="text-xs font-bold text-emerald-400">محمد الشهري</span>
          </div>
        </div>
      </header>

      {/* Main Workspace: Left Catalog, Right Current Invoice */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Product Catalog & Barcode Scanner */}
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 border-e border-slate-800 bg-slate-900/60">
          {/* Top Barcode & Search Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
            {/* Quick Barcode Scanner Input */}
            <form onSubmit={handleBarcodeSubmit} className="relative w-full sm:w-72">
              <Barcode className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="text"
                placeholder={isAr ? 'امسح الباركود أو اكتب SKU...' : 'Scan barcode or SKU...'}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-mono"
              />
            </form>

            {/* Keyword Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'بحث بالاسم في قائمة المنتجات...' : 'Search product name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl ps-9 pe-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none snns-scroll-touch pb-2 mb-3 shrink-0">
            {[
              { id: 'all', nameAr: 'الكل (8)' },
              { id: 'beverages', nameAr: 'المشروبات' },
              { id: 'food', nameAr: 'المخبوزات والحلويات' },
              { id: 'retail', nameAr: 'منتجات التجزئة' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.nameAr}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pe-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddToCart(p)}
                className="bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-2.5 flex flex-col justify-between transition group cursor-pointer shadow-sm relative overflow-hidden"
              >
                <div className="aspect-video w-full rounded-xl overflow-hidden mb-2 bg-slate-900 relative">
                  <img src={p.image} alt={p.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className="absolute bottom-1 end-1 bg-black/70 backdrop-blur-xs text-[10px] text-slate-300 px-1.5 py-0.5 rounded font-mono">
                    المخزون: {p.stock}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-white line-clamp-2 leading-relaxed group-hover:text-emerald-300 transition">
                    {isAr ? p.nameAr : p.nameEn}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.sku}</span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-emerald-400">{p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 ms-1 font-bold">ر.س</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p);
                    }}
                    className="w-7 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart / Current Order Invoice Panel */}
        <aside className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-s border-slate-800 flex flex-col justify-between p-4 shrink-0">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">{isAr ? 'الفاتورة الحالية' : 'Current Order'}</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.2 rounded-full">
                  {cart.reduce((c, i) => c + i.quantity, 0)} عناصر
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إفراغ' : 'Clear'}</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-2 pe-1">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-700 mb-2 stroke-[1.5]" />
                  <span>{isAr ? 'السلة فارغة. اختر من المنتجات أو امسح الباركود' : 'Cart is empty. Select products to begin.'}</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pe-2">
                      <h4 className="font-bold text-white truncate">{isAr ? item.product.nameAr : item.product.nameEn}</h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.product.price.toFixed(2)} ر.س × {item.quantity} ={' '}
                        <span className="text-emerald-400 font-bold">{(item.product.price * item.quantity).toFixed(2)} ر.س</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-white font-mono">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 ms-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Invoice Summary & Checkout Action */}
          <div className="pt-3 border-t border-slate-800 mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'المجموع قبل الضريبة:' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-white">{subtotal.toFixed(2)} ر.س</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
              <span className="font-mono font-bold text-white">{vatAmount.toFixed(2)} ر.س</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-slate-800">
              <span>{isAr ? 'الإجمالي الكلي النهائي:' : 'Grand Total:'}</span>
              <span className="font-mono text-emerald-400 text-lg">{grandTotal.toFixed(2)} ر.س</span>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={cart.length === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isAr ? 'سداد وإصدار فاتورة إلكترونية' : 'Pay & Issue Tax Invoice'}</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">{isAr ? 'طريقة السداد وإصدار الفاتورة' : 'Select Payment Method'}</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl mb-4 text-center">
              <span className="text-xs text-slate-400 block mb-1">{isAr ? 'المبلغ المطلوب سداده:' : 'Total Payable:'}</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{grandTotal.toFixed(2)} ر.س</span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'mada', nameAr: 'بطاقة مدى (Mada)', icon: CreditCard },
                { id: 'cash', nameAr: 'نقداً (Cash)', icon: Banknote },
                { id: 'visa', nameAr: 'فيزا / ماستركارد', icon: CreditCard },
                { id: 'split', nameAr: 'دفع مقسم (Split)', icon: Layers },
              ].map((m) => {
                const IconComp = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition cursor-pointer ${
                      selectedPaymentMethod === m.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span>{m.nameAr}</span>
                  </button>
                );
              })}
            </div>

            {/* Hardware Terminal Notice */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-[11px] text-amber-300/90 flex items-start gap-2 mb-5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  {isAr ? 'تنبيه ربط أجهزة نقاط البيع المالية:' : 'Terminal Hardware Notice:'}
                </span>
                <span>
                  {isAr
                    ? 'الواجهة مجهزة معمارياً للربط مع أجهزة الدفع (EDC / Mada) عبر البنك التابع لمنشأتك دون الارتباط بمزود واحد.'
                    : 'System is architected to link with any certified bank EDC terminal independently.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmSale}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-amber-300" />
              <span>{isAr ? 'فحص ومطابقة الفاتورة (بانتظار ربط جهاز الدفع)' : 'Inspect Invoice (Awaiting EDC Terminal Link)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal (ZATCA Format Ready - Awaiting Live Financial Integration) */}
      {showInvoiceModal && generatedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 text-xs">
            {/* Awaiting Link Header Banner */}
            <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
              <span className="font-bold flex items-center justify-center gap-1.5 text-[11px] mb-0.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAr ? 'مسودة فنية — بانتظار الربط المالي' : 'Technical Draft — Awaiting Bank Link'}</span>
              </span>
              <p className="text-[10px] text-amber-700 leading-tight">
                {isAr
                  ? 'الواجهة جاهزة ومطابقة لهيئة الزكاة (المرحلة 2). لم يتم تسجيل عملية مالية حقيقية لعدم اتصال جهاز الدفع.'
                  : 'ZATCA Phase 2 schema ready. No financial charges processed (EDC awaiting link).'}
              </p>
            </div>

            {/* Header / Store Info */}
            <div className="text-center pb-3 border-b border-slate-200">
              <span className="font-black text-base text-slate-900 block">{activeTenant.nameAr}</span>
              <span className="text-[11px] text-slate-500 block">{activeTenant.activeBranch}</span>
              <span className="text-[10px] text-slate-500 font-mono block mt-1">
                الرقم الضريبي: {activeTenant.vatNumber}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                السجل التجاري: {activeTenant.commercialRegistration}
              </span>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">رقم المسودة:</span>
                <span className="font-mono font-bold text-slate-800">{generatedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الربط:</span>
                <span className="font-bold text-amber-600">بانتظار ربط خادم قيد المركزي</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">الكاشير:</span>
                <span>{generatedInvoice.cashierName}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2.5 border-b border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
              {generatedInvoice.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span>
                    {it.name} × {it.qty}
                  </span>
                  <span className="font-mono font-bold">{it.total.toFixed(2)} ر.س</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">المجموع غير شامل الضريبة:</span>
                <span className="font-mono">{generatedInvoice.subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ضريبة القيمة المضافة (15%):</span>
                <span className="font-mono">{generatedInvoice.vatAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                <span>الإجمالي المحسوب:</span>
                <span className="font-mono text-emerald-700">{generatedInvoice.total.toFixed(2)} ر.س</span>
              </div>
            </div>

            {/* ZATCA QR Code Representation */}
            <div className="py-2.5 text-center flex flex-col items-center justify-center">
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-200 mb-1">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                مخطط التشفير ZATCA Phase-2 مجهز برمجياً
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setCart([]);
                  showToast(isAr ? 'تم حفظ المسودة محلياً بنجاح' : 'Draft saved locally');
                }}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer"
              >
                {isAr ? 'إغلاق ومتابعة البيع' : 'Close & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
