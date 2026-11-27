import { Icons } from '../icons'

export function BrandLogo({ size = 'md', className = '' }) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`rounded-[6px] bg-[#074D31] flex items-center justify-center shrink-0 ${isSm ? 'w-9 h-9' : isLg ? 'w-12 h-12' : 'w-10 h-10'}`}>
        <Icons.LogoMark className={isSm ? 'w-8 h-8' : isLg ? 'w-11 h-11' : 'w-9 h-9'} />
      </div>
      <div className="flex flex-col text-right">
        <span className={`font-bold tracking-tight text-[#1F2A37] leading-none ${isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'}`}>
          مَـوَارِد
        </span>
        <span className="text-[11px] font-normal text-[#6C737F] mt-1">
          منصة توزيع الموارد — تعز
        </span>
      </div>
    </div>
  )
}

export function Logo({ title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <div className="w-14 h-14 mx-auto rounded-[8px] bg-[#074D31] flex items-center justify-center mb-3">
        <Icons.LogoMark className="w-11 h-11" />
      </div>
      <h2 className="text-2xl font-bold text-[#1F2A37] tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm font-normal text-[#6C737F] mt-1.5 max-w-sm mx-auto">{subtitle}</p>}
    </div>
  )
}
