import { useState } from 'react'
import { addressesApi } from '../../../services/api'
import { Label, SecondaryBtn, TextInput } from '../../../shared/components/ui'
import { UUID_RE } from '../../../shared/constants/regex'
import { ROUTES } from '../../../shared/constants/routes'
import AddressCard from '../components/AddressCard'
import AddressPage from '../components/AddressPage'
import AddressResults from '../components/AddressResults'
import { useAddressQuery } from '../hooks/useAddressQuery'

export default function AdminAddressesPage({ go, onSessionExpired }) {
  const [userId, setUserId] = useState('')
  const [addressId, setAddressId] = useState('')
  const [userIdError, setUserIdError] = useState(false)
  const [addressIdError, setAddressIdError] = useState(false)
  const [lookup, setLookup] = useState(null)
  const query = useAddressQuery(lookup?.load, onSessionExpired)

  function submitUser(event) {
    event.preventDefault()
    const id = userId.trim()
    if (!UUID_RE.test(id)) {
      setUserIdError(true)
      return
    }
    const defaultOnly = event.nativeEvent.submitter?.value === 'default'
    setLookup(defaultOnly
      ? { load: () => addressesApi.getDefaultForUser(id), title: 'العنوان الافتراضي', emptyMessage: 'لا يوجد عنوان افتراضي لهذا المستخدم.' }
      : { load: () => addressesApi.listForUser(id), title: 'عناوين المستخدم', emptyMessage: 'لا توجد عناوين محفوظة لهذا المستخدم.' })
  }

  function findAddress(id) {
    setAddressId(id)
    setAddressIdError(false)
    setLookup({ load: () => addressesApi.getAdminById(id), title: 'تفاصيل العنوان' })
  }

  function submitAddress(event) {
    event.preventDefault()
    const id = addressId.trim()
    if (!UUID_RE.test(id)) {
      setAddressIdError(true)
      return
    }
    findAddress(id)
  }

  const addresses = Array.isArray(query.data) ? query.data : [query.data].filter(Boolean)
  return (
    <AddressPage title="عرض عناوين المواطنين" onBack={() => go(ROUTES.DASHBOARD)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <form onSubmit={submitUser} className="dga-card p-5 space-y-3.5" noValidate>
          <div>
            <Label htmlFor="lookup-user-id">معرّف المستخدم (UUID)</Label>
            <TextInput
              id="lookup-user-id"
              dir="ltr"
              value={userId}
              onChange={(value) => { setUserId(value); setUserIdError(false) }}
              error={userIdError}
              aria-invalid={userIdError}
              aria-describedby={userIdError ? 'lookup-user-error' : undefined}
              autoComplete="off"
            />
            {userIdError && <p id="lookup-user-error" className="mt-1.5 text-xs font-medium text-[#B42318]" role="alert">أدخل معرّف مستخدم صالحاً.</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryBtn type="submit">عرض عناوين المستخدم</SecondaryBtn>
            <button
              type="submit"
              value="default"
              className="min-h-[42px] rounded-[4px] px-3 text-sm font-medium text-[#1B8354] hover:bg-[#F3FCF6] dga-btn-motion cursor-pointer"
            >
              عرض الافتراضي
            </button>
          </div>
        </form>

        <form onSubmit={submitAddress} className="dga-card p-5 space-y-3.5" noValidate>
          <div>
            <Label htmlFor="lookup-address-id">معرّف العنوان (UUID)</Label>
            <TextInput
              id="lookup-address-id"
              dir="ltr"
              value={addressId}
              onChange={(value) => { setAddressId(value); setAddressIdError(false) }}
              error={addressIdError}
              aria-invalid={addressIdError}
              aria-describedby={addressIdError ? 'lookup-address-error' : undefined}
              autoComplete="off"
            />
            {addressIdError && <p id="lookup-address-error" className="mt-1.5 text-xs font-medium text-[#B42318]" role="alert">أدخل معرّف عنوان صالحاً.</p>}
          </div>
          <SecondaryBtn type="submit">البحث عن عنوان</SecondaryBtn>
        </form>
      </div>

      {lookup && (
        <section aria-labelledby="address-lookup-results" className="space-y-3 fade-in">
          <h2 id="address-lookup-results" className="text-lg font-bold text-[#1F2A37]">{lookup.title}</h2>
          <AddressResults query={query} emptyMessage={lookup.emptyMessage}>
            <div className="grid gap-3 dga-stagger">
              {addresses.map((address) => (
                <AddressCard key={address.id} address={address} showOwner onDetails={Array.isArray(query.data) ? findAddress : undefined} />
              ))}
            </div>
          </AddressResults>
        </section>
      )}
    </AddressPage>
  )
}
