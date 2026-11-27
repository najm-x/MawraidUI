import { Icons } from '../icons'

export function ResourceBadge({ type }) {
  const map = {
    gas: { label: 'غاز منزلي', color: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]', icon: Icons.Gas },
    water: { label: 'مياه ووايتات', color: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]', icon: Icons.Water },
    fuel: { label: 'مشتقات نفطية', color: 'bg-[#F3FCF6] text-[#067647] border-[#B8EACB]', icon: Icons.Fuel },
  }
  const item = map[type] || map.gas
  const Icon = item.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-xs font-semibold ${item.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{item.label}</span>
    </span>
  )
}
