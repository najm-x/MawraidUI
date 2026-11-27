// ═══════════ نافذة سفلية (Bottom Sheet) لإنشاء طلب جديد من المخزون — DGA Design System ═══════════
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { addressesApi, ordersApi } from '../../../services/api'
import { ErrorBanner, Icons, Label, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import {
  CONSUMER_TYPE_OPTIONS,
  formatOrderAmount,
  formatOrderPrice,
  getEnabledConsumerTypes,
  getUnitAvailableAmount,
  isSessionExpiredError,
  validateCreateOrder,
} from '../utils'

const CONSUMER_TYPE_ICONS = {
  home: Icons.Home,
  business: Icons.Business,
  driver: Icons.Driver,
}

export default function CreateOrderSheet({
  open,
  stock,
  initialUnitId,
  defaultAddress,
  onClose,
  onSuccess,
  onManageAddresses,
  onSessionExpired,
}) {
  const { user } = useAuth()

  const units = useMemo(() => (Array.isArray(stock?.units) ? stock.units : []), [stock])
  const mainUnit = useMemo(() => units.find((u) => u.is_main) || units[0] || null, [units])
  const enabledTypes = useMemo(() => getEnabledConsumerTypes(user), [user])

  const [unitId, setUnitId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [consumerType, setConsumerType] = useState('home')
  const [addressId, setAddressId] = useState('')
  const [notes, setNotes] = useState('')

  const [addressesState, setAddressesState] = useState({
    loading: false,
    list: [],
    err: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)

  const loadAddresses = useCallback(async () => {
    setAddressesState((prev) => ({ ...prev, loading: true, err: null }))
    try {
      const list = await addressesApi.listMine()
      setAddressesState({ loading: false, list, err: null })
      setAddressId((prevId) => {
        if (prevId && list.some((a) => a.id === prevId)) return prevId
        const preferred =
          list.find((a) => a.id === defaultAddress?.id) ||
          list.find((a) => a.is_default) ||
          list[0]
        return preferred?.id || ''
      })
    } catch (e) {
      if (isSessionExpiredError(e)) {
        onSessionExpired?.()
        return
      }
      setAddressesState({ loading: false, list: [], err: e })
    }
  }, [defaultAddress?.id, onSessionExpired])

  useEffect(() => {
    if (!open || !stock) return

    const preferredUnit =
      units.find((u) => Number(u.id) === Number(initialUnitId) && getUnitAvailableAmount(stock, u) > 0) ||
      units.find((u) => u.is_main && getUnitAvailableAmount(stock, u) > 0) ||
      units.find((u) => getUnitAvailableAmount(stock, u) > 0) ||
      mainUnit

    setUnitId(preferredUnit ? String(preferredUnit.id) : '')
    setQuantity(1)
    setConsumerType(enabledTypes[0] || 'home')
    setNotes('')
    setErr(null)
    loadAddresses()
  }, [open, stock, initialUnitId, units, mainUnit, enabledTypes, loadAddresses])

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

  if (!open || !stock) return null

  const selectedUnit = units.find((u) => Number(u.id) === Number(unitId)) || null
  const maxAvailable = selectedUnit ? getUnitAvailableAmount(stock, selectedUnit) : 0
  const numericQty = Math.max(0, Math.floor(Number(quantity) || 0))
  const estimatedTotal = selectedUnit ? numericQty * (Number(selectedUnit.price) || 0) : 0
  const reservedBaseUnits = selectedUnit ? numericQty * (Number(selectedUnit.rate) || 1) : 0

  function handleSelectUnit(u) {
    const avail = getUnitAvailableAmount(stock, u)
    if (avail <= 0) return
    setUnitId(String(u.id))
    setQuantity((prev) => {
      const cur = Math.max(1, Math.floor(Number(prev) || 1))
      return Math.min(cur, avail)
    })
    setErr(null)
  }

  function stepQuantity(delta) {
    setErr(null)
    setQuantity((prev) => {
      const cur = Math.floor(Number(prev) || 0)
      const next = cur + delta
      if (maxAvailable > 0) return Math.min(Math.max(1, next), maxAvailable)
      return Math.max(1, next)
    })
  }

  function handleQuantityInput(val) {
    setErr(null)
    if (val === '') {
      setQuantity('')
      return
    }
    const digits = String(val).replace(/\D/g, '')
    if (!digits) {
      setQuantity('')
      return
    }
    const num = parseInt(digits, 10)
    if (maxAvailable > 0 && num > maxAvailable) {
      setQuantity(maxAvailable)
    } else {
      setQuantity(num)
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setErr(null)

    const validationErr = validateCreateOrder({
      stockId: stock.id,
      unitId,
      quantity,
      maxAvailable,
      addressId,
      consumerType,
      notes,
    })
    if (validationErr) {
      setErr(validationErr)
      return
    }

    const payload = {
      stock_id: stock.id,
      unit_id: Number(unitId),
      quantity: Number(quantity),
      address_id: addressId,
      consumer_type: consumerType,
    }
    const trimmedNotes = notes.trim()
    if (trimmedNotes) {
      payload.notes = trimmedNotes
    }

    setSubmitting(true)
    try {
      const createdOrder = await ordersApi.createOrder(payload)
      onSuccess?.(createdOrder)
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
      aria-labelledby="create-order-sheet-title"
    >
      {/* خلفية معتمة */}
      <div
        className="fixed inset-0 bg-[#0D121C]/50 backdrop-blur-[2px] dga-backdrop-in"
        onClick={() => !submitting && onClose?.()}
        aria-hidden="true"
      />

      {/* حاوية النافذة السفلية (DGA Modal / Sheet) */}
      <div className="sheet-up relative z-10 w-full max-w-2xl bg-white rounded-t-[16px] border-t border-x border-[#D2D6DB] shadow-dga-lg max-h-[92vh] flex flex-col overflow-hidden text-right">
        {/* مقبض علوي وشريط العنوان */}
        <div className="px-5 sm:px-6 pt-3 pb-4 border-b border-[#E5E7EB] shrink-0">
          <div className="w-12 h-1 rounded-full bg-[#D2D6DB] mx-auto mb-3" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31] text-[11px] font-semibold mb-1.5">
                <Icons.ShoppingBag className="w-3.5 h-3.5 text-[#1B8354]" />
                <span>حجز وطلب مباشر</span>
              </div>
              <h2 id="create-order-sheet-title" className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">
                إنشاء طلب جديد — {stock.type?.name || 'مخزون'}
              </h2>
              <p className="text-xs text-[#6C737F] truncate mt-0.5">
                {stock.address || 'سيتم حجز الكمية من المخزون فوراً عند التأكيد'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => !submitting && onClose?.()}
              disabled={submitting}
              aria-label="إغلاق نافذة الطلب"
              className="w-8 h-8 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] flex items-center justify-center dga-btn-motion cursor-pointer disabled:opacity-50"
            >
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* نموذج بيانات الطلب القابل للتمرير */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-5">
          <ErrorBanner err={err} />

          {/* 1) اختيار الوحدة */}
          <div>
            <Label req>اختر الوحدة المطلوبة</Label>
            {units.length === 0 ? (
              <p className="text-xs text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-[8px] p-3">
                لا توجد وحدات متاحة في هذا المخزون حالياً.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {units.map((u) => {
                  const unitAvail = getUnitAvailableAmount(stock, u)
                  const isSelected = Number(unitId) === Number(u.id)
                  const outOfStock = unitAvail <= 0

                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => handleSelectUnit(u)}
                      className={`rounded-[8px] border p-3.5 text-right transition-colors duration-150 flex flex-col justify-between gap-2 ${
                        outOfStock
                          ? 'border-[#E5E7EB] bg-[#F3F4F6] opacity-55 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#1B8354] bg-[#F3FCF6] ring-1 ring-[#1B8354] cursor-pointer'
                          : 'border-[#D2D6DB] bg-white hover:border-[#1B8354] cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-sm text-[#1F2A37] truncate">{u.name}</span>
                          {u.is_main && (
                            <span className="px-2 py-0.5 rounded-[4px] bg-white border border-[#B8EACB] text-[#074D31] text-[10px] font-semibold shrink-0">
                              رئيسية
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-bold text-[#074D31] shrink-0">
                          <span className="font-mono" dir="ltr">{formatOrderPrice(u.price)}</span>{' '}
                          <span className="text-[11px] font-normal text-[#6C737F]">ريال</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#6C737F] pt-1.5 border-t border-[#E5E7EB] w-full">
                        <span>
                          المتوفر:{' '}
                          <strong className={`font-mono ${outOfStock ? 'text-[#B42318]' : 'text-[#1F2A37]'}`} dir="ltr">
                            {formatOrderAmount(unitAvail)}
                          </strong>
                        </span>
                        {!u.is_main && mainUnit && (
                          <span>
                            يعادل <strong className="font-mono" dir="ltr">{formatOrderAmount(u.rate)}</strong> {mainUnit.name}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 2) تحديد الكمية */}
          <div>
            <div className="flex items-center justify-between">
              <Label req htmlFor="order-qty-input">الكمية المطلوبة</Label>
              {selectedUnit && (
                <span className="text-xs text-[#6C737F]">
                  الحد الأقصى المتاح: <span className="font-mono font-semibold text-[#1F2A37]" dir="ltr">{formatOrderAmount(maxAvailable)}</span> {selectedUnit.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => stepQuantity(-1)}
                disabled={numericQty <= 1 || submitting}
                aria-label="إنقاص الكمية"
                className="w-11 h-11 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] flex items-center justify-center dga-btn-motion cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Icons.Minus className="w-4 h-4" />
              </button>

              <input
                id="order-qty-input"
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={quantity}
                onChange={(e) => handleQuantityInput(e.target.value)}
                className="flex-1 min-h-[44px] rounded-[4px] border border-[#9DA4AE] bg-white px-4 text-center font-mono text-lg font-bold text-[#161616] outline-none focus:border-[#1B8354] focus:ring-2 focus:ring-[#1B8354]/15"
              />

              <button
                type="button"
                onClick={() => stepQuantity(1)}
                disabled={(maxAvailable > 0 && numericQty >= maxAvailable) || submitting}
                aria-label="زيادة الكمية"
                className="w-11 h-11 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] flex items-center justify-center dga-btn-motion cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedUnit && !selectedUnit.is_main && mainUnit && numericQty > 0 && (
              <p className="text-xs text-[#6C737F] mt-1.5">
                سيتم حجز <strong className="font-mono text-[#1F2A37]" dir="ltr">{formatOrderAmount(reservedBaseUnits)}</strong> {mainUnit.name} من رصيد المخزون.
              </p>
            )}
          </div>

          {/* 3) صفة المستفيد */}
          <div>
            <Label req>صفة المستفيد للطلب</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {CONSUMER_TYPE_OPTIONS.map((opt) => {
                const Icon = CONSUMER_TYPE_ICONS[opt.value] || Icons.User
                const isSelected = consumerType === opt.value
                const isEnabled = enabledTypes.includes(opt.value)

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isEnabled}
                    onClick={() => {
                      setConsumerType(opt.value)
                      setErr(null)
                    }}
                    className={`rounded-[8px] border p-3 text-right transition-colors duration-150 flex items-center gap-2.5 ${
                      !isEnabled
                        ? 'border-[#E5E7EB] bg-[#F3F4F6] opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#1B8354] bg-[#F3FCF6] ring-1 ring-[#1B8354] cursor-pointer'
                        : 'border-[#D2D6DB] bg-white hover:border-[#1B8354] cursor-pointer'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-[4px] flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#1B8354] text-white' : 'bg-[#F3F4F6] text-[#384250]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1F2A37] truncate">{opt.label}</div>
                      <div className="text-[10px] text-[#6C737F] truncate">{opt.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4) عنوان التوصيل المحفوظ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#161616]">
                عنوان الاستلام / التوصيل <span className="text-[#B42318] font-semibold">*</span>
              </label>
              {onManageAddresses && (
                <button
                  type="button"
                  onClick={onManageAddresses}
                  className="text-xs font-semibold text-[#1B8354] hover:underline cursor-pointer"
                >
                  إدارة العناوين
                </button>
              )}
            </div>

            {addressesState.loading ? (
              <div className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 flex items-center gap-2.5 text-xs font-medium text-[#6C737F]">
                <Icons.Refresh className="w-4 h-4 animate-spin text-[#1B8354]" />
                <span>جارٍ تحميل عناوينك المحفوظة…</span>
              </div>
            ) : addressesState.err ? (
              <div className="rounded-[8px] border border-[#FECDCA] bg-[#FEF3F2] p-3.5 space-y-2">
                <ErrorBanner err={addressesState.err} />
                <SecondaryBtn onClick={loadAddresses} className="w-full text-xs">
                  إعادة تحميل العناوين
                </SecondaryBtn>
              </div>
            ) : addressesState.list.length === 0 ? (
              <div className="dga-callout-warning p-4 space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-[#1F2A37]">
                  <Icons.MapPin className="w-4 h-4 text-[#B54708] shrink-0 mt-0.5" />
                  <p className="font-medium leading-6">
                    لا يوجد لديك عنوان محفوظ حتى الآن. يجب إضافة عنوان واحد على الأقل لإتمام الطلب.
                  </p>
                </div>
                {onManageAddresses && (
                  <SecondaryBtn onClick={onManageAddresses} className="w-full text-xs">
                    إضافة عنوان جديد الآن
                  </SecondaryBtn>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                {addressesState.list.map((addr) => {
                  const isSelected = addressId === addr.id
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setAddressId(addr.id)
                        setErr(null)
                      }}
                      className={`w-full rounded-[8px] border p-3 text-right transition-colors duration-150 flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#1B8354] bg-[#F3FCF6] ring-1 ring-[#1B8354]'
                          : 'border-[#D2D6DB] bg-white hover:border-[#1B8354]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icons.MapPin
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSelected ? 'text-[#1B8354]' : 'text-[#9DA4AE]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1F2A37] truncate">
                              {addr.title || 'عنوان محفوظ'}
                            </span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] text-[10px] font-semibold shrink-0">
                                افتراضي
                              </span>
                            )}
                          </div>
                          {addr.description && (
                            <p className="text-[11px] text-[#6C737F] truncate mt-0.5">{addr.description}</p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#1B8354] border-[#1B8354] text-white'
                            : 'border-[#6C737F] bg-white'
                        }`}
                      >
                        {isSelected && <Icons.Check className="w-3 h-3" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* 5) ملاحظات إضافية (اختياري) */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-notes">ملاحظات للمزود (اختياري)</Label>
              <span className="text-[11px] font-mono text-[#6C737F]" dir="ltr">
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="order-notes"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يرجى الاتصال عند الوصول أو تحديد معلم قريب..."
              className="w-full rounded-[4px] border border-[#9DA4AE] bg-white p-3 text-xs text-[#161616] placeholder:text-[#6C737F] outline-none transition-colors duration-150 focus:border-[#1B8354] focus:ring-2 focus:ring-[#1B8354]/15"
            />
          </div>
        </form>

        {/* شريط الملخص المالي وزر التأكيد السفلي */}
        <div className="px-5 sm:px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#6C737F]">الإجمالي المستحق</div>
              <div className="text-xl font-bold text-[#074D31]">
                <span className="font-mono" dir="ltr">{formatOrderPrice(estimatedTotal)}</span>{' '}
                <span className="text-xs font-normal text-[#6C737F]">ريال</span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-white border border-[#E5E7EB] text-xs font-medium text-[#384250]">
              <Icons.Check className="w-3.5 h-3.5 text-[#067647]" />
              <span>الدفع نقداً عند الاستلام</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <PrimaryBtn
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              disabled={
                submitting ||
                !selectedUnit ||
                maxAvailable <= 0 ||
                numericQty <= 0 ||
                addressesState.loading ||
                addressesState.list.length === 0 ||
                !addressId
              }
              className="!mt-0 flex-1"
            >
              <Icons.ShoppingBag className="w-4 h-4" />
              <span>تأكيد وإنشاء الطلب</span>
            </PrimaryBtn>

            <SecondaryBtn
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[46px]"
            >
              إلغاء
            </SecondaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
