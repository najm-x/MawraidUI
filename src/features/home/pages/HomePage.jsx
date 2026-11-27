// ═══════════ الصفحة الرئيسية — منصة موارد (تعز) | نظام تصميم DGA Platforms Code ═══════════
import { useState } from 'react'
import { BrandLogo, Icons, ResourceBadge } from '../../../shared/components/ui'

export default function Home({ go }) {
  const [activeDistrict, setActiveDistrict] = useState('al-qahirah')
  const [menuOpen, setMenuOpen] = useState(false)
  const [regOpen, setRegOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const navLinks = [
    { href: '#resources', label: 'الموارد الأساسية' },
    { href: '#how-it-works', label: 'كيف يعمل النظام' },
    { href: '#centers', label: 'نقاط التوزيع في تعز' },
    { href: '#transparency', label: 'الشفافية والرقابة' },
    { href: '#faq', label: 'الأسئلة الشائعة' },
  ]

  const districtHubs = {
    'al-qahirah': [
      { name: 'مركز مسبح للتوزيع (غاز)', area: 'حي المسبح - جوار مدرسة الشعب', resource: 'gas', status: 'متاح اليوم', hours: '08:00 ص - 01:00 م' },
      { name: 'محطة مياه النسيم المعتمدة', area: 'جولة سنان - شارع 26', resource: 'water', status: 'ضخ نشط', hours: '07:00 ص - 06:00 م' },
      { name: 'محطة الصقر للمشتقات (باصات)', area: 'شارع جمال - قرب جولة العواضي', resource: 'fuel', status: 'توزيع منتظم', hours: '06:00 ص - 10:00 م' },
    ],
    'al-mudhaffar': [
      { name: 'مركز حبيل سلمان للغاز المنزلي', area: 'حبيل سلمان - جوار جامعة تعز', resource: 'gas', status: 'متاح اليوم', hours: '08:30 ص - 02:00 م' },
      { name: 'نقطة توزيع صهاريج صينة', area: 'وادي المعقب - صينة', resource: 'water', status: 'حجز مسبق', hours: '08:00 ص - 04:00 م' },
      { name: 'محطة بيرباشا المركزية للوقود', area: 'مدخل بيرباشا - خط الحصب', resource: 'fuel', status: 'مخصصات النقل', hours: '06:00 ص - 08:00 م' },
    ],
    salah: [
      { name: 'مركز الجحملية المعتمد للغاز', area: 'الجحملية العليا - قرب المستشفى العسكري', resource: 'gas', status: 'متاح اليوم', hours: '08:00 ص - 01:30 م' },
      { name: 'محطة مياه ثعبات وحوض الأشراف', area: 'شارع 16 - حوض الأشراف', resource: 'water', status: 'ضخ مجدول', hours: '07:30 ص - 05:00 م' },
      { name: 'نقطة توزيع المحروقات - صالة', area: 'العسكري - جوار مركز الشرطة', resource: 'fuel', status: 'متاح للمركبات', hours: '07:00 ص - 07:00 م' },
    ],
  }

  const faqs = [
    {
      q: 'ما هي الوثائق المطلوبة لتسجيل الأسرة في منصة موارد؟',
      a: 'صورة من البطاقة الشخصية الذكية أو العائلية لرب الأسرة، وتحديد عدد أفراد الأسرة المقيمين في مدينة تعز لإصدار كارت الحصة الإلكتروني.',
    },
    {
      q: 'كيف يستفيد سائقو مركبات النقل والأجرة من مخصصات الوقود؟',
      a: 'يقوم السائق بالتسجيل كعميل مع تفعيل خيار (سائق)، وإدخال رقم المركبة ونوعها، ليتم إدراجها ضمن قوائم التزويد الدورية المعتمدة في محطات تعز.',
    },
    {
      q: 'كيف يتم حجز وتتبع وايتات المياه وتسعيرتها؟',
      a: 'تتيح المنصة ربط طلبات صهاريج المياه بالوكلاء المرخصين وفقاً للتسعيرة الرسمية الصادرة عن مؤسسة المياه لمنع الاستغلال والمضاربة.',
    },
    {
      q: 'كيف يتم التحقق والاستلام عند مركز التوزيع؟',
      a: 'عند وصول دورك، تتلقى رسالة SMS تحتوي على كود التحقق وموعد الاستلام المحدد، ويقوم الوكيل بمسح الكود وتسليم حصتك بشفافية.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── الشريط المؤسسي العلوي (DGA Top Bar) ── */}
      <div className="bg-[#074D31] text-white text-xs py-2 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#DBA102]" aria-hidden="true" />
            <span className="font-semibold text-white">تحديث العمليات الميدانية — تعز:</span>
            <span className="text-white/85">بدء مرحلة التوزيع الدورية لأسطوانات الغاز المنزلي في مديريتي القاهرة والمظفر.</span>
          </div>
          <div className="flex items-center gap-4 text-white/75 text-[11px]">
            <span className="hidden sm:inline">مركز بلاغات التوزيع: <strong className="text-white font-mono" dir="ltr">04-200300</strong></span>
            <span>النسخة الميدانية 1.0</span>
          </div>
        </div>
      </div>

      {/* ── شريط التنقل العلوي (DGA Nav Header) ── */}
      <a href="#main" className="skip-link">تخطَّ إلى المحتوى الرئيسي</a>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="موارد — العودة إلى أعلى الصفحة"
            className="cursor-pointer rounded-[4px]"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <BrandLogo size="md" />
          </button>

          <nav aria-label="التنقل الرئيسي" className="hidden lg:flex items-center gap-1 h-full text-sm font-medium text-[#384250]">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="h-full inline-flex items-center px-3.5 border-b-2 border-transparent hover:border-[#1B8354] hover:text-[#1B8354] transition-colors duration-150"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go('login')}
              className="hidden sm:inline-flex min-h-[40px] items-center px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-sm font-medium text-[#161616] dga-btn-motion cursor-pointer"
            >
              تسجيل الدخول
            </button>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={regOpen}
                onClick={() => setRegOpen((v) => !v)}
                onKeyDown={(e) => e.key === 'Escape' && setRegOpen(false)}
                className="min-h-[40px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-sm font-medium dga-btn-motion flex items-center gap-2 cursor-pointer"
              >
                <span>إنشاء حساب</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${regOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {regOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRegOpen(false)} aria-hidden="true" />
                  <div
                    role="menu"
                    onKeyDown={(e) => e.key === 'Escape' && setRegOpen(false)}
                    className="absolute left-0 mt-2 w-68 rounded-[8px] bg-white border border-[#D2D6DB] shadow-dga-lg p-1.5 z-50 text-right dga-menu-in"
                  >
                    <button
                      role="menuitem"
                      onClick={() => { setRegOpen(false); go('register-consumer') }}
                      className="w-full flex items-center gap-3 p-3 rounded-[4px] hover:bg-[#F3FCF6] transition-colors text-right cursor-pointer"
                    >
                      <span className="w-9 h-9 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
                        <Icons.User className="w-5 h-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#1F2A37]">مواطن / مستفيد</span>
                        <span className="block text-xs text-[#6C737F]">أسرة، سائق، أو نشاط تجاري</span>
                      </span>
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => { setRegOpen(false); go('register-provider') }}
                      className="w-full flex items-center gap-3 p-3 rounded-[4px] hover:bg-[#F3FCF6] transition-colors text-right cursor-pointer"
                    >
                      <span className="w-9 h-9 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] text-[#1F2A37] flex items-center justify-center shrink-0">
                        <Icons.Business className="w-5 h-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-[#1F2A37]">وكيل / مقدم خدمة</span>
                        <span className="block text-xs text-[#6C737F]">مركز غاز، مياه، أو وقود</span>
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 rounded-[4px] border border-[#D2D6DB] text-[#161616] flex items-center justify-center hover:bg-[#F3F4F6] dga-btn-motion cursor-pointer"
            >
              {menuOpen ? <Icons.Close /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="قائمة الجوال" className="lg:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 dga-menu-in">
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[44px] items-center px-3 rounded-[4px] text-sm font-medium text-[#1F2A37] hover:bg-[#F3FCF6] hover:text-[#1B8354] transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="sm:hidden pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={() => { setMenuOpen(false); go('login') }}
                  className="w-full min-h-[44px] rounded-[4px] border border-[#D2D6DB] text-sm font-medium text-[#161616] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {/* ── البانر الرئيسي (DGA SA-Flag 24px Radius Banner) ── */}
        <section className="pt-6 pb-14 sm:pt-8 sm:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto dga-hero-banner dga-banner-pattern px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 border-b-4 border-b-[#DBA102]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* النص التعريفي الرئيسي */}
              <div className="lg:col-span-7 space-y-6 text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-white/10 border border-white/20 text-white text-xs font-medium">
                  <Icons.Shield className="w-4 h-4 text-[#DBA102]" />
                  <span>المنظومة الرقمية المعتمدة لمدينة تعز</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-semibold text-white leading-[1.24] tracking-tight max-w-[1024px]">
                  إدارة وتوزيع الموارد الأساسية في تعز{' '}
                  <span className="text-[#DBA102] border-b-2 border-[#DBA102]/70 pb-0.5">بعدالة وشفافية</span>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed font-normal max-w-2xl">
                  منصة «موارد» تنظم توزيع أسطوانات غاز الطهي، شاحنات مياه الشرب، ومخصصات الوقود للمواطنين والسائقين والأنشطة الحيوية في مديريات تعز، لتجاوز أزمات الاحتكار وإنهاء الطوابير.
                </p>

                {/* أزرار الحث على الإجراء (DGA On-Color Controls) */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => go('register-consumer')}
                    className="min-h-[48px] px-6 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white font-medium text-base border border-[#54C08A]/40 dga-btn-motion flex items-center gap-2 cursor-pointer"
                  >
                    <Icons.User className="w-5 h-5" />
                    <span>تسجيل مواطن / حجز حصة</span>
                  </button>
                  <button
                    onClick={() => go('register-provider')}
                    className="min-h-[48px] px-5 rounded-[4px] border border-white/35 bg-white/5 hover:bg-white/15 text-white font-medium text-sm dga-btn-motion flex items-center gap-2 cursor-pointer"
                  >
                    <Icons.Business className="w-4 h-4 text-[#DBA102]" />
                    <span>تسجيل وكيل أو محطة توزيع</span>
                  </button>
                </div>

                {/* شارات الثقة */}
                <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs font-medium text-white/85">
                  <div className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#54C08A]" />
                    <span>كروت حصص رقمية مؤكدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#54C08A]" />
                    <span>تأكيد بالرسائل النصية والـ OTP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#54C08A]" />
                    <span>إشراف وتنسيق محلي مباشر</span>
                  </div>
                </div>
              </div>

              {/* بطاقة المعاينة الميدانية (DGA Card 16px Radius) */}
              <div className="lg:col-span-5">
                <div className="bg-white text-[#1F2A37] rounded-[16px] border border-[#E5E7EB] shadow-dga-lg p-5 sm:p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center">
                        <Icons.MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-[#1F2A37]">حالة التوزيع المباشرة</h2>
                        <p className="text-xs text-[#6C737F]">مراكز مديريات تعز المعتمدة</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#067647]" />
                      محدّث الآن
                    </span>
                  </div>

                  <div className="space-y-3 my-4 dga-stagger">
                    {/* بند الغاز */}
                    <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#D2D6DB] transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[4px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center shrink-0">
                          <Icons.Gas className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#1F2A37]">غاز الطهي المنزلي</div>
                          <div className="text-[11px] text-[#6C737F]">صالة • القاهرة • المظفر</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#FFFAEB] text-[#B54708] text-[11px] font-semibold border border-[#FEDF89]">
                        دورة شعبان نشطة
                      </span>
                    </div>

                    {/* بند المياه */}
                    <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#D2D6DB] transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[4px] bg-[#EFF8FF] border border-[#B2DDFF] text-[#175CD3] flex items-center justify-center shrink-0">
                          <Icons.Water className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#1F2A37]">شاحنات ومحطات المياه</div>
                          <div className="text-[11px] text-[#6C737F]">جدولة الضخ بالأحياء المرتفعة</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#EFF8FF] text-[#175CD3] text-[11px] font-semibold border border-[#B2DDFF]">
                        حجز مسبق متاح
                      </span>
                    </div>

                    {/* بند الوقود */}
                    <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#D2D6DB] transition-colors flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#067647] flex items-center justify-center shrink-0">
                          <Icons.Fuel className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#1F2A37]">مخصصات الوقود والنقل</div>
                          <div className="text-[11px] text-[#6C737F]">حافلات الأجرة والمركبات المسجلة</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] text-[#067647] text-[11px] font-semibold border border-[#B8EACB]">
                        4 محطات مركزية
                      </span>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#6C737F]">لديك حساب بالفعل؟</span>
                    <button
                      onClick={() => go('login')}
                      className="group font-semibold text-[#1B8354] hover:text-[#074D31] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>تسجيل الدخول للمنصة</span>
                      <Icons.ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── الموارد الثلاثة الأساسية (DGA Cards Grid) ── */}
        <section id="resources" className="py-16 sm:py-20 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
            <div className="max-w-2xl mb-12">
              <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] text-xs font-semibold mb-3">
                الموارد المدارة في مدينة تعز
              </span>
              <h2 className="text-2xl sm:text-[30px] sm:leading-[38px] font-bold text-[#1F2A37]">
                تنظيم دقيق لمصادر المعيشة اليومية
              </h2>
              <p className="mt-2.5 text-[#6C737F] text-sm sm:text-base leading-relaxed">
                تضمن المنصة فك الاختناقات عبر رقابة صارمة على تدفق المواد الحيوية وربط الاستحقاق مباشرة بالسكان والمنشآت الفعلية.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dga-stagger">
              {/* بطاقة الغاز */}
              <div className="dga-card-interactive p-6 flex flex-col">
                <div className="w-12 h-12 rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center mb-5">
                  <Icons.Gas className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2A37] mb-2">غاز الطهي المنزلي</h3>
                <p className="text-[#6C737F] text-sm leading-6 mb-6">
                  كشوفات إلكترونية تضبط استلام كل أسرة لأسطوانة الغاز شهرياً في مركز حيها، مع إشعار بالموعد المحدد وإلغاء ظاهرة الوساطات والأسواق الموازية.
                </p>
                <ul className="space-y-2.5 text-xs font-medium text-[#384250] mb-6 mt-auto pt-4 border-t border-[#E5E7EB]">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>كارت حصة رقمي لكل رب أسرة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>تأكيد الاستلام برمز مؤقت OTP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>تسعيرة رسمية موحدة دون زيادة</span>
                  </li>
                </ul>
                <button
                  onClick={() => go('register-consumer')}
                  className="w-full min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer"
                >
                  تسجيل أسرة للحصول على حصة الغاز
                </button>
              </div>

              {/* بطاقة المياه */}
              <div className="dga-card-interactive p-6 flex flex-col">
                <div className="w-12 h-12 rounded-[8px] bg-[#EFF8FF] border border-[#B2DDFF] text-[#175CD3] flex items-center justify-center mb-5">
                  <Icons.Water className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2A37] mb-2">مياه الشرب والوايتات</h3>
                <p className="text-[#6C737F] text-sm leading-6 mb-6">
                  تنظيم جدول ضخ شبكة المياه بالأحياء، وتوفير نظام حجز موثوق لصهاريج الوايتات المعتمدة مع تحديد سقف عادل لتسعيرة الوايت حسب سعة الخزان.
                </p>
                <ul className="space-y-2.5 text-xs font-medium text-[#384250] mb-6 mt-auto pt-4 border-t border-[#E5E7EB]">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>حجز وايت مياه من أقرب محطة ضخ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>تتبع وصول الصهريج للحي المستهدف</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>إشراف على معايير نظافة وجودة المياه</span>
                  </li>
                </ul>
                <button
                  onClick={() => go('register-consumer')}
                  className="w-full min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer"
                >
                  طلب صهريج أو مراجعة جدول الضخ
                </button>
              </div>

              {/* بطاقة المشتقات والوقود */}
              <div className="dga-card-interactive p-6 flex flex-col">
                <div className="w-12 h-12 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#067647] flex items-center justify-center mb-5">
                  <Icons.Fuel className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#1F2A37] mb-2">الوقود والمشتقات النفطية</h3>
                <p className="text-[#6C737F] text-sm leading-6 mb-6">
                  تأمين حصص منتظمة لباصات النقل الداخلي ومركبات الأجرة، فضلاً عن المنشآت الحيوية في تعز (المستشفيات، المخابز، ومحطات الكهرباء التجارية).
                </p>
                <ul className="space-y-2.5 text-xs font-medium text-[#384250] mb-6 mt-auto pt-4 border-t border-[#E5E7EB]">
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>تسجيل رقم ونوع المركبة وتوثيقها</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>مواعيد تزويد دورية بدون انتظار</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.Check className="w-4 h-4 text-[#067647] shrink-0" />
                    <span>منع إعادة البيع والمتاجرة بالمخصصات</span>
                  </li>
                </ul>
                <button
                  onClick={() => go('register-consumer')}
                  className="w-full min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer"
                >
                  تسجيل مركبة أو نشاط تجاري
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── إحصائيات العمليات الميدانية والشفافية (DGA Metrics) ── */}
        <section id="transparency" className="py-16 bg-[#074D31] text-white dga-banner-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 text-right">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/20 text-[#DBA102] text-xs font-medium mb-2">
                  الشفافية في الأرقام
                </span>
                <h2 className="text-2xl sm:text-[30px] font-bold text-white">أثر منظومة موارد على أحياء مدينة تعز</h2>
              </div>
              <p className="text-sm text-white/75 max-w-md">
                مؤشرات تشغيلية موثقة تعكس انتظام دورات التوزيع في المراكز المعتمدة.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-6 rounded-[16px] bg-white/5 border border-white/15 border-t-2 border-t-[#DBA102] text-right">
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono" dir="ltr">+88,400</div>
                <div className="text-xs sm:text-sm font-normal text-white/80 mt-2">أسرة مسجلة ومستفيدة</div>
              </div>
              <div className="p-6 rounded-[16px] bg-white/5 border border-white/15 border-t-2 border-t-[#54C08A] text-right">
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono" dir="ltr">142</div>
                <div className="text-xs sm:text-sm font-normal text-white/80 mt-2">مركز ووكيل توزيع معتمد</div>
              </div>
              <div className="p-6 rounded-[16px] bg-white/5 border border-white/15 border-t-2 border-t-[#54C08A] text-right">
                <div className="text-3xl sm:text-4xl font-bold text-white">3 مديريات</div>
                <div className="text-xs sm:text-sm font-normal text-white/80 mt-2">تغطية شاملة لأحياء المدينة</div>
              </div>
              <div className="p-6 rounded-[16px] bg-white/5 border border-white/15 border-t-2 border-t-[#DBA102] text-right">
                <div className="text-3xl sm:text-4xl font-bold text-white font-mono" dir="ltr">99.4%</div>
                <div className="text-xs sm:text-sm font-normal text-white/80 mt-2">نسبة الالتزام بالحصص والتسعيرة</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── كيف يعمل النظام (DGA Progress Stepper Pattern) ── */}
        <section id="how-it-works" className="py-16 sm:py-20 bg-[#F9FAFB] border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
            <div className="max-w-2xl mb-12">
              <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] text-xs font-semibold mb-3">
                خطوات ميسرة لكل مواطن
              </span>
              <h2 className="text-2xl sm:text-[30px] sm:leading-[38px] font-bold text-[#1F2A37]">
                كيف تستلم حصتك عبر المنصة؟
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 dga-stagger">
              {[
                {
                  step: '01',
                  title: 'تسجيل الحساب وتوثيقه',
                  desc: 'أدخل رقم هاتفك وتأكيده عبر كود التحقق SMS، وارفق صورة بطاقتك الشخصية لإصدار قيدك المعتمد.',
                },
                {
                  step: '02',
                  title: 'تحديد الفئة والحي السكني',
                  desc: 'حدد صفتك (رب أسرة، سائق مركبة، أو نشاط تجاري) لربط حصتك بأقرب نقطة توزيع تابعة لحيّك.',
                },
                {
                  step: '03',
                  title: 'إشعار الموعد والتخصيص',
                  desc: 'تصلك رسالة تفيد بتوفر الحصة في المركز المعتمد، متضمنةً رمز الاستلام والسعر الرسمي المحدد.',
                },
                {
                  step: '04',
                  title: 'الاستلام الموثق بالرمز',
                  desc: 'يتأكد الوكيل من رمز الاستلام في النظام ويتم تسليم حصتك فوراً وتسجيل العملية كمنجزة.',
                },
              ].map((item, index) => (
                <div key={item.step} className="dga-card p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-full bg-[#1B8354] text-white font-mono text-xs font-semibold flex items-center justify-center">
                      {item.step}
                    </span>
                    {index < 3 && (
                      <span className="hidden md:block h-[2px] flex-1 ms-3 bg-[#B8EACB]" aria-hidden="true" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#1F2A37] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#6C737F] leading-6">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── دليل مراكز التوزيع في مديريات تعز (DGA Horizontal Tab List) ── */}
        <section id="centers" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-[#D2D6DB]">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] text-xs font-semibold mb-2">
                  دليل التوزيع الميداني
                </span>
                <h2 className="text-2xl sm:text-[30px] font-bold text-[#1F2A37]">مراكز الخدمة المعتمدة في مديريات تعز</h2>
              </div>

              {/* ألسنة اختيار المديرية وفق مواصفة DGA Horizontal Tab */}
              <div className="flex items-center gap-1 -mb-[17px]" role="tablist" aria-label="مديريات تعز">
                {[
                  { key: 'al-qahirah', label: 'مديرية القاهرة' },
                  { key: 'al-mudhaffar', label: 'مديرية المظفر' },
                  { key: 'salah', label: 'مديرية صالة' },
                ].map((tab) => {
                  const active = activeDistrict === tab.key
                  return (
                    <button
                      key={tab.key}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveDistrict(tab.key)}
                      className={`px-4 py-3 rounded-t-[4px] text-sm border-b-2 transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'border-[#1B8354] text-[#1B8354] font-semibold bg-[#F3FCF6]/50'
                          : 'border-transparent text-[#384250] hover:text-[#1F2A37] hover:bg-[#F9FAFB] font-medium'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div key={activeDistrict} className="grid grid-cols-1 md:grid-cols-3 gap-6 dga-stagger">
              {districtHubs[activeDistrict].map((hub, idx) => (
                <div key={idx} className="dga-card-interactive p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <ResourceBadge type={hub.resource} />
                      <span className="text-[11px] font-semibold text-[#067647] bg-[#ECFDF3] px-2.5 py-0.5 rounded-full border border-[#ABEFC6]">
                        {hub.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#1F2A37] mb-1.5">{hub.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#6C737F] mb-4">
                      <Icons.MapPin className="w-4 h-4 text-[#9DA4AE] shrink-0" />
                      <span>{hub.area}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6C737F]">
                    <div className="flex items-center gap-1.5">
                      <Icons.Clock className="w-3.5 h-3.5 text-[#9DA4AE]" />
                      <span>{hub.hours}</span>
                    </div>
                    <button
                      onClick={() => go('login')}
                      className="group font-semibold text-[#1B8354] hover:text-[#074D31] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>حجز الموعد</span>
                      <Icons.ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── الأسئلة الشائعة + تنبيه DGA Remember Callout ── */}
        <section id="faq" className="py-16 sm:py-20 bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
            <div className="mb-10">
              <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] text-xs font-semibold mb-2">
                الأسئلة المتكررة
              </span>
              <h2 className="text-2xl sm:text-[30px] font-bold text-[#1F2A37]">إرشادات تهم المواطن والوكيل</h2>
            </div>

            {/* DGA Accordion List */}
            <div className="rounded-[16px] border border-[#D2D6DB] bg-white divide-y divide-[#D2D6DB] overflow-hidden">
              {faqs.map((f, i) => {
                const isExpanded = openFaq === i
                return (
                  <div key={i} className="transition-colors hover:bg-[#F9FAFB]/70">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setOpenFaq(isExpanded ? -1 : i)}
                      className="w-full min-h-[56px] px-5 py-4 flex items-center justify-between gap-4 text-right cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-semibold text-[#161616]">{f.q}</span>
                      <svg
                        className={`w-5 h-5 text-[#161616] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#1B8354]' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 text-sm text-[#384250] leading-7 fade-in">
                        {f.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* DGA "Remember" Warning Callout */}
            <div className="mt-6 dga-callout-warning p-4 sm:p-5 flex items-start gap-3">
              <Icons.Alert className="w-5 h-5 text-[#B54708] shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-[#1F2A37] leading-6">
                <strong className="font-bold text-[#B54708]">تذكير رقابي: </strong>
                التسجيل وإصدار كروت الحصص عبر منصة «موارد» مجاني بالكامل، ويُمنع تقاضي أي مبالغ إضافية خارج التسعيرة الرسمية المعتمدة في مدينة تعز.
              </div>
            </div>
          </div>
        </section>

        {/* ── دعوة الانضمام والبدء (DGA SA-Flag Banner) ── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto dga-hero-banner dga-banner-pattern p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              سجّل الآن واضمن حصة أسرتك أو منشأتك بانتظام
            </h2>
            <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              المنصة متاحة مجاناً لجميع سكان مدينة تعز لمساعدتك في الحصول على احتياجاتك الأساسية بسعرها الرسمي وكرامتك المحفوظة.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => go('register-consumer')}
                className="min-h-[46px] px-7 rounded-[4px] bg-white hover:bg-[#F3F4F6] text-[#074D31] font-semibold text-sm dga-btn-motion cursor-pointer"
              >
                إنشاء حساب مواطن جديد
              </button>
              <button
                onClick={() => go('login')}
                className="min-h-[46px] px-6 rounded-[4px] border border-white/35 bg-white/5 hover:bg-white/15 text-white font-medium text-sm dga-btn-motion cursor-pointer"
              >
                تسجيل الدخول إلى حسابك
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── تذييل الصفحة المؤسسي (DGA Footer) ── */}
      <footer className="bg-[#0D121C] text-[#9DA4AE] text-xs py-12 border-t-4 border-t-[#074D31]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#384250] text-right">
            <div className="space-y-3">
              <div className="text-white font-bold text-lg">مَـوَارِد — تعز</div>
              <p className="text-[#9DA4AE] text-xs leading-6">
                المنصة الإلكترونية لتنظيم توزيع الموارد الأساسية المحدودة (غاز الطهي، المياه، الوقود) بمدينة تعز بالتنسيق مع الجهات الخدمية والوكلاء المعتمدين.
              </p>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">الموارد المدارة</div>
              <ul className="space-y-2.5">
                <li><a href="#resources" className="hover:text-white transition-colors">غاز الطهي المنزلي</a></li>
                <li><a href="#resources" className="hover:text-white transition-colors">صهاريج ومحطات مياه الشرب</a></li>
                <li><a href="#resources" className="hover:text-white transition-colors">وقود مركبات النقل والمخابز</a></li>
                <li><a href="#centers" className="hover:text-white transition-colors">مراكز التوزيع في المديريات</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">بوابة الحسابات</div>
              <ul className="space-y-2.5">
                <li><button onClick={() => go('login')} className="hover:text-white transition-colors cursor-pointer">تسجيل الدخول</button></li>
                <li><button onClick={() => go('register-consumer')} className="hover:text-white transition-colors cursor-pointer">تسجيل مواطن / أسرة</button></li>
                <li><button onClick={() => go('register-provider')} className="hover:text-white transition-colors cursor-pointer">تسجيل وكيل / مقدم خدمة</button></li>
                <li><button onClick={() => go('forgot')} className="hover:text-white transition-colors cursor-pointer">استعادة كلمة المرور</button></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold text-sm mb-3">غرفة طوارئ البلاغات</div>
              <p className="text-[#9DA4AE] mb-3 leading-6">
                في حال وجود تلاعب بالأسعار أو احتكار للحصص، يرجى إرسال بلاغ مباشر للجنة الرقابة.
              </p>
              <div className="font-mono text-white text-sm font-medium bg-[#1F2A37] px-3 py-2 rounded-[4px] border border-[#384250] inline-block" dir="ltr">
                Hotline: 04-200300
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6C737F]">
            <div>منصة موارد © 2026 — مدينة تعز. جميع الحقوق محفوظة لخدمة الصالح العام.</div>
            <div className="flex items-center gap-4">
              <span>الشفافية والتوزيع العادل</span>
              <span>•</span>
              <span>حماية بيانات المستفيدين</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
