import { BackBtn } from '../../../shared/components/ui'

export default function AddressPage({ title, onBack, backLabel = 'لوحة التحكم', children }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <BackBtn onClick={onBack} label={backLabel} />
          <h1 className="text-lg sm:text-xl font-bold text-[#1F2A37] truncate">{title}</h1>
        </div>
      </header>
      <main className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-5 flex-1 text-right">
        {children}
      </main>
    </div>
  )
}
