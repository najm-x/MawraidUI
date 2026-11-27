import { getErrorMessage } from '../../../services/api'
import { Icons } from '../icons'

export function ErrorBanner({ err }) {
  if (!err) return null
  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-[8px] border border-[#FECDCA] border-s-4 border-s-[#B42318] bg-[#FEF3F2] px-4 py-3.5 text-sm text-[#1F2A37] fade-in"
      role="alert"
    >
      <div className="shrink-0 mt-0.5 text-[#B42318]">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="flex-1 font-medium leading-6 text-[#1F2A37]">{getErrorMessage(err)}</div>
      {err.code && (
        <span className="shrink-0 font-mono rounded-[4px] border border-[#FECDCA] bg-white text-[#B42318] text-[11px] font-semibold px-1.5 py-0.5">
          {err.code}
        </span>
      )}
    </div>
  )
}

export function InfoBanner({ children }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-[8px] border border-[#B8EACB] border-s-4 border-s-[#1B8354] bg-[#F3FCF6] px-4 py-3.5 text-sm text-[#1F2A37] fade-in">
      <div className="shrink-0 mt-0.5 text-[#067647]">
        <Icons.Shield className="w-5 h-5" />
      </div>
      <div className="flex-1 font-medium leading-6 text-[#384250]">{children}</div>
    </div>
  )
}
