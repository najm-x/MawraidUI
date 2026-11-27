// ═══════════ شاشة إدارة وحدات المخزون — إضافة وتعديل — DGA Design System ═══════════
import { useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { Icons, ErrorBanner, Label, PrimaryBtn, SecondaryBtn, TextInput } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { isSessionExpired, formatPrice } from '../utils'
import { UNIT_NAME_MAX, validateUnitForm } from '../validation'

export default function StockUnitsPage({ go, showToast, stockId }) {
  const { status, stock, err, reload } = useStock(stockId)

  const [addName, setAddName] = useState('')
  const [addRate, setAddRate] = useState('')
  const [addPrice, setAddPrice] = useState('')
  const [addErrors, setAddErrors] = useState({})
  const [addServerErr, setAddServerErr] = useState(null)
  const [adding, setAdding] = useState(false)

  const [editing, setEditing] = useState(null)
  const [editErrors, setEditErrors] = useState({})
  const [editServerErr, setEditServerErr] = useState(null)
  const [saving, setSaving] = useState(false)

  const [sessionExpired, setSessionExpired] = useState(false)

  const units = Array.isArray(stock?.units) ? stock.units : []

  async function addUnit(e) {
    if (e) e.preventDefault()
    setAddServerErr(null)
    const check = validateUnitForm({
      name: addName,
      rate: addRate,
      price: addPrice,
      units,
      requirePrice: true,
    })
    setAddErrors(check.errors)
    if (!check.valid || adding) return

    setAdding(true)
    try {
      await stockApi.addStockUnit(stock.id, {
        name: check.name,
        rate: Number(addRate),
        price: Number(addPrice),
        is_main: false,
      })
      showToast?.('تمت إضافة الوحدة بنجاح')
      setAddName('')
      setAddRate('')
      setAddPrice('')
      setAddErrors({})
      reload()
    } catch (e2) {
      if (isSessionExpired(e2)) setSessionExpired(true)
      else setAddServerErr(e2)
    } finally {
      setAdding(false)
    }
  }

  function startEdit(u) {
    setEditing({
      id: u.id,
      name: u.name,
      rate: String(u.rate),
      price: u.price !== undefined && u.price !== null ? String(u.price) : '',
    })
    setEditErrors({})
    setEditServerErr(null)
  }

  async function saveEdit() {
    if (!editing || saving) return
    const unit = units.find((u) => String(u.id) === String(editing.id))
    if (!unit) return
    const isMain = !!unit.is_main

    const check = validateUnitForm({
      name: editing.name,
      rate: editing.rate,
      price: editing.price,
      units,
      excludeId: unit.id,
      isMain,
      requirePrice: false,
    })
    setEditErrors(check.errors)
    if (!check.valid) return

    const payload = {}
    if (check.name !== unit.name) payload.name = check.name
    if (!isMain && Number(editing.rate) !== Number(unit.rate)) payload.rate = Number(editing.rate)
    if (editing.price !== '' && Number(editing.price) !== Number(unit.price)) {
      payload.price = Number(editing.price)
    }
    if (Object.keys(payload).length === 0) {
      setEditing(null)
      return
    }

    setSaving(true)
    setEditServerErr(null)
    try {
      await stockApi.updateStockUnit(stock.id, unit.id, payload)
      showToast?.('تم حفظ التعديلات')
      setEditing(null)
      reload()
    } catch (e2) {
      if (isSessionExpired(e2)) {
        setSessionExpired(true)
      } else if (e2?.code === 1610 && (payload.name || payload.price !== undefined) && payload.rate !== undefined) {
        try {
          const retryPayload = {}
          if (payload.name) retryPayload.name = payload.name
          if (payload.price !== undefined) retryPayload.price = payload.price
          await stockApi.updateStockUnit(stock.id, unit.id, retryPayload)
          showToast?.('تم حفظ التعديل — لا يمكن تغيير معامل وحدة مستخدمة سابقاً')
          setEditing(null)
          reload()
        } catch (e3) {
          if (isSessionExpired(e3)) setSessionExpired(true)
          else setEditServerErr(e3)
        }
      } else {
        setEditServerErr(e2)
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || status === 'error' || status === 'empty') {
    return (
      <StockPage title="إدارة الوحدات" subtitle="الوحدات ومعاملات التحويل" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
        {status === 'loading' && <StockLoading />}
        {status === 'error' && (isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />)}
        {status === 'empty' && <StockEmptyState go={go} />}
      </StockPage>
    )
  }

  return (
    <StockPage title="إدارة الوحدات" subtitle="الوحدات ومعاملات التحويل" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId }} backLabel="لوحة المخزون">
      {sessionExpired ? (
        <SessionExpiredState go={go} />
      ) : (
        <>
          {/* ── قائمة الوحدات ── */}
          <div className="dga-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#1F2A37]">وحدات المخزون</h2>
              <span className="text-xs font-medium text-[#6C737F]">{units.length} وحدة</span>
            </div>

            <ul className="space-y-3 dga-stagger">
              {units.map((u) => {
                const isEditing = editing && String(editing.id) === String(u.id)
                const isMain = !!u.is_main
                return (
                  <li key={u.id} className="rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
                    {isEditing ? (
                      <div className="space-y-3 fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label req htmlFor={`edit-name-${u.id}`}>اسم الوحدة</Label>
                            <TextInput
                              id={`edit-name-${u.id}`}
                              value={editing.name}
                              onChange={(v) => setEditing((s) => ({ ...s, name: v }))}
                              maxLength={UNIT_NAME_MAX}
                              error={!!editErrors.name}
                            />
                            {editErrors.name && <p className="text-xs font-medium text-[#B42318] mt-1.5">{editErrors.name}</p>}
                          </div>
                          <div>
                            <Label htmlFor={`edit-rate-${u.id}`}>معامل التحويل</Label>
                            <TextInput
                              id={`edit-rate-${u.id}`}
                              value={isMain ? '1' : editing.rate}
                              onChange={(v) => setEditing((s) => ({ ...s, rate: v.replace(/\D/g, '').slice(0, 9) }))}
                              disabled={isMain}
                              readOnly={isMain}
                              inputMode="numeric"
                              dir="ltr"
                              placeholder="مثال: 12"
                              error={!!editErrors.rate}
                            />
                            {isMain ? (
                              <p className="text-[11px] text-[#6C737F] mt-1.5">معامل الوحدة الرئيسية ثابت 1 ولا يُعدَّل</p>
                            ) : (
                              editErrors.rate && <p className="text-xs font-medium text-[#B42318] mt-1.5">{editErrors.rate}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`edit-price-${u.id}`}>سعر الوحدة</Label>
                            <TextInput
                              id={`edit-price-${u.id}`}
                              value={editing.price}
                              onChange={(v) => setEditing((s) => ({ ...s, price: v }))}
                              type="number"
                              step="0.01"
                              min="0"
                              dir="ltr"
                              placeholder="مثال: 7500"
                              error={!!editErrors.price}
                            />
                            {editErrors.price && <p className="text-xs font-medium text-[#B42318] mt-1.5">{editErrors.price}</p>}
                          </div>
                        </div>
                        {editServerErr && <ErrorBanner err={editServerErr} />}
                        <div className="flex gap-2">
                          <SecondaryBtn onClick={() => setEditing(null)} className="flex-1">
                            إلغاء
                          </SecondaryBtn>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={saving}
                            className="flex-1 min-h-[42px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] text-white text-sm font-medium dga-btn-motion disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {saving ? (
                              <>
                                <Icons.Refresh className="w-4 h-4 animate-spin" />
                                <span>جارٍ الحفظ…</span>
                              </>
                            ) : (
                              <span>حفظ التعديلات</span>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#1F2A37] truncate">{u.name}</span>
                            {isMain ? (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#F3FCF6] text-[#074D31] text-[10px] font-semibold border border-[#B8EACB]">
                                رئيسية
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-[4px] bg-white text-[#384250] text-[10px] font-semibold border border-[#E5E7EB]">
                                فرعية
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6C737F] mt-1 flex items-center gap-3 flex-wrap">
                            <span>
                              معامل التحويل:{' '}
                              <strong className="font-mono text-[#1F2A37]" dir="ltr">{isMain ? 1 : u.rate}</strong>
                            </span>
                            {u.price !== undefined && u.price !== null && (
                              <span>
                                السعر:{' '}
                                <strong className="font-mono text-[#1F2A37]" dir="ltr">{formatPrice(u.price)}</strong>
                              </span>
                            )}
                          </p>
                        </div>
                        <SecondaryBtn onClick={() => startEdit(u)} className="shrink-0 text-xs min-h-[36px] px-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Icons.Settings className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </span>
                        </SecondaryBtn>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>

            <p className="text-xs text-[#6C737F] mt-4 leading-relaxed">
              ملاحظة: لا يُسمح بحذف الوحدات. المعاملات تُحسب نسبةً إلى الوحدة الرئيسية (المعامل 1).
            </p>
          </div>

          {/* ── إضافة وحدة فرعية ── */}
          <form onSubmit={addUnit} className="dga-card p-4 sm:p-5 space-y-3" noValidate>
            <h2 className="text-sm font-bold text-[#1F2A37]">إضافة وحدة فرعية جديدة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label req htmlFor="new-unit-name">اسم الوحدة</Label>
                <TextInput
                  id="new-unit-name"
                  value={addName}
                  onChange={(v) => setAddName(v)}
                  placeholder="مثال: طرد"
                  maxLength={UNIT_NAME_MAX}
                  error={!!addErrors.name}
                />
                {addErrors.name && <p className="text-xs font-medium text-[#B42318] mt-1.5">{addErrors.name}</p>}
              </div>
              <div>
                <Label req htmlFor="new-unit-rate">معامل التحويل</Label>
                <TextInput
                  id="new-unit-rate"
                  value={addRate}
                  onChange={(v) => setAddRate(v.replace(/\D/g, '').slice(0, 9))}
                  placeholder="مثال: 24"
                  inputMode="numeric"
                  dir="ltr"
                  error={!!addErrors.rate}
                />
                {addErrors.rate && <p className="text-xs font-medium text-[#B42318] mt-1.5">{addErrors.rate}</p>}
              </div>
              <div>
                <Label req htmlFor="new-unit-price">سعر الوحدة</Label>
                <TextInput
                  id="new-unit-price"
                  value={addPrice}
                  onChange={(v) => setAddPrice(v)}
                  placeholder="مثال: 70000"
                  type="number"
                  step="0.01"
                  min="0"
                  dir="ltr"
                  error={!!addErrors.price}
                />
                {addErrors.price && <p className="text-xs font-medium text-[#B42318] mt-1.5">{addErrors.price}</p>}
              </div>
            </div>
            {addServerErr && <ErrorBanner err={addServerErr} />}
            <PrimaryBtn type="submit" loading={adding}>
              إضافة الوحدة
            </PrimaryBtn>
          </form>
        </>
      )}
    </StockPage>
  )
}
