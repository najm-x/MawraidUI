// ═══════════ شاشة قائمة طلبات المستفيد مع الفلترة والترقيم — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import {
  CONSUMER_TYPE_OPTIONS,
  ORDER_STATUS_FILTERS,
  formatOrderAmount,
  isSessionExpiredError,
} from '../utils'
import OrderCard from '../components/OrderCard'
import CancelOrderSheet from '../components/CancelOrderSheet'

export default function ConsumerOrdersPage({
  go,
  initialStockId = '',
  initialStockName = '',
  showToast,
  onSessionExpired,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [consumerTypeFilter, setConsumerTypeFilter] = useState('')
  const [stockIdFilter, setStockIdFilter] = useState(initialStockId || '')
  const [page, setPage] = useState(1)

  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const seqRef = useRef(0)

  useEffect(() => {
    setStockIdFilter(initialStockId || '')
    setPage(1)
  }, [initialStockId])

  const loadOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const res = await ordersApi.listMyOrders({
        status: statusFilter || undefined,
        consumer_type: consumerTypeFilter || undefined,
        stock_id: stockIdFilter || undefined,
        page,
        page_size: 10,
      })
      if (seq !== seqRef.current) return
      setOrders(res.data)
      setMeta(res.meta)
    } catch (e) {
      if (seq !== seqRef.current) return
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [statusFilter, consumerTypeFilter, stockIdFilter, page, onSessionExpired])

  useEffect(() => {
    loadOrders()
    return () => {
      seqRef.current++
    }
  }, [loadOrders])

  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total
  const hasActiveFilters = Boolean(statusFilter || consumerTypeFilter || stockIdFilter)

  function resetFilters() {
    setStatusFilter('')
    setConsumerTypeFilter('')
    setStockIdFilter('')
    setPage(1)
  }

  function handleCancelled(updatedOrder) {
    setCancelTarget(null)
    if (statusFilter && statusFilter !== 'cancelled') {
      loadOrders()
    } else {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    }
    showToast?.(`تم إلغاء الطلب ${updatedOrder.order_number} بنجاح.`, true)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn
              onClick={() =>
                initialStockId
                  ? go(ROUTES.CONSUMER_STOCK_DETAILS, { stockId: initialStockId })
                  : go(ROUTES.DASHBOARD)
              }
              label={initialStockId ? 'تفاصيل المخزون' : 'لوحة التحكم'}
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">طلباتي</h1>
              <p className="text-xs text-[#6C737F] truncate">
                متابعة حالة الحجوزات والطلبات وإدارتها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(ROUTES.CONSUMER_STOCKS)}
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طلب جديد</span>
            </button>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              aria-label="تحديث قائمة الطلبات"
              className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
            >
              <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {/* لوحة الفلاتر */}
        <section className="dga-card p-4 sm:p-5 space-y-4">
          {/* فلتر حالة الطلب */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#161616] flex items-center gap-1.5">
                <Icons.Filter className="w-3.5 h-3.5 text-[#1B8354]" />
                <span>حالة الطلب</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#B42318] hover:underline cursor-pointer"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ORDER_STATUS_FILTERS.map((item) => {
                const active = statusFilter === item.value
                return (
                  <button
                    key={item.value || 'all'}
                    type="button"
                    onClick={() => {
                      setStatusFilter(item.value)
                      setPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-[4px] border text-xs font-medium dga-btn-motion cursor-pointer ${
                      active
                        ? 'border-[#1B8354] bg-[#1B8354] text-white font-semibold'
                        : 'border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] text-[#384250]'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* فلتر صفة المستفيد + فلتر المخزون المحدد */}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-[#6C737F]">صفة المستفيد:</span>
              <button
                type="button"
                onClick={() => {
                  setConsumerTypeFilter('')
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-[4px] border text-xs font-medium dga-btn-motion cursor-pointer ${
                  consumerTypeFilter === ''
                    ? 'border-[#1B8354] bg-[#F3FCF6] text-[#074D31] font-semibold'
                    : 'border-[#D2D6DB] bg-white text-[#384250] hover:bg-[#F9FAFB]'
                }`}
              >
                الكل
              </button>
              {CONSUMER_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setConsumerTypeFilter(opt.value)
                    setPage(1)
                  }}
                  className={`px-2.5 py-1 rounded-[4px] border text-xs font-medium dga-btn-motion cursor-pointer ${
                    consumerTypeFilter === opt.value
                      ? 'border-[#1B8354] bg-[#F3FCF6] text-[#074D31] font-semibold'
                      : 'border-[#D2D6DB] bg-white text-[#384250] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {opt.shortLabel}
                </button>
              ))}
            </div>

            {stockIdFilter && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-xs font-semibold text-[#074D31] self-start sm:self-auto">
                <Icons.Box className="w-3.5 h-3.5 text-[#1B8354] shrink-0" />
                <span>مخزون محدد{initialStockName ? `: ${initialStockName}` : ''}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStockIdFilter('')
                    setPage(1)
                  }}
                  aria-label="إلغاء فلتر المخزون"
                  className="p-0.5 rounded-[4px] hover:bg-[#DCFAE6] text-[#074D31] cursor-pointer"
                >
                  <Icons.Close className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* عداد النتائج */}
        {!loading && !err && (
          <div className="flex items-center justify-between text-xs text-[#6C737F] px-1">
            <span>
              {total !== undefined && total !== null
                ? `إجمالي الطلبات: ${formatOrderAmount(total)}`
                : `الطلبات المعروضة: ${formatOrderAmount(orders.length)}`}
            </span>
            <span>الأحدث أولاً</span>
          </div>
        )}

        {/* القائمة */}
        {loading ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-8 h-8 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#6C737F]">جارٍ تحميل قائمة الطلبات…</p>
          </div>
        ) : err ? (
          <div className="dga-card p-6 space-y-4 fade-in">
            <ErrorBanner err={err} />
            <SecondaryBtn onClick={loadOrders}>إعادة المحاولة</SecondaryBtn>
          </div>
        ) : orders.length === 0 ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3F4F6] text-[#6C737F] flex items-center justify-center">
              <Icons.ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#1F2A37]">لا توجد طلبات مطابقة</h2>
            <p className="text-xs text-[#6C737F] max-w-md mx-auto leading-6">
              {hasActiveFilters
                ? 'لا توجد طلبات تطابق الفلاتر المختارة حالياً. جرّب تغيير الحالة أو مسح الفلاتر.'
                : 'لم تقم بإنشاء أي طلب بعد. استكشف المخزون المتاح وابدأ طلبك الأول.'}
            </p>
            <div className="pt-1 flex justify-center gap-2">
              {hasActiveFilters ? (
                <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>
              ) : (
                <button
                  type="button"
                  onClick={() => go(ROUTES.CONSUMER_STOCKS)}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
                >
                  <Icons.Box className="w-4 h-4" />
                  <span>استكشاف المخزون المتاح</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dga-stagger">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={(selected) =>
                  go(ROUTES.CONSUMER_ORDER_DETAILS, {
                    orderId: selected.id,
                    backTo: ROUTES.CONSUMER_ORDERS,
                    backParams: stockIdFilter
                      ? { stockId: stockIdFilter, stockName: initialStockName }
                      : {},
                  })
                }
                onCancelClick={(selected) => setCancelTarget(selected)}
              />
            ))}
          </div>
        )}

        {/* الترقيم */}
        {!loading && !err && (orders.length > 0 || page > 1) && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <SecondaryBtn
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <span className="inline-flex items-center gap-1.5">
                <Icons.ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </span>
            </SecondaryBtn>

            <div className="text-center">
              <div className="text-xs font-semibold text-[#1F2A37]">
                صفحة {page} من {totalPages}
              </div>
              {total !== undefined && total !== null && (
                <div className="text-[11px] text-[#6C737F]">{formatOrderAmount(total)} طلب</div>
              )}
            </div>

            <SecondaryBtn
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <span className="inline-flex items-center gap-1.5">
                <span>التالي</span>
                <Icons.ArrowLeft className="w-4 h-4" />
              </span>
            </SecondaryBtn>
          </div>
        )}
      </main>

      <CancelOrderSheet
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={handleCancelled}
        onSessionExpired={onSessionExpired}
      />
    </div>
  )
}
