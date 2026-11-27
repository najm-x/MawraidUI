import { useState } from 'react'
import { addressesApi } from '../../../services/api'
import { Icons, PrimaryBtn } from '../../../shared/components/ui'
import { ROUTES } from '../../../shared/constants/routes'
import AddressCard from '../components/AddressCard'
import AddressForm from '../components/AddressForm'
import AddressPage from '../components/AddressPage'
import AddressResults from '../components/AddressResults'
import { useAddressQuery } from '../hooks/useAddressQuery'

function AddressList({ onAdd, onDetails, onSessionExpired }) {
  const query = useAddressQuery(addressesApi.listMine, onSessionExpired)

  return (
    <>
      {query.data && (
        <PrimaryBtn onClick={() => onAdd(query.data)} className="!mt-0 sm:w-auto sm:px-5">
          <Icons.MapPin className="w-4 h-4" />
          إضافة عنوان
        </PrimaryBtn>
      )}
      <AddressResults query={query} emptyMessage="لا توجد عناوين محفوظة. أضف عنوانك الأول.">
        <div className="grid gap-3.5 dga-stagger">
          {query.data?.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              detailsLabel={address.is_default ? 'عرض العنوان الافتراضي' : undefined}
              onDetails={() => onDetails(address)}
            />
          ))}
        </div>
      </AddressResults>
    </>
  )
}

function AddressDetails({ load, onSessionExpired }) {
  const query = useAddressQuery(load, onSessionExpired)
  return (
    <AddressResults query={query} emptyMessage="لا يوجد عنوان افتراضي حالياً.">
      {query.data && <AddressCard address={query.data} />}
    </AddressResults>
  )
}

export default function CitizenAddressesPage({ go, showToast, onSessionExpired }) {
  const [view, setView] = useState(null)

  function changeView(next) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  function onSaved(address) {
    changeView(null)
    showToast(address.is_default ? 'تم حفظ العنوان الافتراضي.' : 'تم حفظ العنوان.')
  }

  if (view?.addresses) {
    return (
      <AddressPage title="إضافة عنوان" onBack={() => changeView(null)} backLabel="عناويني">
        <AddressForm addresses={view.addresses} onSaved={onSaved} onSessionExpired={onSessionExpired} />
      </AddressPage>
    )
  }

  if (view?.load) {
    return (
      <AddressPage title="تفاصيل العنوان" onBack={() => changeView(null)} backLabel="عناويني">
        <AddressDetails load={view.load} onSessionExpired={onSessionExpired} />
      </AddressPage>
    )
  }

  return (
    <AddressPage title="عناويني" onBack={() => go(ROUTES.DASHBOARD)}>
      <AddressList
        onAdd={(addresses) => changeView({ addresses })}
        onDetails={(address) => changeView({
          load: address.is_default ? addressesApi.getMyDefault : () => addressesApi.getMineById(address.id),
        })}
        onSessionExpired={onSessionExpired}
      />
    </AddressPage>
  )
}
