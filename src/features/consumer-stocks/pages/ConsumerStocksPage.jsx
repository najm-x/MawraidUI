// ═══════════ شاشة استكشاف المخزون المتاح للمستفيدين — DGA Design System ═══════════
import { useAuth } from '../../auth/hooks/useAuth'
import { BackBtn, ErrorBanner, Icons, SecondaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import { formatAmount } from '../utils/format'
import { useConsumerStocks } from '../hooks/useConsumerStocks'
import AddressLocationBar from '../components/AddressLocationBar'
import StockFilters from '../components/StockFilters'
import ConsumerStockCard from '../components/ConsumerStockCard'

export default function ConsumerStocksPage({ go, onSessionExpired }) {
  const { user } = useAuth()
  const isConsumer = user?.role_name === 'consumer'

  const {
    addressLoading,
    defaultAddress,
    addresses,
    selectedAddress,
    activeCoords,
    locationSource,
    gpsLoading,
    gpsErr,
    selectAddress,
    requestGpsLocation,
    clearGpsLocation,

    stockTypes,
    searchInput,
    setSearchInput,
    submitSearchNow,
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,

    stocks,
    meta,
    page,
    setPage,
    loading,
    err,
    reload,
  } = useConsumerStocks({ isConsumer, onSessionExpired })

  const totalPages = Math.max(1, Number(meta?.total_pages) || 1)
  const total = meta?.total

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn onClick={() => go(ROUTES.DASHBOARD)} label="لوحة التحكم" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">
                استكشاف المخزون المتاح
              </h1>
              <p className="text-xs text-[#6C737F] truncate">
                {activeCoords
                  ? 'مرتّب حسب الأقرب إلى موقعك مع حساب المسافة بالكيلومتر'
                  : 'مرتّب حسب الأحدث — حدد عنواناً افتراضياً للترتيب حسب الأقرب'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
            aria-label="تحديث القائمة"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {/* 1) شريط العنوان الافتراضي / الموقع */}
        <AddressLocationBar
          isConsumer={isConsumer}
          addressLoading={addressLoading}
          defaultAddress={defaultAddress}
          addresses={addresses}
          selectedAddress={selectedAddress}
          locationSource={locationSource}
          activeCoords={activeCoords}
          gpsLoading={gpsLoading}
          gpsErr={gpsErr}
          onSelectAddress={selectAddress}
          onRequestGps={requestGpsLocation}
          onClearGps={clearGpsLocation}
          go={go}
        />

        {/* 2) لوحة البحث والفلاتر */}
        <StockFilters
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={submitSearchNow}
          stockTypes={stockTypes}
          filters={filters}
          onUpdateFilter={updateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          hasLocation={Boolean(activeCoords)}
        />

        {/* 3) ملخص النتائج */}
        {!loading && !err && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6C737F] px-1">
            <span>
              {total !== undefined && total !== null
                ? `إجمالي النتائج: ${formatAmount(total)} مخزون`
                : `عدد النتائج المعروضة: ${formatAmount(stocks.length)}`}
            </span>
            {activeCoords && (
              <span className="inline-flex items-center gap-1 text-[#1B8354] font-semibold">
                <Icons.MapPin className="w-3.5 h-3.5" />
                <span>الأقرب أولاً</span>
              </span>
            )}
          </div>
        )}

        {/* 4) حالات التحميل / الخطأ / فارغ / النتائج */}
        {loading ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-8 h-8 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#6C737F]">جارٍ البحث عن المخزون المتاح…</p>
          </div>
        ) : err ? (
          <div className="dga-card p-6 space-y-4 fade-in">
            <ErrorBanner err={err} />
            <SecondaryBtn onClick={reload}>إعادة المحاولة</SecondaryBtn>
          </div>
        ) : stocks.length === 0 ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3F4F6] text-[#6C737F] flex items-center justify-center">
              <Icons.Box className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-[#1F2A37]">لا توجد مخازن مطابقة حالياً</h2>
            <p className="text-xs text-[#6C737F] max-w-md mx-auto leading-6">
              {hasActiveFilters
                ? 'جرّب توسيع نطاق المسافة أو تغيير فلاتر البحث والتوفر لعرض مزيد من النتائج.'
                : 'لا توجد مخازن متاحة للعرض في الوقت الحالي. حاول التحديث لاحقاً.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-1">
                <SecondaryBtn onClick={resetFilters}>مسح الفلاتر</SecondaryBtn>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dga-stagger">
            {stocks.map((stock) => (
              <ConsumerStockCard
                key={stock.id}
                stock={stock}
                onSelect={(selected) => go(ROUTES.CONSUMER_STOCK_DETAILS, { stockId: selected.id })}
              />
            ))}
          </div>
        )}

        {/* 5) الترقيم */}
        {!loading && !err && (stocks.length > 0 || page > 1) && (
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
                <div className="text-[11px] text-[#6C737F]">{formatAmount(total)} مخزون</div>
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
    </div>
  )
}
