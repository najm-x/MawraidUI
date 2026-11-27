// ═══════════ شاشة سجل الحركات — ترقيم + فلترة (الكل / وارد / منصرف) — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { ROUTES } from '../../../shared/constants/routes'
import { stockApi } from '../../../services/api'
import { Icons, SecondaryBtn } from '../../../shared/components/ui'
import StockPage from '../components/StockPage'
import { StockLoading, StockErrorState, SessionExpiredState, StockEmptyState } from '../components/StockStates'
import { useStock } from '../hooks/useStock'
import { formatAmount, formatDateTime, isSessionExpired } from '../utils'

const PAGE_SIZE = 20

const FILTERS = [
  { key: 'all', label: 'كل الحركات' },
  { key: 'in', label: 'الوارد فقط' },
  { key: 'out', label: 'المنصرف فقط' },
]

export default function StockHistoryPage({ go, stockId: propStockId }) {
  const { status, stock, err, reload } = useStock(propStockId)

  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listErr, setListErr] = useState(null)

  const seqRef = useRef(0)
  const stockId = stock?.id

  const load = useCallback(async (id, f, p) => {
    const seq = ++seqRef.current
    setLoading(true)
    setListErr(null)
    try {
      const res = await stockApi.getStockTransactions(id, {
        page: p,
        page_size: PAGE_SIZE,
        is_in: f === 'all' ? undefined : f === 'in',
      })
      if (seq !== seqRef.current) return
      setItems(Array.isArray(res?.data) ? res.data : [])
      setMeta(res?.meta || null)
    } catch (e) {
      if (seq !== seqRef.current) return
      setItems([])
      setMeta(null)
      setListErr(e)
    } finally {
      if (seq === seqRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!stockId) return
    load(stockId, filter, page)
    return () => {
      seqRef.current++
    }
  }, [stockId, filter, page, load])

  function changeFilter(key) {
    if (key === filter) return
    setFilter(key)
    setPage(1)
  }

  const totalPages = Number(meta?.total_pages) || 1
  const total = meta?.total

  if (status === 'loading' || status === 'error' || status === 'empty') {
    return (
      <StockPage title="سجل الحركات" subtitle="الوارد والمنصرف" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId: propStockId }} backLabel="لوحة المخزون">
        {status === 'loading' && <StockLoading label="جارٍ تحميل سجل الحركات…" />}
        {status === 'error' && (isSessionExpired(err) ? <SessionExpiredState go={go} /> : <StockErrorState err={err} onRetry={reload} />)}
        {status === 'empty' && <StockEmptyState go={go} />}
      </StockPage>
    )
  }

  const sessionExpiredList = isSessionExpired(listErr)

  return (
    <StockPage title="سجل الحركات" subtitle="الوارد والمنصرف" go={go} backTo={ROUTES.STOCK_DASHBOARD} backParams={{ stockId: propStockId }} backLabel="لوحة المخزون">
      {/* ── الفلاتر (DGA Horizontal Tab Switcher) ── */}
      <div className="flex items-center border-b border-[#D2D6DB] bg-white rounded-t-[8px] px-2 pt-1" aria-label="فلترة الحركات">
        {FILTERS.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(f.key)}
              className={`flex-1 px-3 py-3 text-xs sm:text-sm border-b-2 transition-colors duration-150 cursor-pointer ${
                active
                  ? 'border-[#1B8354] text-[#1B8354] font-semibold bg-[#F3FCF6]/50'
                  : 'border-transparent text-[#384250] hover:text-[#161616] font-medium'
              }`}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* ── النتائج ── */}
      {sessionExpiredList ? (
        <SessionExpiredState go={go} />
      ) : loading ? (
        <StockLoading label="جارٍ تحميل الحركات…" />
      ) : listErr ? (
        <StockErrorState err={listErr} onRetry={() => load(stockId, filter, page)} />
      ) : items.length === 0 ? (
        <div className="dga-card p-8 text-center fade-in">
          <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3F4F6] text-[#6C737F] flex items-center justify-center mb-3">
            <Icons.History className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-[#1F2A37]">لا توجد حركات مسجلة</h2>
          <p className="text-xs text-[#6C737F] mt-1.5">
            {filter === 'all' ? 'ستظهر هنا حركات التوريد والصرف بعد تسجيلها' : 'لا توجد حركات مطابقة لهذا الفلتر'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 dga-stagger">
          {items.map((t) => (
            <li key={t.id} className="dga-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      t.is_in
                        ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                        : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                    }`}
                  >
                    {t.is_in ? 'وارد' : 'منصرف'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1F2A37]">
                      <span className="font-mono" dir="ltr">{formatAmount(t.amount)}</span>{' '}
                      <span>{t.unit?.name || ''}</span>
                    </div>
                    {t.description && (
                      <p className="text-xs text-[#6C737F] mt-1 break-words leading-6">{t.description}</p>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#6C737F] shrink-0">{formatDateTime(t.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── الترقيم ── */}
      {!loading && !listErr && (items.length > 0 || page > 1) && (
        <div className="flex items-center justify-between gap-3 pt-1">
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
              صفحة {page}{page <= totalPages && ` من ${totalPages}`}
            </div>
            {total !== undefined && total !== null && (
              <div className="text-[11px] text-[#6C737F]">{formatAmount(total)} حركة</div>
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
    </StockPage>
  )
}
