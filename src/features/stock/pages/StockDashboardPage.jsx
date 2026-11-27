// ═══════════ لوحة إدارة المخزون — الرصيد والأرصدة والإجراءات السريعة — DGA Design System ═══════════
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice, isSessionExpired } from '../utils'

const QUICK_ACTIONS = [
  { key: 'orders', label: 'الطلبات الواردة', hint: 'قبول وتسليم الطلبات', icon: Icons.ShoppingBag, route: ROUTES.PROVIDER_ORDERS, params: {}, tone: 'amber' },
  { key: 'in', label: 'إضافة كمية', hint: 'توريد وارد', icon: Icons.Plus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'in' }, tone: 'emerald' },
  { key: 'out', label: 'سحب كمية', hint: 'صرف منصرف', icon: Icons.Minus, route: ROUTES.STOCK_TRANSACTION, params: { direction: 'out' }, tone: 'rose' },
  { key: 'units', label: 'إدارة الوحدات', hint: 'إضافة وتعديل', icon: Icons.Settings, route: ROUTES.STOCK_UNITS, params: {}, tone: 'dga' },
  { key: 'history', label: 'سجل الحركات', hint: 'الوارد والمنصرف', icon: Icons.History, route: ROUTES.STOCK_HISTORY, params: {}, tone: 'sky' },
]

const TONES = {
  amber: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89] hover:border-[#B54708]',
  emerald: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6] hover:border-[#067647]',
  rose: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] hover:border-[#B42318]',
  dga: 'bg-[#F3FCF6] text-[#074D31] border-[#B8EACB] hover:border-[#1B8354]',
  sky: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF] hover:border-[#175CD3]',
}

