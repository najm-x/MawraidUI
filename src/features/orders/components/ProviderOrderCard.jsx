// ═══════════ بطاقة طلب وارد واحد لمزود الخدمة — DGA Design System ═══════════
import { Icons } from '../../../shared/components/ui'
import {
  formatConsumerType,
  formatOrderAmount,
  formatOrderDateTime,
  formatOrderGazType,
  formatOrderPrice,
  formatPaymentMethod,
  getOrderStatusMeta,
  getPaymentStatusMeta,
} from '../utils'

export default function ProviderOrderCard({
  order,
  stockLabel,
  actionLoading = false,
  onSelect,
  onAccept,
  onRejectClick,
  onComplete,
}) {
  if (!order) return null

  const statusMeta = getOrderStatusMeta(order.status)
  const payStatusMeta = getPaymentStatusMeta(order.payment_status)
  const gazType = formatOrderGazType(order.order_details?.gaz_stock_type)
  const isPending = order.status === 'pending'
  const isAccepted = order.status === 'accepted'
  const hasCoords =
    Number.isFinite(Number(order.address?.lat)) &&
    Number.isFinite(Number(order.address?.lng)) &&
    (Number(order.address?.lat) !== 0 || Number(order.address?.lng) !== 0)

  return (
    <article className="dga-card-interactive p-4 sm:p-5 space-y-3.5 text-right flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* السطر العلوي: رقم الطلب + الحالة + الإجمالي */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-[#1F2A37]" dir="ltr">
                {order.order_number}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${statusMeta.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                <span>{statusMeta.label}</span>
              </span>
              {gazType && (
                <span className="px-2 py-0.5 rounded-[4px] bg-[#FFFAEB] border border-[#FEDF89] text-[10px] font-semibold text-[#B54708]">
                  {gazType}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6C737F]">
              <span className="inline-flex items-center gap-1">
                <Icons.Clock className="w-3.5 h-3.5 text-[#9DA4AE] shrink-0" />
                <span>{formatOrderDateTime(order.created_at)}</span>
              </span>
              {stockLabel && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#384250] font-medium">
                  <Icons.Box className="w-3 h-3 text-[#1B8354]" />
                  <span className="truncate max-w-[160px]">{stockLabel}</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-lg font-bold text-[#074D31]">
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.total_price)}</span>{' '}
              <span className="text-xs font-normal text-[#6C737F]">ريال</span>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-[4px] border text-[10px] font-semibold ${payStatusMeta.badgeClass}`}>
              {payStatusMeta.label} • {formatPaymentMethod(order.payment_method)}
            </span>
          </div>
        </div>

        {/* تفاصيل الكمية وصفة المستفيد */}
        <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center justify-between sm:block">
            <span className="text-[#6C737F] block">الوحدة والكمية</span>
            <span className="font-bold text-[#1F2A37]">
              <span className="font-mono" dir="ltr">{formatOrderAmount(order.quantity)}</span> × {order.unit_name}
            </span>
          </div>

          <div className="flex items-center justify-between sm:block">
            <span className="text-[#6C737F] block">سعر الوحدة</span>
            <span className="font-semibold text-[#1F2A37]">
              <span className="font-mono" dir="ltr">{formatOrderPrice(order.unit_price)}</span> ريال
            </span>
          </div>

          <div className="flex items-center justify-between sm:block">
            <span className="text-[#6C737F] block">صفة المستفيد</span>
            <span className="font-semibold text-[#1F2A37]">{formatConsumerType(order.consumer_type)}</span>
          </div>
        </div>

        {/* عنوان التوصيل */}
        {order.address && (
          <div className="flex items-start justify-between gap-2 text-xs text-[#6C737F]">
            <div className="flex items-start gap-2 min-w-0">
              <Icons.MapPin className="w-4 h-4 text-[#1B8354] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-[#1F2A37]">{order.address.title}: </span>
                <span className="text-[#6C737F] break-words">{order.address.description}</span>
              </div>
            </div>

            {hasCoords && (
              <a
                href={`https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-2.5 py-1 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] text-[11px] font-medium text-[#1B8354] transition-colors"
              >
                الخريطة
              </a>
            )}
          </div>
        )}

        {/* ملاحظة المستفيد */}
        {order.notes && (
          <div className="dga-callout-warning px-3 py-2 text-xs text-[#1F2A37]">
            <span className="font-semibold text-[#B54708]">ملاحظة المستفيد: </span>
            <span>{order.notes}</span>
          </div>
        )}

        {/* سبب الرفض أو الإلغاء */}
        {order.reason && (order.status === 'rejected' || order.status === 'cancelled') && (
          <div className="rounded-[8px] border border-[#FECDCA] border-s-4 border-s-[#B42318] bg-[#FEF3F2] px-3 py-2 text-xs text-[#1F2A37]">
            <span className="font-semibold text-[#B42318]">السبب: </span>
            <span>{order.reason}</span>
          </div>
        )}
      </div>

      {/* شريط الإجراءات */}
      <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.FileText className="w-3.5 h-3.5" />
            <span>التفاصيل</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {isPending && (
            <>
              {onAccept && (
                <button
                  type="button"
                  onClick={() => onAccept(order)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-60"
                >
                  {actionLoading ? (
                    <Icons.Refresh className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icons.Check className="w-3.5 h-3.5" />
                  )}
                  <span>قبول الطلب</span>
                </button>
              )}

              {onRejectClick && (
                <button
                  type="button"
                  onClick={() => onRejectClick(order)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[4px] border border-[#FECDCA] bg-[#FEF3F2] hover:bg-[#FECDCA]/50 text-[#B42318] text-xs font-semibold dga-btn-motion cursor-pointer disabled:opacity-60"
                >
                  <Icons.Ban className="w-3.5 h-3.5" />
                  <span>رفض</span>
                </button>
              )}
            </>
          )}

          {isAccepted && onComplete && (
            <button
              type="button"
              onClick={() => onComplete(order)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-[4px] bg-[#074D31] hover:bg-[#1B8354] text-white text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? (
                <Icons.Refresh className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icons.Check className="w-3.5 h-3.5" />
              )}
              <span>إتمام التسليم والتحصيل</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
