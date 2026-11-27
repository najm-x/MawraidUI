// ═══════════ شريط العنوان النشط / العنوان الافتراضي لحساب المسافة — DGA Design System ═══════════
import { Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'

export default function AddressLocationBar({
  isConsumer,
  addressLoading,
  addresses,
  selectedAddress,
  locationSource,
  activeCoords,
  gpsLoading,
  gpsErr,
  onSelectAddress,
  onRequestGps,
  onClearGps,
  go,
}) {
  if (addressLoading) {
    return (
      <div className="dga-card p-4 flex items-center gap-3 text-xs text-[#6C737F]">
        <span className="w-4 h-4 border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin shrink-0" />
        <span>جارٍ تحميل عنوانك الافتراضي لحساب المسافة إلى أقرب مخزون…</span>
      </div>
    )
  }

  return (
    <section
      aria-label="موقع حساب المسافة"
      className="dga-card border-s-4 border-s-[#1B8354] p-4 sm:p-5 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
            <Icons.MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-[#1F2A37]">
                {locationSource === 'gps'
                  ? 'موقعك الحالي (GPS)'
                  : selectedAddress
                    ? selectedAddress.title || 'عنوان محفوظ'
                    : 'لم يتم تحديد عنوان افتراضي'}
              </h2>

              {locationSource === 'default-address' && (
                <span className="rounded-full bg-[#F3FCF6] border border-[#B8EACB] px-2.5 py-0.5 text-[11px] font-semibold text-[#067647]">
                  العنوان الافتراضي
                </span>
              )}
              {locationSource === 'gps' && (
                <span className="rounded-full bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-0.5 text-[11px] font-semibold text-[#067647]">
                  تحديد تلقائي
                </span>
              )}
            </div>

            {locationSource === 'gps' && activeCoords ? (
              <p className="text-xs text-[#6C737F]">
                يتم ترتيب المخزون من الأقرب إلى موقعك الحالي وحساب المسافة بالكيلومتر.{' '}
                <span className="font-mono text-[#384250]" dir="ltr">
                  ({activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)})
                </span>
              </p>
            ) : selectedAddress ? (
              <p className="text-xs text-[#6C737F] leading-relaxed break-words">
                {selectedAddress.description || 'يتم ترتيب المخزون حسب الأقرب لهذا العنوان وحساب المسافة بالكيلومتر.'}
              </p>
            ) : (
              <p className="text-xs text-[#6C737F] leading-relaxed">
                {isConsumer
                  ? 'أضف عنواناً افتراضياً من صفحة «عناويني» أو استخدم موقعك الحالي لترتيب المخزون حسب الأقرب وعرض المسافة بالكيلومتر.'
                  : 'استخدم موقعك الحالي (GPS) لترتيب المخزون حسب الأقرب وعرض المسافة بالكيلومتر، أو تصفّح جميع المخازن حسب الأحدث.'}
              </p>
            )}
          </div>
        </div>

        {/* أزرار التحكم بالموقع */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {locationSource === 'gps' ? (
            <SecondaryBtn onClick={onClearGps} className="text-xs px-3 min-h-[38px]">
              {selectedAddress ? 'العودة للعنوان المحفوظ' : 'إلغاء الموقع الحالي'}
            </SecondaryBtn>
          ) : (
            <SecondaryBtn onClick={onRequestGps} disabled={gpsLoading} className="text-xs px-3 min-h-[38px]">
              <span className="inline-flex items-center gap-1.5">
                <Icons.Navigation className="w-3.5 h-3.5 text-[#1B8354]" />
                <span>{gpsLoading ? 'جارٍ التحديد…' : 'موقعي الحالي'}</span>
              </span>
            </SecondaryBtn>
          )}

          {isConsumer && (
            <button
              type="button"
              onClick={() => go(ROUTES.CITIZEN_ADDRESSES)}
              className="min-h-[38px] px-3 rounded-[4px] border border-[#B8EACB] bg-[#F3FCF6] hover:bg-[#DCFAE6] text-[#074D31] text-xs font-semibold dga-btn-motion cursor-pointer"
            >
              {addresses.length > 0 ? 'إدارة عناويني' : 'إضافة عنوان افتراضي'}
            </button>
          )}
        </div>
      </div>

      {/* تبديل سريع بين العناوين المحفوظة إذا وجد أكثر من عنوان */}
      {isConsumer && addresses.length > 1 && (
        <div className="pt-2.5 border-t border-[#E5E7EB] flex flex-wrap items-center gap-2">
          <label htmlFor="active-address-select" className="text-xs font-medium text-[#384250]">
            حساب المسافة من:
          </label>
          <select
            id="active-address-select"
            value={locationSource === 'gps' ? '' : selectedAddress?.id || ''}
            onChange={(e) => onSelectAddress(e.target.value)}
            className="text-xs font-medium bg-white border border-[#9DA4AE] rounded-[4px] px-3 py-1.5 text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#1B8354]/15 focus:border-[#1B8354]"
          >
            {locationSource === 'gps' && <option value="">الموقع الحالي (GPS)</option>}
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.title || 'عنوان محفوظ'}
                {addr.is_default ? ' (الافتراضي)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {gpsErr && (
        <p className="text-xs text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-[8px] px-3.5 py-2.5 fade-in">
          {gpsErr}
        </p>
      )}
    </section>
  )
}
