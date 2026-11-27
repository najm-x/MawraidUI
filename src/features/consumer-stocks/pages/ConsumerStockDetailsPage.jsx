// ═══════════ شاشة تفاصيل المخزون للمستفيد مع الموقع على الخريطة وزر إنشاء الطلب — DGA Design System ═══════════
import { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { BackBtn, ErrorBanner, Icons, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import LocationPicker from '../../../shared/components/ui/LocationPicker'
import { ROUTES } from '../../../shared/constants/routes'
import { useConsumerStockDetails } from '../hooks/useConsumerStockDetails'
import { formatAmount, formatDateTime, formatGazStockType, formatPrice } from '../utils/format'
import { isValidCoords } from '../utils/geo'
import { StockTypeIcon } from '../components/ConsumerStockCard'
import CreateOrderSheet from '../../orders/components/CreateOrderSheet'

export default function ConsumerStockDetailsPage({
  go,
  stockId,
  showToast,
  onSessionExpired,
  onCreateOrder,
}) {
  const { user } = useAuth()
  const isConsumer = user?.role_name === 'consumer'
  const [orderSheet, setOrderSheet] = useState({ open: false, unitId: null })
  const [createdOrder, setCreatedOrder] = useState(null)

  const {
    stock,
    defaultAddress,
    distanceKm,
    distanceFormatted,
    loading,
    err,
    reload,
  } = useConsumerStockDetails(stockId, { isConsumer, onSessionExpired })

  const isAvailable = Number(stock?.available) > 0
  const units = Array.isArray(stock?.units) ? stock.units : []
  const balances = Array.isArray(stock?.balances) ? stock.balances : []
  const mainUnit = units.find((u) => u.is_main) || units[0]
  const gazTypeLabel = formatGazStockType(stock?.stock_details?.gaz_stock_type)

  const pendingOrders = Number(stock?.pending_orders) || 0
  const completedOrders = Number(stock?.completed_orders) || 0
  const totalOrders = pendingOrders + completedOrders

  const hasValidLocation = isValidCoords(stock?.location)

  function handleCreateOrder(preselectedUnitId = null) {
    if (!stock || !isAvailable || !isConsumer) return
    if (typeof onCreateOrder === 'function') {
      onCreateOrder(stock, preselectedUnitId)
      return
    }
    setOrderSheet({ open: true, unitId: preselectedUnitId })
  }

  function handleOrderCreated(order) {
    setOrderSheet({ open: false, unitId: null })
    setCreatedOrder(order)
    showToast?.(`تم إنشاء الطلب بنجاح (${order.order_number})`, true)
    reload()
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      {/* ── الترويسة ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BackBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)} label="قائمة المخزون" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">
                {stock?.type?.name || 'تفاصيل المخزون'}
              </h1>
              <p className="text-xs text-[#6C737F] truncate">
                {stock?.address || 'معلومات المخزون، الأسعار، الموقع وحالة الطلبات'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reload}
            disabled={loading}
            aria-label="تحديث بيانات المخزون"
            className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion cursor-pointer disabled:opacity-50"
          >
            <Icons.Refresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      {/* ── المحتوى ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-5 text-right">
        {loading ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <div className="w-8 h-8 mx-auto border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#6C737F]">جارٍ تحميل تفاصيل المخزون…</p>
          </div>
        ) : err ? (
          <div className="dga-card p-6 space-y-4 fade-in">
            <ErrorBanner err={err} />
            <div className="flex flex-wrap gap-2">
              <SecondaryBtn onClick={reload}>إعادة المحاولة</SecondaryBtn>
              <SecondaryBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)}>العودة لقائمة المخزون</SecondaryBtn>
            </div>
          </div>
        ) : !stock ? (
          <div className="dga-card p-10 text-center space-y-3 fade-in">
            <p className="text-sm font-medium text-[#6C737F]">لم يتم العثور على بيانات هذا المخزون.</p>
            <SecondaryBtn onClick={() => go(ROUTES.CONSUMER_STOCKS)}>العودة لقائمة المخزون</SecondaryBtn>
          </div>
        ) : (
          <>
            {/* شريط تأكيد الطلب المنشأ حديثاً (DGA Inline Alert Success) */}
            {createdOrder && (
              <section className="rounded-[8px] border border-[#ABEFC6] border-s-4 border-s-[#067647] bg-[#ECFDF3] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-[4px] bg-[#067647] text-white flex items-center justify-center shrink-0">
                    <Icons.Check className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-bold text-[#1F2A37]">
                      تم حجز طلبك بنجاح — <span className="font-mono" dir="ltr">{createdOrder.order_number}</span>
                    </h2>
                    <p className="text-xs text-[#384250]">
                      الكمية: <strong className="font-mono" dir="ltr">{formatAmount(createdOrder.quantity)}</strong> {createdOrder.unit_name} • الإجمالي:{' '}
                      <strong className="font-mono" dir="ltr">{formatPrice(createdOrder.total_price)}</strong> ريال
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      go(ROUTES.CONSUMER_ORDER_DETAILS, {
                        orderId: createdOrder.id,
                        backTo: ROUTES.CONSUMER_STOCK_DETAILS,
                        backParams: { stockId: stock.id },
                      })
                    }
                    className="min-h-[38px] px-3.5 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-xs font-medium dga-btn-motion cursor-pointer"
                  >
                    عرض تفاصيل الطلب
                  </button>
                  <button
                    type="button"
                    onClick={() => go(ROUTES.CONSUMER_ORDERS)}
                    className="min-h-[38px] px-3 rounded-[4px] border border-[#ABEFC6] bg-white hover:bg-[#F3FCF6] text-[#067647] text-xs font-medium dga-btn-motion cursor-pointer"
                  >
                    كل طلباتي
                  </button>
                </div>
              </section>
            )}

            {/* 1) بطاقة الملخص الرئيسية + زر إنشاء الطلب */}
            <section className="dga-card p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-semibold text-[#1F2A37]">
                      <StockTypeIcon slug={stock.type?.slug} />
                      <span>{stock.type?.name || 'مخزون'}</span>
                    </span>

                    {gazTypeLabel && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#FFFAEB] border border-[#FEDF89] text-[11px] font-semibold text-[#B54708]">
                        {gazTypeLabel}
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

                  <h2 className="text-xl sm:text-2xl font-bold text-[#1F2A37]">
                    {stock.type?.name || 'مخزون'}
                  </h2>

                  <div className="flex items-start gap-2 text-sm text-[#6C737F]">
                    <Icons.MapPin className="w-4 h-4 text-[#1B8354] shrink-0 mt-0.5" />
                    <span className="font-medium text-[#384250] leading-6 break-words">
                      {stock.address || 'عنوان غير محدد'}
                    </span>
                  </div>
                </div>

                {/* شارة المسافة من العنوان الافتراضي */}
                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                  {distanceKm !== null ? (
                    <div
                      className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31]"
                      title={`المسافة التقريبية: ${distanceKm} كم`}
                    >
                      <Icons.Navigation className="w-4 h-4 text-[#1B8354] shrink-0" />
                      <div className="text-right">
                        <div className="text-sm font-bold">{distanceFormatted}</div>
                        <div className="text-[11px] text-[#1B8354] font-mono" dir="ltr">
                          {distanceKm.toFixed(1)} km
                        </div>
                      </div>
                    </div>
                  ) : isConsumer ? (
                    <button
                      type="button"
                      onClick={() => go(ROUTES.CITIZEN_ADDRESSES)}
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#B8EACB] bg-[#F3FCF6] hover:bg-[#DCFAE6] text-[#074D31] text-xs font-semibold dga-btn-motion cursor-pointer"
                    >
                      <Icons.MapPin className="w-3.5 h-3.5" />
                      <span>أضف عنواناً افتراضياً لحساب المسافة</span>
                    </button>
                  ) : null}

                  {defaultAddress && distanceKm !== null && (
                    <span className="text-[11px] text-[#6C737F]">
                      من عنوانك الافتراضي: <strong className="text-[#1F2A37]">{defaultAddress.title || 'العنوان الافتراضي'}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* الكمية المتوفرة + زر إنشاء الطلب */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="rounded-[8px] bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[4px] bg-white border border-[#E5E7EB] flex items-center justify-center text-[#1B8354] shrink-0">
                    <Icons.Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#6C737F]">الكمية المتوفرة</div>
                    <div className={`text-xl font-bold ${isAvailable ? 'text-[#067647]' : 'text-[#B42318]'}`}>
                      <span className="font-mono" dir="ltr">{formatAmount(stock.available)}</span>{' '}
                      <span className="text-sm font-medium">{mainUnit?.name || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:min-w-[260px]">
                  {isConsumer && (
                    <SecondaryBtn
                      type="button"
                      onClick={() =>
                        go(ROUTES.CONSUMER_ORDERS, {
                          stockId: stock.id,
                          stockName: stock.type?.name || '',
                        })
                      }
                      className="min-h-[46px] flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Icons.FileText className="w-4 h-4 text-[#1B8354]" />
                      <span>طلباتي هنا</span>
                    </SecondaryBtn>
                  )}

                  <PrimaryBtn
                    type="button"
                    onClick={() => handleCreateOrder(null)}
                    disabled={!isAvailable || !isConsumer}
                    className="!mt-0 flex-1 sm:min-w-[190px]"
                  >
                    <Icons.Plus className="w-4 h-4" />
                    <span>
                      {!isConsumer
                        ? 'متاح لحسابات المستفيدين فقط'
                        : isAvailable
                        ? 'إنشاء طلب جديد'
                        : 'غير متاح للطلب حالياً'}
                    </span>
                  </PrimaryBtn>
                </div>
              </div>
            </section>

            {/* 2) إحصائيات الطلبات */}
            <section aria-label="إحصائيات الطلبات" className="grid grid-cols-1 sm:grid-cols-3 gap-4 dga-stagger">
              <div className="dga-card border-s-4 border-s-[#DBA102] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6C737F]">الطلبات قيد الانتظار</p>
                  <p className="mt-1 text-2xl font-bold text-[#B54708] font-mono" dir="ltr">
                    {formatAmount(pendingOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center shrink-0">
                  <Icons.Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="dga-card border-s-4 border-s-[#067647] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6C737F]">الطلبات المكتملة</p>
                  <p className="mt-1 text-2xl font-bold text-[#067647] font-mono" dir="ltr">
                    {formatAmount(completedOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[8px] bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647] flex items-center justify-center shrink-0">
                  <Icons.Check className="w-5 h-5" />
                </div>
              </div>

              <div className="dga-card border-s-4 border-s-[#1B8354] p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#6C737F]">إجمالي الطلبات</p>
                  <p className="mt-1 text-2xl font-bold text-[#1F2A37] font-mono" dir="ltr">
                    {formatAmount(totalOrders)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
                  <Icons.FileText className="w-5 h-5" />
                </div>
              </div>
            </section>

            {/* 3) الوحدات المتاحة والأسعار */}
            <section className="dga-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-[#1F2A37]">الوحدات المتاحة والأسعار</h2>
                <span className="text-xs text-[#6C737F] font-medium">
                  {formatAmount(units.length)} وحدة
                </span>
              </div>

              {units.length === 0 ? (
                <p className="text-xs text-[#6C737F]">لا توجد وحدات مسجلة لهذا المخزون حالياً.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 dga-stagger">
                  {units.map((unit) => {
                    const balanceObj = balances.find((b) => b.unit_id === unit.id || b.unit === unit.name)
                    const unitAmount =
                      balanceObj?.amount ??
                      (unit.rate > 0 ? Math.floor((Number(stock.available) || 0) / unit.rate) : 0)

                    return (
                      <div
                        key={unit.id}
                        className={`rounded-[8px] border p-4 space-y-2.5 ${
                          unit.is_main
                            ? 'border-[#B8EACB] bg-[#F3FCF6]/70'
                            : 'border-[#E5E7EB] bg-[#F9FAFB]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-sm text-[#1F2A37] truncate">{unit.name}</span>
                            {unit.is_main && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-white border border-[#B8EACB] text-[#074D31] text-[10px] font-semibold shrink-0">
                                رئيسية
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-[#074D31] shrink-0">
                            <span className="font-mono" dir="ltr">{formatPrice(unit.price)}</span>{' '}
                            <span className="text-xs font-normal text-[#6C737F]">ريال</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#6C737F] pt-2 border-t border-[#E5E7EB]">
                          <span>
                            المتوفر:{' '}
                            <strong className="font-mono text-[#1F2A37]" dir="ltr">
                              {formatAmount(unitAmount)}
                            </strong>{' '}
                            {unit.name}
                          </span>
                          {!unit.is_main && mainUnit && (
                            <span className="text-[#6C737F]">
                              المعامل: <strong className="font-mono" dir="ltr">{formatAmount(unit.rate)}</strong> {mainUnit.name}
                            </span>
                          )}
                        </div>

                        {isConsumer && unitAmount > 0 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => handleCreateOrder(unit.id)}
                              className="w-full min-h-[38px] px-3 rounded-[4px] bg-white hover:bg-[#1B8354] border border-[#D2D6DB] hover:border-[#1B8354] text-[#161616] hover:text-white text-xs font-medium dga-btn-motion flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Icons.ShoppingBag className="w-3.5 h-3.5" />
                              <span>طلب {unit.name}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 4) العنوان والموقع على الخريطة */}
            <section className="dga-card p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#1F2A37]">العنوان والموقع على الخريطة</h2>
                  <p className="text-sm text-[#6C737F] mt-1">{stock.address || 'عنوان غير محدد'}</p>
                </div>

                {hasValidLocation && (
                  <a
                    href={`https://www.google.com/maps?q=${stock.location.lat},${stock.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium dga-btn-motion self-start sm:self-center"
                  >
                    <Icons.MapPin className="w-3.5 h-3.5 text-[#1B8354]" />
                    <span>فتح في الخرائط</span>
                  </a>
                )}
              </div>

              {hasValidLocation ? (
                <>
                  <LocationPicker
                    lat={stock.location.lat}
                    lng={stock.location.lng}
                    readOnly
                    height={280}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6C737F]">
                    <span>
                      الإحداثيات:{' '}
                      <span className="font-mono text-[#1F2A37]" dir="ltr">
                        {stock.location.lat}, {stock.location.lng}
                      </span>
                    </span>
                    {distanceKm !== null && (
                      <span className="font-semibold text-[#1B8354]">
                        المسافة من عنوانك الافتراضي: {distanceFormatted} ({distanceKm.toFixed(1)} كم)
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center text-xs text-[#6C737F]">
                  لا تتوفر إحداثيات جغرافية لهذا المخزون لعرضها على الخريطة.
                </div>
              )}
            </section>

            {/* 5) تذييل التواريخ */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6C737F] px-1">
              <span className="inline-flex items-center gap-1">
                <Icons.Clock className="w-3.5 h-3.5 text-[#9DA4AE]" />
                <span>آخر تحديث: {formatDateTime(stock.updated_at)}</span>
              </span>
              {stock.created_at && (
                <span>تاريخ الإضافة: {formatDateTime(stock.created_at)}</span>
              )}
            </div>
          </>
        )}
      </main>

      {isConsumer && (
        <CreateOrderSheet
          open={orderSheet.open}
          stock={stock}
          initialUnitId={orderSheet.unitId}
          defaultAddress={defaultAddress}
          onClose={() => setOrderSheet({ open: false, unitId: null })}
          onSuccess={handleOrderCreated}
          onManageAddresses={() => go(ROUTES.CITIZEN_ADDRESSES)}
          onSessionExpired={onSessionExpired}
        />
      )}
    </div>
  )
}
