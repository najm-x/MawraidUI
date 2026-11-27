// ═══════════ قسم الطلبات الواردة في لوحة تحكم المزود — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatOrderAmount, isSessionExpiredError } from '../utils'
import ProviderOrderCard from './ProviderOrderCard'
import RejectOrderSheet from './RejectOrderSheet'

const QUICK_STATUS_TABS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'accepted', label: 'مقبول (قيد التسليم)' },
  { value: 'completed', label: 'مكتمل' },
]

export default function ProviderOrdersSection({
  go,
  showToast,
  onSessionExpired,
  onOrderChanged,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [busyOrderId, setBusyOrderId] = useState(null)
  const [actionErr, setActionErr] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const seqRef = useRef(0)

  const loadOrders = useCallback(async () => {
    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const res = await ordersApi.listProviderOrders({
        status: statusFilter || undefined,
        page: 1,
        page_size: 6,
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
  }, [statusFilter, onSessionExpired])

  useEffect(() => {
    loadOrders()
    return () => {
      seqRef.current++
    }
  }, [loadOrders])

  function applyOrderUpdate(updatedOrder) {
    if (statusFilter && statusFilter !== updatedOrder.status) {
      loadOrders()
    } else {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
    }
    onOrderChanged?.(updatedOrder)
  }

  async function handleAccept(order) {
    setActionErr(null)
    setBusyOrderId(order.id)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      applyOrderUpdate(updated)
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
      applyOrderUpdate(updated)
      showToast?.(`تم إتمام الطلب ${updated.order_number} وتأكيد الاستلام.`, true)
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
    applyOrderUpdate(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  return (
    <section className="space-y-4 text-right" aria-label="الطلبات الواردة للمزود">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-[#1F2A37]">الطلبات الواردة من المستفيدين</h2>
          {meta?.total !== undefined && meta?.total !== null && (
            <span className="px-2.5 py-0.5 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31] text-xs font-semibold font-mono" dir="ltr">
              {formatOrderAmount(meta.total)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            aria-label="تحديث الطلبات الواردة"
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            type="button"
            onClick={() => go(ROUTES.PROVIDER_ORDERS)}
            className="group inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
          >
            <span>إدارة كل الطلبات</span>
            <Icons.ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* ألسنة تصفية سريعة (DGA Horizontal Tab List) */}
      <div className="flex flex-wrap border-b border-[#D2D6DB] gap-1">
        {QUICK_STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2.5 rounded-t-[4px] border-b-2 text-xs sm:text-sm transition-colors duration-150 cursor-pointer ${
                active
                  ? 'border-[#1B8354] text-[#1B8354] font-semibold bg-[#F3FCF6]/50'
                  : 'border-transparent text-[#384250] hover:text-[#161616] hover:bg-white font-medium'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <ErrorBanner err={actionErr} />

      {loading ? (
        <div className="dga-card p-8 text-center space-y-2.5 fade-in">
          <div className="w-7 h-7 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
          <p className="text-xs font-medium text-[#6C737F]">جارٍ تحميل الطلبات الواردة…</p>
        </div>
      ) : err ? (
        <div className="dga-card p-5 space-y-3 fade-in">
          <ErrorBanner err={err} />
          <SecondaryBtn onClick={loadOrders} className="text-xs">
            إعادة المحاولة
          </SecondaryBtn>
        </div>
      ) : orders.length === 0 ? (
        <div className="dga-card p-8 text-center space-y-2.5 fade-in">
          <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3F4F6] text-[#6C737F] flex items-center justify-center">
            <Icons.ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#1F2A37]">
            {statusFilter ? 'لا توجد طلبات مطابقة لهذه الحالة حالياً' : 'لا توجد طلبات واردة حتى الآن'}
          </h3>
          <p className="text-xs text-[#6C737F] max-w-md mx-auto leading-6">
            ستظهر هنا طلبات المستفيدين الجديدة فور إنشائها لتتمكن من قبولها وإتمام تسليمها.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dga-stagger">
          {orders.map((order) => (
            <ProviderOrderCard
              key={order.id}
              order={order}
              actionLoading={busyOrderId === order.id}
              onSelect={(selected) =>
                go(ROUTES.PROVIDER_ORDER_DETAILS, {
                  orderId: selected.id,
                  backTo: ROUTES.DASHBOARD,
                })
              }
              onAccept={handleAccept}
              onRejectClick={(selected) => setRejectTarget(selected)}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}

      <RejectOrderSheet
        order={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </section>
  )
}
