import { Icons } from '../icons'

export function BackBtn({ onClick, label = 'رجوع' }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] hover:border-[#9DA4AE] active:bg-[#E5E7EB] text-[#161616] text-xs font-semibold dga-btn-motion cursor-pointer"
      aria-label={label}
    >
      <Icons.ArrowRight className="w-4 h-4 text-[#384250] transition-transform duration-150 group-hover:translate-x-0.5" />
      <span>{label}</span>
    </button>
  )
}

export function PrimaryBtn({ children, onClick, disabled, loading, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`mt-5 w-full min-h-[46px] px-4 rounded-[4px] bg-[#1B8354] hover:bg-[#166A44] active:bg-[#074D31] text-white text-[15px] leading-6 font-medium dga-btn-motion disabled:bg-[#E5E7EB] disabled:text-[#9DA4AE] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <Icons.Refresh className="w-4 h-4 animate-spin" />
          <span>جارٍ المعالجة…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export function SecondaryBtn({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] hover:border-[#9DA4AE] active:bg-[#E5E7EB] text-[#161616] text-sm font-medium dga-btn-motion cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white ${className}`}
    >
      {children}
    </button>
  )
}
