// ═══════════ حالات العرض الموحدة لشاشات المخزون — DGA Design System ═══════════
import { ROUTES } from '../../../shared/constants/routes'
import { Icons, ErrorBanner, SecondaryBtn } from '../../../shared/components/ui'
import { useAuth } from '../../auth/hooks/useAuth'

// حالة التحميل
export function StockLoading({ label = 'جارٍ تحميل بيانات المخزون…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center fade-in" role="status" aria-live="polite">
      <Icons.Refresh className="w-7 h-7 text-[#1B8354] animate-spin" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-[#6C737F]">{label}</p>
    </div>
  )
}

// حالة الخطأ مع إعادة المحاولة
export function StockErrorState({ err, onRetry }) {
  return (
    <div className="dga-card p-6 text-center fade-in">
      <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] flex items-center justify-center mb-3">
        <Icons.Alert className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-[#1F2A37]">تعذر تحميل بيانات المخزون</h2>
      <div className="mt-4 text-right">
        <ErrorBanner err={err} />
      </div>
      {onRetry && (
        <SecondaryBtn onClick={onRetry} className="w-full">
          إعادة المحاولة
        </SecondaryBtn>
      )}
    </div>
  )
}

// انتهاء الجلسة
export function SessionExpiredState({ go }) {
  const { logout } = useAuth()

  async function toLogin() {
    await logout()
    go(ROUTES.LOGIN)
  }

  return (
    <div className="dga-callout-warning p-6 text-center fade-in" role="alert">
      <div className="w-12 h-12 mx-auto rounded-[8px] bg-white border border-[#FEDF89] text-[#B54708] flex items-center justify-center mb-3">
        <Icons.Lock className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-[#1F2A37]">انتهت الجلسة</h2>
      <p className="text-xs text-[#384250] mt-1.5 mb-4">يرجى تسجيل الدخول مجدداً للمتابعة إلى إدارة المخزون</p>
      <SecondaryBtn onClick={toLogin} className="w-full">
        تسجيل الدخول مجدداً
      </SecondaryBtn>
    </div>
  )
}

// لا يوجد مخزون مسجّل
export function StockEmptyState({ go }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#9DA4AE] bg-white p-6 text-center fade-in">
      <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center mb-3">
        <Icons.Box className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-[#1F2A37]">لا يوجد مخزون مسجل</h2>
      <p className="text-xs text-[#6C737F] mt-1.5 mb-4">أنشئ مخزونك الأول لبدء إدارة الكميات والوحدات والحركات</p>
      <button
        type="button"
        onClick={() => go(ROUTES.STOCK_CREATE)}
        className="w-full min-h-[46px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-sm font-medium dga-btn-motion cursor-pointer flex items-center justify-center gap-2"
      >
        <Icons.Plus className="w-4 h-4" aria-hidden="true" />
        <span>إضافة مخزون جديد</span>
      </button>
    </div>
  )
}
