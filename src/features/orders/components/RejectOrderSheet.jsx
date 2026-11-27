// ═══════════ نافذة سفلية (Bottom Sheet) لرفض طلب وارد من قبل المزود — DGA Design System ═══════════
import { useEffect, useState } from 'react'
import { ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, Label, SecondaryBtn } from '../../../shared/components/ui'
import {
  formatOrderAmount,
  formatOrderPrice,
  isSessionExpiredError,
  validateCancelReason,
} from '../utils'

const PROVIDER_REJECT_REASONS = [
  'خارج نطاق التوصيل المعتمد',
  'نفاد الكمية المتاحة حالياً',
  'انتهاء ساعات العمل الرسمية',
  'تعذر الوصول أو التواصل مع المستفيد',
]

export default function RejectOrderSheet({
  order,
  onClose,
  onRejected,
  onSessionExpired,
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const open = Boolean(order)

  useEffect(() => {
    if (!open) return
    setReason('')
    setErr(null)
  }, [open, order?.id])

  useEffect(() => {
    if (!open) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e) {
      if (e.key === 'Escape' && !submitting) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, submitting, onClose])

  if (!order) return null

  const restoredUnits = (Number(order.quantity) || 0) * (Number(order.unit_rate) || 1)

  async function handleConfirmReject(e) {
    if (e) e.preventDefault()
    setErr(null)

    const validationErr = validateCancelReason(reason)
    if (validationErr) {
      setErr(validationErr)
      return
    }

    const trimmed = reason.trim()
    setSubmitting(true)
    try {
      const updated = await ordersApi.rejectProviderOrder(
        order.id,
        trimmed ? { reason: trimmed } : {}
      )
      onRejected?.(updated)
    } catch (e2) {
      if (isSessionExpiredError(e2)) {
        onSessionExpired?.()
        return
      }
      setErr(e2)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[1200] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-order-sheet-title"
    >
      <div
        className="fixed inset-0 bg-[#0D121C]/50 backdrop-blur-[2px] dga-backdrop-in"
        onClick={() => !submitting && onClose?.()}
        aria-hidden="true"
      />

      <div className="sheet-up relative z-10 w-full max-w-lg bg-white rounded-t-[16px] border-t border-x border-[#D2D6DB] shadow-dga-lg max-h-[90vh] flex flex-col overflow-hidden text-right">
        <div className="px-5 sm:px-6 pt-3 pb-4 border-b border-[#E5E7EB]">
          <div className="w-12 h-1 rounded-full bg-[#D2D6DB] mx-auto mb-3" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="reject-order-sheet-title" className="text-lg font-bold text-[#1F2A37]">
                رفض الطلب الوارد
              </h2>
              <p className="text-xs text-[#6C737F] mt-0.5 font-mono" dir="ltr">
                {order.order_number}
              </p>
            </div>
            <button
              type="button"
              onClick={() => !submitting && onClose?.()}
              disabled={submitting}
              aria-label="إغلاق"
              className="w-8 h-8 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] flex items-center justify-center dga-btn-motion cursor-pointer disabled:opacity-50"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleConfirmReject} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          <ErrorBanner err={err} />

          <div className="rounded-[8px] border border-[#FECDCA] border-s-4 border-s-[#B42318] bg-[#FEF3F2] p-3.5 text-xs text-[#1F2A37] space-y-1">
            <p className="font-semibold">
              سيتم رفض طلب ({formatOrderAmount(order.quantity)} {order.unit_name}) بقيمة{' '}
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span> ريال.
            </p>
            <p className="text-[11px] text-[#B42318]">
              ستُعاد الكمية المحجوزة ({formatOrderAmount(restoredUnits)} وحدة أساسية) تلقائياً إلى الرصيد المتاح في المخزون.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="provider-reject-reason">سبب الرفض لإشعار المستفيد (اختياري)</Label>
              <span className="text-[11px] font-mono text-[#6C737F]" dir="ltr">
                {reason.length}/500
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {PROVIDER_REJECT_REASONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className={`px-2.5 py-1 rounded-[4px] border text-[11px] font-medium dga-btn-motion cursor-pointer ${
                    reason === preset
                      ? 'border-[#B42318] bg-[#FEF3F2] text-[#B42318] font-semibold'
                      : 'border-[#D2D6DB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#384250]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              id="provider-reject-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: خارج نطاق التوصيل أو انتهاء الدوام..."
              className="w-full rounded-[4px] border border-[#9DA4AE] bg-white p-3 text-xs text-[#161616] placeholder:text-[#6C737F] outline-none transition-colors duration-150 focus:border-[#B42318] focus:ring-2 focus:ring-[#B42318]/15"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] px-4 rounded-[4px] bg-[#B42318] hover:bg-[#912018] active:bg-[#7A271A] text-white text-sm font-medium dga-btn-motion flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Icons.Refresh className="w-4 h-4 animate-spin" />
                  <span>جارٍ رفض الطلب…</span>
                </>
              ) : (
                <>
                  <Icons.Ban className="w-4 h-4" />
                  <span>تأكيد رفض الطلب</span>
                </>
              )}
            </button>

            <SecondaryBtn
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[44px]"
            >
              تراجع
            </SecondaryBtn>
          </div>
        </form>
      </div>
    </div>
  )
}
