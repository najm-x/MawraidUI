// ═══════════ بطاقة عرض مخزون للمستفيد مع المسافة بالكيلومتر — DGA Design System ═══════════
import { Icons } from '../../../shared/components/ui'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice } from '../utils/format'

export function StockTypeIcon({ slug }) {
  const s = String(slug || '').trim().toLowerCase()
  if (s === 'gaz' || s === 'gas') return <Icons.Gas className="w-4 h-4 text-[#B54708]" />
  if (s === 'water') return <Icons.Water className="w-4 h-4 text-[#175CD3]" />
  if (s === 'fuel') return <Icons.Fuel className="w-4 h-4 text-[#067647]" />
  return <Icons.Box className="w-4 h-4 text-[#1B8354]" />
}

export default function ConsumerStockCard({ stock, onSelect }) {
  const isAvailable = Number(stock.available) > 0
  const mainUnit = stock.units?.find((u) => u.is_main) || stock.units?.[0]
  const balances = Array.isArray(stock.balances) ? stock.balances : []
  const gazTypeLabel = formatGazStockType(stock.stock_details?.gaz_stock_type)
  const clickable = typeof onSelect === 'function'

  function handleKeyDown(e) {
    if (!clickable) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(stock)
    }
  }

  return (
    <article
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect(stock) : undefined}
      onKeyDown={handleKeyDown}
      className={`${clickable ? 'group dga-card-interactive cursor-pointer' : 'dga-card'} p-5 flex flex-col justify-between gap-4`}
    >
      <div className="space-y-3.5">
        {/* ── الترويسة: التصنيف + شارة المسافة + التوفر ── */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-semibold text-[#1F2A37]">
              <StockTypeIcon slug={stock.type?.slug} />
              <span>{stock.type?.name || 'مخزون'}</span>
            </span>

            {gazTypeLabel && (
              <span className="inline-flex items-center px-2 py-1 rounded-[4px] bg-[#FFFAEB] border border-[#FEDF89] text-[11px] font-semibold text-[#B54708]">
                {gazTypeLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {stock.distance_formatted && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31] text-xs font-semibold"
                title={`المسافة التقريبية: ${stock.distance_km} كم`}
              >
                <Icons.MapPin className="w-3.5 h-3.5 shrink-0 text-[#1B8354]" />
                <span>{stock.distance_formatted}</span>
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isAvailable
                  ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                  : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
              }`}
            >
              {isAvailable ? 'متوفر' : 'نفد المخزون'}
            </span>
          </div>
        </div>

        {/* ── العنوان ── */}
        <div className="flex items-start gap-2 text-sm">
          <Icons.MapPin className="w-4 h-4 text-[#9DA4AE] shrink-0 mt-0.5" />
          <p className="font-semibold text-[#1F2A37] leading-6 break-words">
            {stock.address || 'عنوان غير محدد'}
          </p>
        </div>

        {/* ── الكمية المتوفرة والأرصدة حسب الوحدات ── */}
        <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6C737F] font-medium">الكمية المتوفرة</span>
            <span className={`font-bold text-sm ${isAvailable ? 'text-[#067647]' : 'text-[#B42318]'}`}>
              <span className="font-mono" dir="ltr">{formatAmount(stock.available)}</span>{' '}
              <span>{mainUnit?.name || ''}</span>
            </span>
          </div>

          {balances.length > 0 && (
            <div className="pt-2 border-t border-[#E5E7EB] flex flex-wrap gap-1.5">
              {balances.map((b) => {
                const unitObj = stock.units?.find((u) => u.id === b.unit_id || u.name === b.unit)
                return (
                  <span
                    key={b.unit_id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-white border border-[#E5E7EB] text-[11px] text-[#384250] font-medium"
                  >
                    <span className="font-mono font-semibold text-[#1F2A37]" dir="ltr">{formatAmount(b.amount)}</span>
                    <span>{b.unit}</span>
                    {unitObj?.price !== undefined && unitObj?.price !== null && (
                      <span className="text-[#1B8354] font-normal mr-1">
                        (<span className="font-mono" dir="ltr">{formatPrice(unitObj.price)}</span>)
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── تذييل البطاقة: آخر تحديث + عرض التفاصيل ── */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#E5E7EB] text-[11px] text-[#6C737F]">
        <span className="inline-flex items-center gap-1">
          <Icons.Clock className="w-3.5 h-3.5 text-[#9DA4AE]" />
          <span>آخر تحديث: {formatDateTime(stock.updated_at)}</span>
        </span>
        <div className="flex items-center gap-2">
          {typeof stock.distance_km === 'number' && (
            <span className="font-mono text-[#6C737F]" dir="ltr">
              {stock.distance_km.toFixed(1)} km
            </span>
          )}
          {clickable && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#1B8354]">
              <span>التفاصيل</span>
              <Icons.ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
