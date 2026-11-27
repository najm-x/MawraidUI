// ═══════════ بطاقة مخازن المزود في لوحة التحكم (Multi-Stock — للمزود فقط) — DGA Design System ═══════════
import { useEffect } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { Icons } from '../../../shared/components/ui'
import { useMyStocks } from '../hooks/useMyStocks'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice, isSessionExpired } from '../utils'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from './StockStates'

export default function ProviderStockCard({ go, refreshTrigger = 0 }) {
  const { status, stocks, err, reload } = useMyStocks()

  useEffect(() => {
    if (refreshTrigger > 0) {
      reload()
    }
  }, [refreshTrigger, reload])

  if (status === 'loading') return <StockLoading label="جارٍ تحميل قائمة المخازن…" />

  if (status === 'error') {
    return isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />
  }

  if (status === 'empty') return <StockEmptyState go={go} />

  return (
    <div className="space-y-4 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#384250]">المخازن المسجّلة ({stocks.length})</span>
        <button
          type="button"
          onClick={() => go(ROUTES.STOCK_CREATE)}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-xs font-medium dga-btn-motion cursor-pointer"
        >
          <Icons.Plus className="w-4 h-4" aria-hidden="true" />
          <span>إضافة مخزون جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dga-stagger">
        {stocks.map((stock) => {
          const mainUnit = stock?.units?.find((u) => u.is_main)
          const balances = Array.isArray(stock?.balances) ? stock.balances : []
          const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)

          return (
            <div key={stock.id} className="dga-card p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
                      <Icons.Box className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#1F2A37] truncate">
                          {stock?.type?.name || 'مخزون مسجّل'}
                        </h3>
                        {gazTypeLabel && (
                          <span className="px-2 py-0.5 rounded-[4px] bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89] text-[10px] font-semibold">
                            {gazTypeLabel}
                          </span>
                        )}
                      </div>
                      {stock?.address && (
                        <p className="text-[11px] text-[#6C737F] mt-1 flex items-center gap-1 truncate">
                          <Icons.MapPin className="w-3.5 h-3.5 shrink-0 text-[#9DA4AE]" aria-hidden="true" />
                          <span className="truncate">{stock.address}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-normal text-[#6C737F] shrink-0">
                    آخر تحديث {formatDateTime(stock?.updated_at)}
                  </span>
                </div>

                <div className="py-4 flex items-end gap-2">
                  <span className="text-3xl font-bold text-[#1F2A37] font-mono" dir="ltr">
                    {formatAmount(stock?.available)}
                  </span>
                  <span className="text-sm font-medium text-[#6C737F] pb-1">{mainUnit?.name || ''}</span>
                </div>

                {balances.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-4">
                    {balances.map((b) => {
                      const unitObj = stock?.units?.find((u) => u.id === b.unit_id || u.name === b.unit)
                      return (
                        <span
                          key={b.unit_id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-medium text-[#384250]"
                        >
                          <strong className="font-mono font-semibold text-[#1F2A37]" dir="ltr">
                            {formatAmount(b.amount)}
                          </strong>
                          <span>{b.unit}</span>
                          {unitObj?.price !== undefined && unitObj?.price !== null && (
                            <span className="text-[#1B8354] font-normal text-[11px]">
                              (<strong className="font-mono" dir="ltr">{formatPrice(unitObj.price)}</strong>)
                            </span>
                          )}
                        </span>
                      )
                    })}
                  </div>
                )}

                {(stock?.pending_orders !== undefined || stock?.completed_orders !== undefined) && (
                  <div className="grid grid-cols-2 gap-2.5 pb-4">
                    <div className="rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] px-3 py-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#B54708]">قيد الانتظار</span>
                      <strong className="font-mono font-bold text-[#B54708]" dir="ltr">
                        {formatAmount(stock.pending_orders ?? 0)}
                      </strong>
                    </div>
                    <div className="rounded-[8px] bg-[#ECFDF3] border border-[#ABEFC6] px-3 py-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#067647]">مكتملة</span>
                      <strong className="font-mono font-bold text-[#067647]" dir="ltr">
                        {formatAmount(stock.completed_orders ?? 0)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => go(ROUTES.STOCK_DASHBOARD, { stockId: stock.id })}
                  className="flex-1 min-h-[42px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-sm font-medium dga-btn-motion cursor-pointer flex items-center justify-center gap-2"
                >
                  <Icons.Settings className="w-4 h-4" aria-hidden="true" />
                  <span>إدارة المخزون</span>
                </button>

                <button
                  type="button"
                  onClick={() => go(ROUTES.PROVIDER_ORDERS, { stockId: stock.id })}
                  className="min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Icons.ShoppingBag className="w-4 h-4 text-[#1B8354]" aria-hidden="true" />
                  <span>الطلبات الواردة</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
