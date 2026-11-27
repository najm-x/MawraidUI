// ═══════════ شاشة تفاصيل طلب وارد لمزود الخدمة — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import LocationPicker from '../../../shared/components/ui/LocationPicker'
import { ROUTES } from '../../../shared/constants/routes'
import {
  formatConsumerType,
  formatOrderAmount,
  formatOrderDateTime,
  formatOrderGazType,
  formatOrderPrice,
  formatPaymentMethod,
  getOrderStatusMeta,
  getPaymentStatusMeta,
  isSessionExpiredError,
} from '../utils'
import RejectOrderSheet from '../components/RejectOrderSheet'

export default function ProviderOrderDetailsPage({
  go,
  orderId,
  backTo = ROUTES.PROVIDER_ORDERS,
  backParams = {},
  showToast,
  onSessionExpired,
}) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [actionBusy, setActionBusy] = useState(false)
  const [actionErr, setActionErr] = useState(null)
  const [showRejectSheet, setShowRejectSheet] = useState(false)

  const seqRef = useRef(0)

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setOrder(null)
      setErr(new Error('معرّف الطلب غير محدد.'))
      setLoading(false)
      return
    }

    const seq = ++seqRef.current
    setLoading(true)
    setErr(null)

    try {
      const data = await ordersApi.getProviderOrder(orderId)
      if (seq !== seqRef.current) return
      setOrder(data)
    } catch (e) {
      if (seq !== seqRef.current) return
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setOrder(null)
      setErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [orderId, onSessionExpired])

  useEffect(() => {
    loadOrder()
    return () => {
      seqRef.current++
    }
  }, [loadOrder])

  async function handleAccept() {
    if (!order) return
    setActionErr(null)
    setActionBusy(true)
    try {
      const updated = await ordersApi.acceptProviderOrder(order.id)
      setOrder(updated)
      showToast?.(`تم قبول الطلب ${updated.order_number} بنجاح.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setActionBusy(false)
    }
  }

  async function handleComplete() {
    if (!order) return
    setActionErr(null)
    setActionBusy(true)
    try {
      const updated = await ordersApi.completeProviderOrder(order.id)
      setOrder(updated)
      showToast?.(`تم إتمام تسليم الطلب ${updated.order_number} وتحصيل المبلغ.`, true)
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setActionErr(e)
    } finally {
      setActionBusy(false)
    }
  }

  function handleRejected(updated) {
    setShowRejectSheet(false)
    setOrder(updated)
    showToast?.(`تم رفض الطلب ${updated.order_number} واستعادة الرصيد للمخزون.`, true)
  }

  const statusMeta = getOrderStatusMeta(order?.status)
  const payStatusMeta = getPaymentStatusMeta(order?.payment_status)
  const gazType = formatOrderGazType(order?.order_details?.gaz_stock_type)
  const isPending = order?.status === 'pending'
  const isAccepted = order?.status === 'accepted'
  const hasAddressCoords =
    Number.isFinite(Number(order?.address?.lat)) &&
    Number.isFinite(Number(order?.address?.lng)) &&
    (Number(order?.address?.lat) !== 0 || Number(order?.address?.lng) !== 0)

  const backLabel =
    backTo === ROUTES.DASHBOARD
      ? 'لوحة التحكم'
      : backTo === ROUTES.STOCK_DASHBOARD
      ? 'إدارة المخزون'
      : 'الطلبات الواردة'

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn onClick={() => go(backTo, backParams)} label={backLabel} />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">
                تفاصيل الطلب الوارد
              </h1>
              {order?.order_number && (
                <p className="text-xs text-[#6C737F] font-mono truncate" dir="ltr">
                  {order.order_number}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={loadOrder}
            disabled={loading}
            aria-label="تحديث بيانات الطلب"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {loading ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-8 h-8 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#6C737F]">جارٍ تحميل تفاصيل الطلب…</p>
          </div>
        ) : err ? (
          <div className="dga-card p-6 space-y-4 fade-in">
            <ErrorBanner err={err} />
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={loadOrder}>إعادة المحاولة</SecondaryBtn>
              <SecondaryBtn onClick={() => go(ROUTES.PROVIDER_ORDERS)}>العودة للطلبات الواردة</SecondaryBtn>
            </div>
          </div>
        ) : !order ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <p className="text-sm font-medium text-[#6C737F]">لم يتم العثور على هذا الطلب.</p>
            <SecondaryBtn onClick={() => go(ROUTES.PROVIDER_ORDERS)}>العودة للطلبات الواردة</SecondaryBtn>
          </div>
        ) : (
          <>
            <ErrorBanner err={actionErr} />

            {/* 1) بطاقة الملخص والإجراءات التنفيذية */}
            <section className="dga-card p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-semibold ${statusMeta.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
                      <span>{statusMeta.label}</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-[4px] border text-xs font-semibold ${payStatusMeta.badgeClass}`}>
                      {payStatusMeta.label}
                    </span>
                    {gazType && (
                      <span className="px-2.5 py-0.5 rounded-[4px] bg-[#FFFAEB] border border-[#FEDF89] text-xs font-semibold text-[#B54708]">
                        {gazType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A37] font-mono" dir="ltr">
                    {order.order_number}
                  </h2>

                  <p className="text-xs text-[#6C737F]">
                    تاريخ ورود الطلب: <strong className="text-[#1F2A37]">{formatOrderDateTime(order.created_at)}</strong>
                  </p>
                </div>

                <div className="rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] px-4 py-3 text-right sm:text-left shrink-0">
                  <div className="text-xs font-medium text-[#074D31]">المبلغ المستحق</div>
                  <div className="text-2xl font-bold text-[#074D31]">
                    <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span>{' '}
                    <span className="text-xs font-normal text-[#1B8354]">ريال</span>
                  </div>
                  <div className="text-[11px] font-medium text-[#384250] mt-0.5">
                    {formatPaymentMethod(order.payment_method)}
                  </div>
                </div>
              </div>

              {/* شريط اتخاذ القرار للمزود */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => go(ROUTES.STOCK_DASHBOARD, { stockId: order.stock_id })}
                  className="inline-flex items-center gap-2 min-h-[38px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer"
                >
                  <Icons.Box className="w-4 h-4 text-[#1B8354]" />
                  <span>إدارة المخزون المرتبط</span>
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={actionBusy}
                        className="inline-flex items-center gap-2 min-h-[38px] px-5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-60"
                      >
                        {actionBusy ? (
                          <Icons.Refresh className="w-4 h-4 animate-spin" />
                        ) : (
                          <Icons.Check className="w-4 h-4" />
                        )}
                        <span>قبول الطلب الآن</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRejectSheet(true)}
                        disabled={actionBusy}
                        className="inline-flex items-center gap-2 min-h-[38px] px-4 rounded-[4px] border border-[#FECDCA] bg-[#FEF3F2] hover:bg-[#FECDCA]/50 text-[#B42318] text-xs font-semibold dga-btn-motion cursor-pointer disabled:opacity-60"
                      >
                        <Icons.Ban className="w-4 h-4" />
                        <span>رفض الطلب</span>
                      </button>
                    </>
                  )}

                  {isAccepted && (
                    <button
                      type="button"
                      onClick={handleComplete}
                      disabled={actionBusy}
                      className="inline-flex items-center gap-2 min-h-[38px] px-5 rounded-[4px] bg-[#074D31] hover:bg-[#1B8354] text-white text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-60"
                    >
                      {actionBusy ? (
                        <Icons.Refresh className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icons.Check className="w-4 h-4" />
                      )}
                      <span>إتمام التسليم وتأكيد التحصيل النقدي</span>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* 2) تفاصيل الكمية وصفة المستفيد */}
            <section className="dga-card p-5 sm:p-6 space-y-4">
              <h3 className="text-base font-bold text-[#1F2A37]">تفاصيل الحجز وصفة المستفيد</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3.5">
                  <span className="text-xs text-[#6C737F] block">الوحدة المطلوبة</span>
                  <span className="text-sm font-bold text-[#1F2A37] mt-1 block">{order.unit_name}</span>
                  {Number(order.unit_rate) > 1 && (
                    <span className="text-[11px] text-[#6C737F]">
                      المعامل: <strong className="font-mono" dir="ltr">{formatOrderAmount(order.unit_rate)}</strong>
                    </span>
                  )}
                </div>

                <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3.5">
                  <span className="text-xs text-[#6C737F] block">الكمية المحجوزة</span>
                  <span className="text-sm font-bold text-[#1F2A37] font-mono mt-1 block" dir="ltr">
                    {formatOrderAmount(order.quantity)}
                  </span>
                </div>

                <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3.5">
                  <span className="text-xs text-[#6C737F] block">سعر الوحدة</span>
                  <span className="text-sm font-bold text-[#1F2A37] mt-1 block">
                    <span className="font-mono" dir="ltr">{formatOrderPrice(order.unit_price)}</span> ريال
                  </span>
                </div>

                <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3.5">
                  <span className="text-xs text-[#6C737F] block">صفة المستفيد</span>
                  <span className="text-sm font-bold text-[#1F2A37] mt-1 block">
                    {formatConsumerType(order.consumer_type)}
                  </span>
                </div>
              </div>

              {(order.notes || order.reason) && (
                <div className="space-y-2.5 pt-2">
                  {order.notes && (
                    <div className="dga-callout-warning p-3.5 text-xs text-[#1F2A37]">
                      <span className="font-semibold text-[#B54708] block mb-1">ملاحظات المستفيد للتسليم:</span>
                      <p className="leading-6 whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}

                  {order.reason && (
                    <div className="rounded-[8px] border border-[#FECDCA] border-s-4 border-s-[#B42318] bg-[#FEF3F2] p-3.5 text-xs text-[#1F2A37]">
                      <span className="font-semibold text-[#B42318] block mb-1">
                        {order.status === 'rejected' ? 'سبب الرفض المسجّل:' : 'سبب الإلغاء:'}
                      </span>
                      <p className="leading-6 whitespace-pre-wrap">{order.reason}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 3) موقع وعنوان المستفيد للتوصيل */}
            {order.address && (
              <section className="dga-card p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#1F2A37]">
                      عنوان التوصيل: {order.address.title || 'عنوان المستفيد'}
                    </h3>
                    <p className="text-xs text-[#6C737F] mt-1">{order.address.description}</p>
                  </div>

                  {hasAddressCoords && (
                    <a
                      href={`https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion self-start sm:self-center"
                    >
                      <Icons.Navigation className="w-3.5 h-3.5 text-[#1B8354]" />
                      <span>التوجيه عبر خرائط Google</span>
                    </a>
                  )}
                </div>

                {hasAddressCoords && (
                  <LocationPicker
                    lat={Number(order.address.lat)}
                    lng={Number(order.address.lng)}
                    readOnly
                    height={240}
                  />
                )}
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6C737F] px-1">
              <span>آخر تحديث: {formatOrderDateTime(order.updated_at)}</span>
              {order.transaction_id && (
                <span className="font-mono" dir="ltr">Ref: {order.transaction_id.slice(0, 8)}</span>
              )}
            </div>
          </>
        )}
      </main>

      <RejectOrderSheet
        order={showRejectSheet ? order : null}
        onClose={() => setShowRejectSheet(false)}
        onRejected={handleRejected}
        onSessionExpired={onSessionExpired}
      />
    </div>
  )
}
