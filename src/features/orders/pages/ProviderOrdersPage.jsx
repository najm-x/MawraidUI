// ═══════════ شاشة إدارة الطلبات الواردة لمزود الخدمة — DGA Design System ═══════════
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ordersApi, stockApi } from '../../../services/api'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import {
  CONSUMER_TYPE_OPTIONS,
  ORDER_STATUS_FILTERS,
  formatOrderAmount,
  isSessionExpiredError,
} from '../utils'
import ProviderOrderCard from '../components/ProviderOrderCard'
import RejectOrderSheet from '../components/RejectOrderSheet'

export default function ProviderOrdersPage({
  go,
  initialStockId = '',
  showToast,
  onSessionExpired,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [consumerTypeFilter, setConsumerTypeFilter] = useState('')
  const [stockIdFilter, setStockIdFilter] = useState(initialStockId || '')
  const [page, setPage] = useState(1)

  const [stocks, setStocks] = useState([])
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [busyOrderId, setBusyOrderId] = useState(null)
  const [actionErr, setActionErr] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const seqRef = useRef(0)

  useEffect(() => {
    setStockIdFilter(initialStockId || '')
    setPage(1)
  }, [initialStockId])

  const loadMyStocks = useCallback(async () => {
    try {
      const list = await stockApi.getMyStocks()
      setStocks(Array.isArray(list) ? list : [])
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
      }
    }
  }, [onSessionExpired])

  const loadOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const res = await ordersApi.listProviderOrders({
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
    loadMyStocks()
  }, [loadMyStocks])

  useEffect(() => {
    loadOrders()
    return () => {
      seqRef.current++
    }
  }, [loadOrders])

  const stocksMap = useMemo(() => {
    const map = new Map()
    for (const s of stocks) {
      map.set(s.id, s)
    }
    return map
  }, [stocks])

  const summaryCounters = useMemo(() => {
    const relevant = stockIdFilter
      ? stocks.filter((s) => s.id === stockIdFilter)
      : stocks
    if (relevant.length === 0) return null

    let available = 0
    let pending = 0
    let completed = 0
    for (const s of relevant) {
      available += Number(s.available) || 0
      pending += Number(s.pending_orders) || 0
      completed += Number(s.completed_orders) || 0
    }
    return { available, pending, completed, singleStock: relevant.length === 1 ? relevant[0] : null }
  }, [stocks, stockIdFilter])

  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total
  const hasActiveFilters = Boolean(statusFilter || consumerTypeFilter || stockIdFilter)

  function resetFilters() {
    setStatusFilter('')
    setConsumerTypeFilter('')
    setStockIdFilter('')
    setPage(1)
  }

  function applyOrderMutation(updatedOrder) {
    if (statusFilter && statusFilter !== updatedOrder.status) {
      loadOrders()
    } else {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    }
    loadMyStocks()
  }

  async function handleAccept(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      applyOrderMutation(updated)
      showToast?.(`تم قبول الطلب ${updated.order_number} بنجاح.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setBusyOrderId(null)
    }
  }

  async function handleComplete(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.completeProviderOrder(order.id)
      applyOrderMutation(updated)
      showToast?.(`تم إتمام الطلب ${updated.order_number} وتأكيد الدفع.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setBusyOrderId(null)
    }
  }

  function handleRejected(updated) {
    setRejectTarget(null)
    applyOrderMutation(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  function refreshAll() {
    loadMyStocks()
    loadOrders()
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
                  ? go(ROUTES.STOCK_DASHBOARD, { stockId: initialStockId })
                  : go(ROUTES.DASHBOARD)
              }
              label={initialStockId ? 'إدارة المخزون' : 'لوحة التحكم'}
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">
                الطلبات الواردة للمزود
              </h1>
              <p className="text-xs text-[#6C737F] truncate">
                قبول، رفض، وإتمام تسليم طلبات المستفيدين
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            aria-label="تحديث البيانات"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {/* 1) بطاقات الملخص الحية */}
        {summaryCounters && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 dga-stagger" aria-label="ملخص حالة المخزون والطلبات">
            <div className="dga-card border-s-4 border-s-[#1B8354] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#6C737F]">
                  {summaryCounters.singleStock ? 'الرصيد المتاح حالياً' : 'إجمالي الأرصدة المتاحة'}
                </p>
                <p className="mt-1 text-2xl font-bold text-[#074D31] font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.available)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
                <Icons.Box className="w-5 h-5" />
              </div>
            </div>

            <div className="dga-card border-s-4 border-s-[#DBA102] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#6C737F]">طلبات قيد الانتظار</p>
                <p className="mt-1 text-2xl font-bold text-[#B54708] font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.pending)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center shrink-0">
                <Icons.Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="dga-card border-s-4 border-s-[#067647] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#6C737F]">طلبات مكتملة</p>
                <p className="mt-1 text-2xl font-bold text-[#067647] font-mono" dir="ltr">
                  {formatOrderAmount(summaryCounters.completed)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-[8px] bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] flex items-center justify-center shrink-0">
                <Icons.Check className="w-5 h-5" />
              </div>
            </div>
          </section>
        )}

        {/* 2) لوحة الفلاتر */}
        <section className="dga-card p-4 sm:p-5 space-y-4">
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

          <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* فلتر صفة المستفيد */}
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

            {/* فلتر المخزون */}
            {stocks.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="provider-stock-filter" className="text-xs font-medium text-[#6C737F] shrink-0">
                  المخزون:
                </label>
                <select
                  id="provider-stock-filter"
                  value={stockIdFilter}
                  onChange={(e) => {
                    setStockIdFilter(e.target.value)
                    setPage(1)
                  }}
                  className="flex-1 min-h-[38px] rounded-[4px] border border-[#9DA4AE] bg-white px-3 text-xs font-medium text-[#161616] outline-none hover:border-[#384250] focus:border-[#1B8354] focus:ring-2 focus:ring-[#1B8354]/15"
                >
                  <option value="">جميع المخازن ({stocks.length})</option>
                  {stocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type?.name || 'مخزون'} — {s.address || s.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </section>

        <ErrorBanner err={actionErr} />

        {/* 3) عداد النتائج */}
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

        {/* 4) قائمة البطاقات */}
        {loading ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-8 h-8 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#6C737F]">جارٍ تحميل الطلبات الواردة…</p>
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
            <h2 className="text-base font-bold text-[#1F2A37]">لا توجد طلبات واردة مطابقة</h2>
            <p className="text-xs text-[#6C737F] max-w-md mx-auto leading-6">
              {hasActiveFilters
                ? 'لا توجد طلبات تطابق الفلاتر المختارة حالياً. جرّب مسح الفلاتر لعرض جميع الطلبات.'
                : 'لم ترد أي طلبات على مخازنك حتى الآن.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-1">
                <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dga-stagger">
            {orders.map((order) => {
              const st = stocksMap.get(order.stock_id)
              const stockLabel = st ? st.type?.name || st.address : null
              return (
                <ProviderOrderCard
                  key={order.id}
                  order={order}
                  stockLabel={stockLabel}
                  actionLoading={busyOrderId === order.id}
                  onSelect={(selected) =>
                    go(ROUTES.PROVIDER_ORDER_DETAILS, {
                      orderId: selected.id,
                      backTo: ROUTES.PROVIDER_ORDERS,
                      backParams: stockIdFilter ? { stockId: stockIdFilter } : {},
                    })
                  }
                  onAccept={handleAccept}
                  onRejectClick={(selected) => setRejectTarget(selected)}
                  onComplete={handleComplete}
                />
              )
            })}
          </div>
        )}

        {/* 5) الترقيم */}
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

      <RejectOrderSheet
        order={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </div>
  )
}
