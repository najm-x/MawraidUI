// ═══════════ شاشة حركة مخزنية — إضافة كمية (وارد) أو سحب كمية (منصرف) — DGA Design System ═══════════
import { useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { ErrorBanner, Icons, InfoBanner, Label, PrimaryBtn, TextInput } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, isSessionExpired } from '../utils'
import { DESC_MAX, validateTransaction } from '../validation'

export default function StockTransactionPage({ go, showToast, stockId, direction }) {
  const { status, stock, err, reload } = useStock(stockId)
  const [unitId, setUnitId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [serverErr, setServerErr] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const redirectedRef = useRef(false)

  useEffect(() => {
    if (direction !== 'in' && direction !== 'out' && !redirectedRef.current) {
      redirectedRef.current = true
      go(ROUTES.STOCK_DASHBOARD, { stockId })
    }
  }, [direction, go, stockId])

  const isIn = direction === 'in'
  const units = Array.isArray(stock?.units) ? stock.units : []
  const selectedUnit = units.find((u) => String(u.id) === String(unitId))
  const selectedBalance = Array.isArray(stock?.balances)
    ? stock.balances.find((b) => String(b.unit_id) === String(unitId))
    : null

  const check = validateTransaction({ amount, unitId, description, units })
  const showErr = (msg) => (submitted && msg ? <p className="text-xs font-medium text-[#B42318] mt-1.5">{msg}</p> : null)

  async function submit(e) {
    if (e) e.preventDefault()
    setServerErr(null)
    setSessionExpired(false)
    setSubmitted(true)

    const result = validateTransaction({ amount, unitId, description, units })
    if (!result.valid) return
    if (submitting) return

    setSubmitting(true)
    try {
      const payload = {
        amount: Number(amount),
        unit_id: Number(unitId),
        is_in: isIn,
      }
      const desc = description.trim()
      if (desc) payload.description = desc

      await stockApi.createStockTransaction(stock.id, payload)
      showToast?.(isIn ? 'تمت إضافة الكمية بنجاح' : 'تم سحب الكمية بنجاح')
      go(ROUTES.STOCK_DASHBOARD, { stockId: stock.id })
    } catch (e2) {
      if (isSessionExpired(e2)) setSessionExpired(true)
      else setServerErr(e2)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        <StockLoading />
      </StockPage>
    )
  }
  if (status === 'error') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        {isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />}
      </StockPage>
    )
  }
  if (status === 'empty') {
    return (
      <StockPage title={isIn ? 'إضافة كمية' : 'سحب كمية'} go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        <StockEmptyState go={go} />
      </StockPage>
    )
  }

  const title = isIn ? 'إضافة كمية (وارد)' : 'سحب كمية (منصرف)'

  return (
    <StockPage title={title} subtitle="حركة مخزنية" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
      {sessionExpired ? (
        <SessionExpiredState go={go} />
      ) : (
        <>
          <div
            className={`rounded-[8px] border border-s-4 p-4 flex items-start gap-3 ${
              isIn
                ? 'border-[#ABEFC6] border-s-[#067647] bg-[#ECFDF3]'
                : 'border-[#FECDCA] border-s-[#B42318] bg-[#FEF3F2]'
            }`}
            role="status"
          >
            <span
              className={`w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0 ${
                isIn ? 'bg-[#067647] text-white' : 'bg-[#B42318] text-white'
              }`}
            >
              {isIn ? <Icons.Plus className="w-5 h-5" /> : <Icons.Minus className="w-5 h-5" />}
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#1F2A37]">
                {isIn ? 'توريد كمية إلى المخزون' : 'صرف كمية من المخزون'}
              </h2>
              <p className="text-xs mt-0.5 text-[#384250]">
                {isIn ? 'ستُضاف الكمية إلى رصيدك المتاح فور تأكيد الخادم' : 'ستُخصم الكمية من رصيدك المتاح فور تأكيد الخادم'}
              </p>
            </div>
          </div>

          <InfoBanner>
            الرصيد الحالي: <strong className="font-mono" dir="ltr">{formatAmount(stock?.available)}</strong>{' '}
            {stock?.units?.find((u) => u.is_main)?.name || ''}
          </InfoBanner>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* ── الوحدة ── */}
            <div className="dga-card p-4 sm:p-5">
              <Label req htmlFor="tx-unit">الوحدة</Label>
              <select
                id="tx-unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                aria-invalid={submitted && !!check.errors.unit}
                className={`w-full min-h-[44px] rounded-[4px] border bg-white px-3.5 text-[#161616] text-sm font-normal outline-none transition-colors duration-150 focus:ring-2 ${
                  submitted && check.errors.unit
                    ? 'border-[#B42318] bg-[#FEF3F2]/40 focus:border-[#B42318] focus:ring-[#B42318]/15'
                    : 'border-[#9DA4AE] hover:border-[#384250] focus:border-[#1B8354] focus:ring-[#1B8354]/15'
                }`}
              >
                <option value="">اختر الوحدة</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {showErr(check.errors.unit)}
              {selectedBalance && (
                <p className="text-xs font-medium text-[#6C737F] mt-2">
                  رصيد هذه الوحدة:{' '}
                  <strong className="text-[#1F2A37] font-mono" dir="ltr">{formatAmount(selectedBalance.amount)}</strong>{' '}
                  {selectedBalance.unit}
                </p>
              )}
              {!selectedBalance && selectedUnit && (
                <p className="text-xs font-normal text-[#6C737F] mt-2">لا يوجد رصيد مسجل لهذه الوحدة بعد</p>
              )}
            </div>

            {/* ── الكمية ── */}
            <div className="dga-card p-4 sm:p-5">
              <Label req htmlFor="tx-amount">الكمية (عدد صحيح موجب)</Label>
              <TextInput
                id="tx-amount"
                value={amount}
                onChange={(v) => setAmount(v.replace(/\D/g, '').slice(0, 9))}
                placeholder="مثال: 5"
                inputMode="numeric"
                dir="ltr"
                error={submitted && !!check.errors.amount}
              />
              {showErr(check.errors.amount)}
            </div>

            {/* ── الوصف ── */}
            <div className="dga-card p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="tx-desc">الوصف (اختياري)</Label>
                <span className={`text-[11px] font-mono ${description.length > DESC_MAX ? 'text-[#B42318] font-semibold' : 'text-[#6C737F]'}`} dir="ltr">
                  {description.length}/{DESC_MAX}
                </span>
              </div>
              <textarea
                id="tx-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={DESC_MAX + 1}
                placeholder="مثال: توريد 5 كراتين — فاتورة شراء #102"
                className={`w-full rounded-[4px] border bg-white px-3.5 py-3 text-[#161616] text-sm font-normal outline-none transition-colors duration-150 placeholder:text-[#6C737F] focus:ring-2 resize-y ${
                  submitted && check.errors.description
                    ? 'border-[#B42318] bg-[#FEF3F2]/40 focus:border-[#B42318] focus:ring-[#B42318]/15'
                    : 'border-[#9DA4AE] hover:border-[#384250] focus:border-[#1B8354] focus:ring-[#1B8354]/15'
                }`}
              />
              {showErr(check.errors.description)}
            </div>

            {serverErr && <ErrorBanner err={serverErr} />}

            <PrimaryBtn
              type="submit"
              loading={submitting}
              className={!isIn ? '!bg-[#B42318] hover:!bg-[#912018] active:!bg-[#7A271A]' : ''}
            >
              {isIn ? 'تأكيد الإضافة' : 'تأكيد السحب'}
            </PrimaryBtn>
          </form>
        </>
      )}
    </StockPage>
  )
}
