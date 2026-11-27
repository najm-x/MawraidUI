// ═══════════ قالب شاشة المخزون — ترويسة + محتوى عريض — DGA Design System ═══════════
import StockHeader from './StockHeader'
import { ROUTES } from '../../../shared/constants/routes'

export default function StockPage({ title, subtitle, go, backTo = ROUTES.DASHBOARD, backParams = {}, backLabel = 'رجوع', action, children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1F2A37] flex flex-col font-sans">
      <StockHeader
        title={title}
        subtitle={subtitle}
        onBack={() => go(backTo, backParams)}
        backLabel={backLabel}
        action={action}
      />
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-4 text-right">{children}</main>
    </div>
  )
}