export default function StockDashboardPage({ go, stockId }) {
  const { status, stock, err, reload } = useStock(stockId)

  const headerAction = (
    <button
      type="button"
      onClick={reload}
      aria-label="تحديث بيانات المخزون"
      className="w-9 h-9 rounded-[4px] border border-[#D2D6DB] bg-white text-[#384250] hover:bg-[#F3F4F6] flex items-center justify-center cursor-pointer dga-btn-motion"
    >
      <Icons.Refresh className="w-4 h-4" />
    </button>
  )

  let body
  if (status === 'loading') {
    body = <StockLoading />
  } else if (status === 'error') {
    body = isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />
  } else if (status === 'empty') {
    body = <StockEmptyState go={go} />
  } else {
    const mainUnit = stock?.units?.find((u) => u.is_main)
    const balances = Array.isArray(stock?.balances) ? stock.balances : []
    const unitsCount = Array.isArray(stock?.units) ? stock.units.length : 0
    const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)
    const hasCoords =
      stock?.location &&
      typeof stock.location.lat === 'number' &&
      typeof stock.location.lng === 'number'

    body = (
      <>
        {/* ── الرصيد المتاح بالوحدة الرئيسية (DGA SA-Flag 24px Banner) ── */}
        <div className="dga-hero-banner dga-banner-pattern p-6 border-b-4 border-b-[#DBA102]">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[4px] bg-white/10 border border-white/20 flex items-center justify-center">
                  <Icons.Box className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-bold text-white">{stock?.type?.name || 'المخزون الحالي'}</h2>
                    {gazTypeLabel && (
                      <span className="px-2 py-0.5 rounded-[4px] bg-white/15 border border-white/25 text-white text-[10px] font-semibold">
                        {gazTypeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80">الرصيد المتاح{mainUnit?.name ? ` (${mainUnit.name})` : ''}</p>
                </div>
              </div>
              <span className="text-[11px] font-normal text-white/80">محدّث {formatDateTime(stock?.updated_at)}</span>
            </div>

            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-bold font-mono text-white" dir="ltr">{formatAmount(stock?.available)}</span>
              <span className="text-sm font-medium text-white/85 pb-1.5">{mainUnit?.name || ''}</span>
            </div>
          </div>
        </div>

        {/* ── عدادات الطلبات الحية لهذا المخزون ── */}
        {(stock?.pending_orders !== undefined || stock?.completed_orders !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => go(ROUTES.PROVIDER_ORDERS, { stockId: stock.id })}
              className="dga-card-interactive border-s-4 border-s-[#DBA102] p-4 flex items-center justify-between text-right cursor-pointer"
            >
              <div>
                <p className="text-xs font-medium text-[#6C737F]">طلبات قيد الانتظار</p>
                <p className="mt-1 text-2xl font-bold text-[#B54708] font-mono" dir="ltr">
                  {formatAmount(stock.pending_orders ?? 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center shrink-0">
                <Icons.Clock className="w-5 h-5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => go(ROUTES.PROVIDER_ORDERS, { stockId: stock.id })}
              className="dga-card-interactive border-s-4 border-s-[#067647] p-4 flex items-center justify-between text-right cursor-pointer"
            >
              <div>
                <p className="text-xs font-medium text-[#6C737F]">طلبات مكتملة</p>
                <p className="mt-1 text-2xl font-bold text-[#067647] font-mono" dir="ltr">
                  {formatAmount(stock.completed_orders ?? 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[8px] bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] flex items-center justify-center shrink-0">
                <Icons.Check className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}

        {/* ── أرصدة جميع الوحدات ── */}
        <div className="dga-card p-5">
          <h3 className="text-sm font-bold text-[#1F2A37] mb-3">الأرصدة بكل الوحدات</h3>
          {balances.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 dga-stagger">
              {balances.map((b) => {
                const unitObj = stock?.units?.find((u) => u.id === b.unit_id || u.name === b.unit)
                return (
                  <div key={b.unit_id} className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3 text-center">
                    <div className="text-lg font-bold text-[#1F2A37] font-mono" dir="ltr">{formatAmount(b.amount)}</div>
                    <div className="text-xs font-medium text-[#6C737F] mt-0.5">{b.unit}</div>
                    {unitObj?.price !== undefined && unitObj?.price !== null && (
                      <div className="text-[11px] font-semibold text-[#1B8354] mt-1">
                        السعر: <span className="font-mono" dir="ltr">{formatPrice(unitObj.price)}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-[#6C737F]">لا توجد أرصدة مسجلة بعد.</p>
          )}
        </div>

        {/* ── الإجراءات السريعة ── */}
        <div className="dga-card p-5">
          <h3 className="text-sm font-bold text-[#1F2A37] mb-3">الإجراءات السريعة</h3>
          <div className="grid grid-cols-2 gap-3 dga-stagger">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => go(a.route, { ...a.params, stockId: stock.id })}
                  className={`min-h-[84px] rounded-[8px] border p-3 flex flex-col items-center justify-center gap-1.5 text-center dga-btn-motion cursor-pointer ${TONES[a.tone]}`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-xs font-bold">{a.label}</span>
                  <span className="text-[10px] font-medium opacity-80">{a.hint}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── بيانات المخزون ── */}
        <div className="dga-card p-5 text-xs">
          <h3 className="text-sm font-bold text-[#1F2A37] mb-3">بيانات المخزون</h3>
          <div className="divide-y divide-[#E5E7EB]">
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span>نوع المخزون:</span>
              <span className="font-semibold text-[#1F2A37]">{stock?.type?.name || '—'}</span>
            </div>
            {gazTypeLabel && (
              <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
                <span>نوع مخزون الغاز:</span>
                <span className="font-semibold text-[#1F2A37]">{gazTypeLabel}</span>
              </div>
            )}
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span className="shrink-0">العنوان:</span>
              <span className="font-semibold text-[#1F2A37] text-left">{stock?.address || '—'}</span>
            </div>
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span>الإحداثيات:</span>
              {hasCoords ? (
                <span className="font-semibold text-[#1F2A37] flex items-center gap-2">
                  <span className="font-mono" dir="ltr">
                    {stock.location.lat}, {stock.location.lng}
                  </span>
                  <a
                    href={`https://www.google.com/maps?q=${stock.location.lat},${stock.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1B8354] hover:underline"
                  >
                    خريطة
                  </a>
                </span>
              ) : (
                <span className="font-semibold text-[#1F2A37]">—</span>
              )}
            </div>
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span>الوحدة الرئيسية:</span>
              <span className="font-semibold text-[#1F2A37]">{mainUnit?.name || '—'}</span>
            </div>
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span>عدد الوحدات:</span>
              <span className="font-semibold text-[#1F2A37]">{unitsCount}</span>
            </div>
            <div className="py-2 flex justify-between gap-4 text-[#6C737F]">
              <span>تاريخ الإنشاء:</span>
              <span className="font-semibold text-[#1F2A37]">{formatDateTime(stock?.created_at)}</span>
            </div>
            <div className="pt-2 flex justify-between gap-4 text-[#6C737F]">
              <span>آخر تحديث:</span>
              <span className="font-semibold text-[#1F2A37]">{formatDateTime(stock?.updated_at)}</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <StockPage
      title="لوحة إدارة المخزون"
      subtitle="الأرصدة والحركات"
      go={go}
      backTo={ROUTES.DASHBOARD}
      backLabel="لوحة التحكم"
      action={headerAction}
    >
      {body}
    </StockPage>
  )
}
