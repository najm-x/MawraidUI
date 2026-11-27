// ═══════════ قسم طلباتي الأخيرة في لوحة التحكم للمستفيد — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatOrderAmount, isSessionExpiredError } from '../utils'
import OrderCard from './OrderCard'
import CancelOrderSheet from './CancelOrderSheet'

export default function ConsumerOrdersSection({ go, showToast, onSessionExpired }) {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const seqRef = useRef(0)

  const loadRecentOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)
    try {
      const res = await ordersApi.listMyOrders({ page: 1, page_size: 4 })
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
  }, [onSessionExpired])

  useEffect(() => {
    loadRecentOrders()
    return () => {
      seqRef.current++
    }
  }, [loadRecentOrders])

  function handleCancelled(updatedOrder) {
    setCancelTarget(null)
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    showToast?.(`تم إلغاء الطلب ${updatedOrder.order_number} واستعادة الرصيد.`, true)
  }

  return (
    <section className="space-y-4 text-right" aria-label="طلباتي الأخيرة">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[#1F2A37]">طلباتي الأخيرة</h2>
          {meta?.total !== undefined && meta?.total !== null && (
            <span className="px-2.5 py-0.5 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31] text-xs font-semibold font-mono" dir="ltr">
              {formatOrderAmount(meta.total)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRecentOrders}
            disabled={loading}
            aria-label="تحديث الطلبات"
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => go(ROUTES.CONSUMER_ORDERS)}
            className="group inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
          >
            <span>عرض كل الطلبات</span>
            <Icons.ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dga-card p-8 text-center space-y-2.5 fade-in">
          <div className="w-7 h-7 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#6C737F]">جارٍ تحميل أحدث طلباتك…</p>
        </div>
      ) : err ? (
        <div className="dga-card p-5 space-y-3 fade-in">
          <ErrorBanner err={err} />
          <SecondaryBtn onClick={loadRecentOrders} className="text-xs">
            إعادة المحاولة
          </SecondaryBtn>
        </div>
      ) : orders.length === 0 ? (
        <div className="dga-card p-8 text-center space-y-3 fade-in">
          <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center">
            <Icons.ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1F2A37]">لا توجد لديك طلبات مسجلة حتى الآن</h3>
          <p className="text-xs text-[#6C737F] max-w-md mx-auto leading-6">
            تصفّح المخازن المتاحة بالقرب منك واحجز حصتك من الغاز أو المياه أو الوقود بخطوات بسيطة.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => go(ROUTES.CONSUMER_STOCKS)}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
            >
              <Icons.Box className="w-4 h-4" />
              <span>استكشاف المخزون وإنشاء طلب</span>
            </button>
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
                  backTo: ROUTES.DASHBOARD,
                })
              }
              onCancelClick={(selected) => setCancelTarget(selected)}
            />
          ))}
        </div>
      )}

      <CancelOrderSheet
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={handleCancelled}
        onSessionExpired={onSessionExpired}
      />
    </section>
  )
}
