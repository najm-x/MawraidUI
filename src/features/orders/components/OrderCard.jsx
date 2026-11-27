// ═══════════ بطاقة عرض طلب واحد للمستفيد — DGA Design System ═══════════
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

export default function OrderCard({ order, onSelect, onCancelClick }) {
  if (!order) return null

  const statusMeta = getOrderStatusMeta(order.status)
  const payStatusMeta = getPaymentStatusMeta(order.payment_status)
  const gazType = formatOrderGazType(order.order_details?.gaz_stock_type)
  const isPending = order.status === 'pending'

  return (
    <article className="dga-card-interactive p-4 sm:p-5 space-y-3.5 text-right">
      {/* السطر العلوي: رقم الطلب + الحالة + التاريخ */}
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

          <div className="flex items-center gap-1.5 text-[11px] text-[#6C737F]">
            <Icons.Clock className="w-3.5 h-3.5 text-[#9DA4AE] shrink-0" />
            <span>{formatOrderDateTime(order.created_at)}</span>
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

      {/* تفاصيل الوحدة والكمية وصفة المستفيد */}
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

      {/* العنوان والملاحظات */}
      {order.address && (
        <div className="flex items-start gap-2 text-xs text-[#6C737F]">
          <Icons.MapPin className="w-4 h-4 text-[#1B8354] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-semibold text-[#1F2A37]">{order.address.title}: </span>
            <span className="text-[#6C737F] break-words">{order.address.description}</span>
          </div>
        </div>
      )}

      {order.reason && (order.status === 'cancelled' || order.status === 'rejected') && (
        <div className="rounded-[8px] border border-[#FECDCA] border-s-4 border-s-[#B42318] bg-[#FEF3F2] px-3 py-2 text-xs text-[#1F2A37]">
          <span className="font-semibold text-[#B42318]">السبب: </span>
          <span>{order.reason}</span>
        </div>
      )}

      {/* أزرار الإجراءات */}
      <div className="pt-2.5 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3FCF6] hover:border-[#1B8354] hover:text-[#1B8354] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer"
          >
            <Icons.FileText className="w-3.5 h-3.5" />
            <span>تفاصيل الطلب</span>
          </button>
        )}

        {isPending && onCancelClick && (
          <button
            type="button"
            onClick={() => onCancelClick(order)}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-[4px] border border-[#FECDCA] bg-[#FEF3F2] hover:bg-[#FECDCA]/50 text-[#B42318] text-xs font-semibold dga-btn-motion cursor-pointer"
          >
            <Icons.Ban className="w-3.5 h-3.5" />
            <span>إلغاء الطلب</span>
          </button>
        )}
      </div>
    </article>
  )
}
