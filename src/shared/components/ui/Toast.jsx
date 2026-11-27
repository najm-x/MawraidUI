import { Icons } from '../icons'

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-[8px] px-4 py-3 text-sm font-medium shadow-dga-lg flex items-center gap-2.5 dga-toast-in border border-s-4 ${
        toast.ok
          ? 'bg-[#0D121C] text-white border-[#384250] border-s-[#1B8354]'
          : 'bg-[#FEF3F2] text-[#1F2A37] border-[#FECDCA] border-s-[#B42318]'
      }`}
      role="status"
    >
      {toast.ok ? (
        <Icons.Check className="w-4 h-4 text-[#54C08A] shrink-0" />
      ) : (
        <Icons.Alert className="w-4 h-4 text-[#B42318] shrink-0" />
      )}
      <span>{toast.msg}</span>
    </div>
  )
}
