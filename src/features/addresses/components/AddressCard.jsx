import { Icons, SecondaryBtn } from '../../../shared/components/ui'

export default function AddressCard({ address, onDetails, showOwner = false, detailsLabel = 'عرض التفاصيل' }) {
  const { title, description, location, is_default: isDefault } = address
  return (
    <article
      className={`dga-card p-4 sm:p-5 space-y-3 ${
        isDefault ? 'border-[#1B8354] border-s-4 border-s-[#1B8354]' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-8 h-8 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center shrink-0">
          <Icons.MapPin className="w-4 h-4" />
        </span>
        <h2 dir="auto" className="min-w-0 break-words font-bold text-base text-[#1F2A37]">
          {title || 'عنوان محفوظ'}
        </h2>
        {isDefault && (
          <span className="rounded-full bg-[#F3FCF6] border border-[#B8EACB] px-2.5 py-0.5 text-xs font-semibold text-[#067647]">
            الافتراضي
          </span>
        )}
      </div>
      <p dir="auto" className="whitespace-pre-wrap break-words text-sm leading-6 text-[#384250]">
        {description}
      </p>
      <dl className="space-y-1.5 text-xs text-[#6C737F] pt-2 border-t border-[#E5E7EB]">
        <div className="flex flex-wrap gap-x-2">
          <dt>الإحداثيات</dt>
          <dd dir="ltr" className="font-mono text-[#1F2A37]">{location.lat}, {location.lng}</dd>
        </div>
        {showOwner && (
          <>
            <div className="flex flex-wrap gap-x-2">
              <dt>معرّف العنوان</dt>
              <dd dir="ltr" className="break-all font-mono text-[#1F2A37]">{address.id}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt>معرّف صاحب العنوان</dt>
              <dd dir="ltr" className="break-all font-mono text-[#1F2A37]">{address.user_id}</dd>
            </div>
          </>
        )}
      </dl>
      {onDetails && <SecondaryBtn onClick={() => onDetails(address.id)}>{detailsLabel}</SecondaryBtn>}
    </article>
  )
}
