// ═══════════ لوحة التحكم بعد الدخول — منصة موارد (تعز) | DGA Design System ═══════════
import { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { Icons, BrandLogo, ResourceBadge } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import ProviderStockCard from '../../stock/components/ProviderStockCard'
import ProviderOrdersSection from '../../orders/components/ProviderOrdersSection'
import ConsumerOrdersSection from '../../orders/components/ConsumerOrdersSection'

export default function Dashboard({ go, showToast, onSessionExpired }) {
  const { user, logout } = useAuth()
  const [providerStockRefresh, setProviderStockRefresh] = useState(0)

  async function doLogout() {
    await logout()
    go('home')
  }

  if (!user) return null

  const isProvider = user.role_name === 'provider'
  const isCitizen = user.role_name === 'consumer'
  const isAdmin = user.role_name === 'admin'
  const addressEntry = isAdmin ? 'عرض عناوين المواطنين' : 'عناويني'

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── شريط الملاحة العلوي (DGA Nav Header) ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => go('home')}
              className="text-xs font-medium text-[#384250] hover:text-[#1B8354] px-3 py-2 rounded-[4px] hover:bg-[#F3F4F6] transition-colors hidden sm:inline cursor-pointer"
            >
              الرئيسية
            </button>
            <button
              onClick={doLogout}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-[4px] border border-[#FECDCA] bg-[#FEF3F2] hover:bg-[#FECDCA]/50 text-[#B42318] text-xs font-semibold dga-btn-motion cursor-pointer"
            >
              <Icons.LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى الرئيسي للوحة التحكم ── */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 text-right">
        {/* بطاقة الترحيب وملف المستخدم (DGA SA-Flag 24px Banner) */}
        <div className="dga-hero-banner dga-banner-pattern p-6 sm:p-8 border-b-4 border-b-[#DBA102]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              {/* DGA Avatar (radius/round 9999) */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-white/25 flex items-center justify-center text-white shrink-0">
                <Icons.User className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name || 'مستخدم منصة موارد'}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[#54C08A] text-xs font-medium">
                    <Icons.Check className="w-3 h-3" />
                    <span>حساب موثق</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/85 font-mono" dir="ltr">+967 {user.phone}</p>
                <div className="mt-1.5 text-xs font-normal text-white/80">
                  {isAdmin ? 'إدارة المنصة' : isProvider ? 'وكيل / مركز توزيع معتمد في مدينة تعز' : 'مواطن / مستفيد من الحصص الأساسية'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3.5 py-1.5 rounded-[4px] bg-white/10 border border-white/20 text-xs font-medium text-white">
                {isAdmin ? 'صلاحية: مسؤول' : isProvider ? 'صلاحية: وكيل خدمة' : 'صلاحية: مستفيد معتمد'}
              </span>
            </div>
          </div>
        </div>

        {/* ── بطاقة المخزون والطلبات الواردة (للمزود فقط) ── */}
        {isProvider && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#1F2A37]">إدارة المخزون</h2>
                <button
                  type="button"
                  onClick={() => go(ROUTES.PROVIDER_ORDERS)}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-[4px] border border-[#D2D6DB] bg-white hover:border-[#1B8354] hover:bg-[#F3FCF6] text-[#161616] hover:text-[#1B8354] text-xs font-semibold dga-btn-motion cursor-pointer"
                >
                  <Icons.ShoppingBag className="w-4 h-4 text-[#1B8354]" />
                  <span>جميع الطلبات الواردة</span>
                </button>
              </div>
              <ProviderStockCard go={go} refreshTrigger={providerStockRefresh} />
            </div>

            <ProviderOrdersSection
              go={go}
              showToast={showToast}
              onSessionExpired={onSessionExpired}
              onOrderChanged={() => setProviderStockRefresh((n) => n + 1)}
            />
          </div>
        )}

        {(isCitizen || isAdmin) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 dga-stagger">
            <button
              type="button"
              onClick={() => go(ROUTES.CONSUMER_STOCKS)}
              className="group dga-card-interactive flex items-center gap-3.5 p-4 sm:p-5 text-start cursor-pointer"
            >
              <span className="rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] p-2.5 text-[#1B8354] shrink-0">
                <Icons.Box className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[#1F2A37]">استكشاف المخزون المتاح</span>
                <span className="block text-xs text-[#6C737F] mt-0.5">تصفّح أقرب المخازن مع المسافة بالكيلومتر</span>
              </span>
              <Icons.ArrowLeft className="w-4 h-4 text-[#1B8354] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
            </button>

            {isCitizen && (
              <button
                type="button"
                onClick={() => go(ROUTES.CONSUMER_ORDERS)}
                className="group dga-card-interactive flex items-center gap-3.5 p-4 sm:p-5 text-start cursor-pointer"
              >
                <span className="rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] p-2.5 text-[#1B8354] shrink-0">
                  <Icons.ShoppingBag className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[#1F2A37]">طلباتي وحجوزاتي</span>
                  <span className="block text-xs text-[#6C737F] mt-0.5">متابعة حالة الطلبات وإلغاء المعلّق منها</span>
                </span>
                <Icons.ArrowLeft className="w-4 h-4 text-[#1B8354] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => go(isAdmin ? ROUTES.ADMIN_ADDRESSES : ROUTES.CITIZEN_ADDRESSES)}
              className="group dga-card-interactive flex items-center gap-3.5 p-4 sm:p-5 text-start cursor-pointer"
            >
              <span className="rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] p-2.5 text-[#1B8354] shrink-0">
                <Icons.MapPin className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold text-[#1F2A37]">{addressEntry}</span>
                <span className="block text-xs text-[#6C737F] mt-0.5">إدارة مواقع التوصيل والإحداثيات</span>
              </span>
              <Icons.ArrowLeft className="w-4 h-4 text-[#1B8354] shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5" />
            </button>
          </div>
        )}

        {/* ── طلباتي الأخيرة (للمستفيد فقط) ── */}
        {isCitizen && (
          <ConsumerOrdersSection
            go={go}
            showToast={showToast}
            onSessionExpired={onSessionExpired}
          />
        )}

        {/* بطاقات حالة الموارد والحصص */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[#1F2A37]">سجل وحالة الحصص المخصصة</h2>
            <span className="px-2.5 py-1 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-medium text-[#384250]">
              دورة التوزيع الحالية: شعبان 1447هـ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 dga-stagger">
            {/* حصة الغاز */}
            <div className="dga-card-interactive p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="gas" />
                <span className="text-xs font-semibold text-[#B54708] bg-[#FFFAEB] px-2.5 py-0.5 rounded-full border border-[#FEDF89]">
                  مجدولة
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1F2A37] mb-1">غاز الطهي المنزلي</h3>
              <p className="text-xs text-[#6C737F] mb-4">كارت الحصة: <strong className="font-mono text-[#1F2A37]">TAIZ-GAS-4902</strong></p>

              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-2 mb-5">
                <div className="flex justify-between text-[#6C737F]">
                  <span>المركز المعتمد:</span>
                  <span className="font-semibold text-[#1F2A37]">مركز المسبح</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>الموعد المتوقع:</span>
                  <span className="font-semibold text-[#1F2A37]">الخميس القادم</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>السعر الرسمي:</span>
                  <span className="font-semibold text-[#067647]">4,500 ريال</span>
                </div>
              </div>

              <button className="mt-auto w-full min-h-[40px] rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer">
                عرض كود الاستلام (QR)
              </button>
            </div>

            {/* حصة المياه */}
            <div className="dga-card-interactive p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="water" />
                <span className="text-xs font-semibold text-[#175CD3] bg-[#EFF8FF] px-2.5 py-0.5 rounded-full border border-[#B2DDFF]">
                  حجز متاح
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1F2A37] mb-1">مياه الشرب والوايتات</h3>
              <p className="text-xs text-[#6C737F] mb-4">الحي السكني: <strong className="text-[#1F2A37]">مديرية القاهرة</strong></p>

              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-2 mb-5">
                <div className="flex justify-between text-[#6C737F]">
                  <span>جدول ضخ الشبكة:</span>
                  <span className="font-semibold text-[#1F2A37]">الأحد 10:00 ص</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>حجز وايت صهريج:</span>
                  <span className="font-semibold text-[#175CD3]">3,000 لتر متاح</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>تسعيرة الوايت:</span>
                  <span className="font-semibold text-[#067647]">معتمدة رسمياً</span>
                </div>
              </div>

              <button className="mt-auto w-full min-h-[40px] rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer">
                حجز صهريج مياه معتمد
              </button>
            </div>

            {/* حصة الوقود */}
            <div className="dga-card-interactive p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <ResourceBadge type="fuel" />
                <span className="text-xs font-semibold text-[#067647] bg-[#ECFDF3] px-2.5 py-0.5 rounded-full border border-[#ABEFC6]">
                  ساري
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1F2A37] mb-1">مخصصات الوقود</h3>
              <p className="text-xs text-[#6C737F] mb-4">الفئة: <strong className="text-[#1F2A37]">مركبة نقل داخلي</strong></p>

              <div className="p-3.5 rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-2 mb-5">
                <div className="flex justify-between text-[#6C737F]">
                  <span>المحطة المخصصة:</span>
                  <span className="font-semibold text-[#1F2A37]">محطة الصقر</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>الحصة الأسبوعية:</span>
                  <span className="font-semibold text-[#1F2A37]">40 لتر</span>
                </div>
                <div className="flex justify-between text-[#6C737F]">
                  <span>حالة التزويد:</span>
                  <span className="font-semibold text-[#067647]">جاهز للصرف</span>
                </div>
              </div>

              <button className="mt-auto w-full min-h-[40px] rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] font-medium text-xs dga-btn-motion cursor-pointer">
                تأكيد كود تزويد الوقود
              </button>
            </div>
          </div>
        </div>

        {/* إرشادات وأمان الجلسة (DGA Inline Alert Style) */}
        <div className="rounded-[8px] border border-[#E5E7EB] border-s-4 border-s-[#1B8354] bg-white p-4 text-xs text-[#6C737F] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Icons.Shield className="w-4 h-4 text-[#067647] shrink-0" />
            <span>جلسة آمنة مشفرة عبر ملفات تعريف الارتباط الآمنة (HttpOnly Cookie) المتصلة بمنظومة موارد تعز.</span>
          </div>
          <div className="text-[11px] font-mono text-[#9DA4AE]">
            Node: taiz-auth-v1
          </div>
        </div>
      </main>
    </div>
  )
}
