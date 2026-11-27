// ═══════════ لوحة البحث والفلاتر لاستكشاف المخزون — DGA Design System ═══════════
import { Icons } from '../../../shared/components/ui'

const AVAILABILITY_OPTIONS = [
  { key: true, label: 'المتوفر فقط' },
  { key: null, label: 'الكل' },
  { key: false, label: 'نفد المخزون' },
]

const RADIUS_OPTIONS_KM = [
  { km: null, label: 'أي مسافة' },
  { km: 3, label: '3 كم' },
  { km: 5, label: '5 كم' },
  { km: 10, label: '10 كم' },
  { km: 20, label: '20 كم' },
]

export default function StockFilters({
  searchInput,
  onSearchChange,
  onSearchSubmit,
  stockTypes,
  filters,
  onUpdateFilter,
  onReset,
  hasActiveFilters,
  hasLocation,
}) {
  function handleSubmit(e) {
    e.preventDefault()
    onSearchSubmit()
  }

  return (
    <section
      aria-label="البحث وتصفية المخزون"
      className="dga-card p-4 sm:p-5 space-y-4"
    >
      {/* ── حقل البحث بالاسم أو العنوان (DGA Search Box) ── */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 right-3.5 flex items-center text-[#6C737F] pointer-events-none">
            <Icons.Search className="w-4 h-4" />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث باسم المزود أو عنوان المخزون (مثال: المنصور، شارع جمال…)"
            aria-label="البحث باسم المزود أو عنوان المخزون"
            className="w-full min-h-[42px] bg-white border border-[#9DA4AE] rounded-[4px] pr-10 pl-4 text-sm text-[#161616] placeholder:text-[#6C737F] hover:border-[#384250] focus:outline-none focus:ring-2 focus:ring-[#1B8354]/15 focus:border-[#1B8354] transition-colors duration-150"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="min-h-[42px] px-5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-sm font-medium dga-btn-motion cursor-pointer"
          >
            بحث
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-[42px] px-3.5 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer"
            >
              إعادة تعيين
            </button>
          )}
        </div>
      </form>

      {/* ── فلتر حالة التوفر ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-medium text-[#161616]">حالة التوفر</div>
          <div className="flex items-center gap-1 p-1 rounded-[4px] bg-[#F3F4F6] border border-[#E5E7EB] text-xs">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const active = filters.inStock === opt.key
              return (
                <button
                  key={String(opt.key)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ inStock: opt.key })}
                  className={`flex-1 px-3 py-2 rounded-[4px] transition-colors duration-150 cursor-pointer ${
                    active
                      ? 'bg-white text-[#1B8354] shadow-xs font-semibold border border-[#E5E7EB]'
                      : 'text-[#384250] hover:text-[#161616] font-medium'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── فلتر نطاق المسافة (كم) ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#161616]">نطاق المسافة</span>
            {!hasLocation && (
              <span className="text-[11px] text-[#B54708] font-medium">يتطلب عنواناً افتراضياً أو موقع GPS</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {RADIUS_OPTIONS_KM.map((opt) => {
              const active = filters.maxDistanceKm === opt.km
              const disabled = !hasLocation && opt.km !== null
              return (
                <button
                  key={String(opt.km)}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ maxDistanceKm: opt.km })}
                  className={`px-3 py-1.5 rounded-[4px] border text-xs font-medium dga-btn-motion ${
                    disabled
                      ? 'border-[#E5E7EB] bg-[#F3F4F6] text-[#9DA4AE] cursor-not-allowed'
                      : active
                        ? 'border-[#1B8354] bg-[#1B8354] text-white font-semibold cursor-pointer'
                        : 'border-[#D2D6DB] bg-white text-[#384250] hover:border-[#1B8354] hover:bg-[#F3FCF6] cursor-pointer'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── فلتر تصنيف المخزون (Stock Type) ── */}
      {stockTypes.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
          <div className="text-xs font-medium text-[#161616]">تصنيف المخزون</div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={filters.stockTypeId === null}
              onClick={() => onUpdateFilter({ stockTypeId: null })}
              className={`px-3 py-1.5 rounded-[4px] border text-xs font-medium dga-btn-motion cursor-pointer ${
                filters.stockTypeId === null
                  ? 'border-[#1B8354] bg-[#1B8354] text-white font-semibold'
                  : 'border-[#D2D6DB] bg-white text-[#384250] hover:border-[#1B8354] hover:bg-[#F3FCF6]'
              }`}
            >
              كل التصنيفات
            </button>
            {stockTypes.map((t) => {
              const active = filters.stockTypeId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onUpdateFilter({ stockTypeId: t.id })}
                  className={`px-3 py-1.5 rounded-[4px] border text-xs font-medium dga-btn-motion cursor-pointer ${
                    active
                      ? 'border-[#1B8354] bg-[#1B8354] text-white font-semibold'
                      : 'border-[#D2D6DB] bg-white text-[#384250] hover:border-[#1B8354] hover:bg-[#F3FCF6]'
                  }`}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
