import { ErrorBanner, SecondaryBtn } from '../../../shared/components/ui'

export default function AddressResults({ query, emptyMessage, children }) {
  if (query.loading) {
    return (
      <p role="status" className="dga-card p-6 text-sm font-medium text-[#6C737F] flex items-center gap-3 fade-in">
        <span className="w-4 h-4 border-2 border-[#B8EACB] border-t-[#1B8354] rounded-full animate-spin shrink-0" aria-hidden="true" />
        جارٍ تحميل العناوين…
      </p>
    )
  }
  if (query.err) {
    return (
      <div className="dga-card p-5 space-y-3 fade-in">
        <ErrorBanner err={query.err} />
        {query.err.status !== 403 && query.err.code !== 1107 && query.err.code !== 1700 && (
          <SecondaryBtn onClick={query.retry}>إعادة المحاولة</SecondaryBtn>
        )}
      </div>
    )
  }
  if (emptyMessage && (query.data === null || query.data?.length === 0)) {
    return (
      <p role="status" className="rounded-[16px] border border-dashed border-[#D2D6DB] bg-white p-6 text-sm text-[#6C737F] text-center fade-in">
        {emptyMessage}
      </p>
    )
  }
  return children
}
