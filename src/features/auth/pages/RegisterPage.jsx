// ═══════════ شاشتا التسجيل: عميل (multipart) + مقدم خدمة (JSON) — DGA Design System ═══════════
import { useCallback, useEffect, useRef, useState } from 'react'
import { authApi } from '../../../services/api'
import { PHONE_RE } from '../../../shared/constants/regex'
import { Icons, BrandLogo, BackBtn, ErrorBanner, InfoBanner, Label, PhoneInput, TextInput, PrimaryBtn, SecondaryBtn } from '../../../shared/components/ui'
import TurnstileWidget from '../components/TurnstileWidget'

function CategoryCard({ selected, onToggle, icon: Icon, title, description, children }) {
  return (
    <div
      className={`rounded-[16px] border transition-colors duration-150 p-4 ${
        selected
          ? 'border-[#1B8354] bg-[#F3FCF6]'
          : 'border-[#E5E7EB] bg-white hover:border-[#9DA4AE]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 cursor-pointer select-none" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
              selected ? 'bg-[#1B8354] text-white' : 'bg-[#F3F4F6] text-[#384250]'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-[#1F2A37]">{title}</h4>
            <p className="text-xs text-[#6C737F]">{description}</p>
          </div>
        </div>
        {/* DGA Checkbox (radius-xs = 2px, control-border = #6C737F) */}
        <div
          className={`w-5 h-5 rounded-[2px] border flex items-center justify-center transition-colors ${
            selected ? 'bg-[#1B8354] border-[#1B8354] text-white' : 'border-[#6C737F] bg-white'
          }`}
        >
          {selected && <Icons.Check className="w-3.5 h-3.5" />}
        </div>
      </div>
      {selected && children && (
        <div className="mt-3.5 pt-3.5 border-t border-[#B8EACB] space-y-2.5 fade-in text-right">
          {children}
        </div>
      )}
    </div>
  )
}

export function RegisterConsumer({ go }) {
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [file, setFile] = useState(null)
  const [isDriver, setIsDriver] = useState(false)
  const [isHome, setIsHome] = useState(true)
  const [isBiz, setIsBiz] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [familyCount, setFamilyCount] = useState('')
  const [bizName, setBizName] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const fileRef = useRef(null)
  const turnstileRef = useRef(null)

  function onPickFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) return setErr({ code: 1400, message: 'حجم الملف أكبر من 5 ميجابايت' })
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) return setErr({ code: 1401, message: 'نوع الملف غير مسموح (يرجى رفع JPEG/PNG/WEBP)' })
    setErr(null)
    setFile(f)
  }

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    if (!PHONE_RE.test(phone)) return setErr({ code: 2000, message: 'رقم الجوال غير صالح (9 أرقام تبدأ بـ 7)' })
    if (pass.length < 8) return setErr({ code: 2000, message: 'كلمة المرور يجب أن لا تقل عن 8 أحرف' })
    if (name.trim().length < 10) return setErr({ code: 2000, message: 'الاسم الكامل يجب أن يتكون من 10 أحرف على الأقل (رباعي)' })
    if (idNumber.trim().length < 9) return setErr({ code: 2000, message: 'رقم الهوية الوطنية يجب أن لا يقل عن 9 خانات' })
    if (!file) return setErr({ code: 1402, message: 'يرجى إرفاق صورة البطاقة الشخصية أو العائلية' })
    if (!isDriver && !isHome && !isBiz) return setErr({ code: 2000, message: 'يجب اختيار صفة استفادة واحدة على الأقل (أسرة، سائق، أو نشاط تجاري)' })
    if (isDriver && (vehicleNumber.trim().length < 2 || vehicleType.trim().length < 2)) return setErr({ code: 2000, message: 'يرجى استكمال بيانات المركبة (الرقم والنوع)' })
    if (isHome && (!familyCount || +familyCount < 1 || +familyCount > 50)) return setErr({ code: 2000, message: 'يرجى تحديد عدد أفراد الأسرة المقيمين في تعز (1–50)' })
    if (isBiz && bizName.trim().length < 2) return setErr({ code: 2000, message: 'يرجى إدخال اسم النشاط التجاري' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })

    const fd = new FormData()
    fd.append('phone', phone)
    fd.append('password', pass)
    fd.append('name', name.trim())
    fd.append('id_number', idNumber.trim())
    fd.append('id_image', file)
    fd.append('is_driver', isDriver)
    fd.append('is_home', isHome)
    fd.append('is_business', isBiz)
    if (isDriver) {
      fd.append('vehicle_number', vehicleNumber.trim())
      fd.append('vehicle_type', vehicleType.trim())
    }
    if (isHome) fd.append('family_count', familyCount)
    if (isBiz) fd.append('business_name', bizName.trim())

    setLoading(true)
    try {
      await authApi.registerConsumer(fd, turnstileToken)
      go('otp', { phone })
    } catch (e) {
      setErr(e)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dga-canvas-grid py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <BackBtn onClick={() => go('home')} label="الرئيسية" />
            <button
              onClick={() => go('login')}
              className="text-xs font-semibold text-[#1B8354] hover:underline px-2 cursor-pointer"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] border-t-4 border-t-[#1B8354] shadow-card p-6 sm:p-8 fade-in">
          <div className="text-right mb-6 pb-4 border-b border-[#E5E7EB]">
            <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] text-xs font-semibold mb-2.5">
              حساب مستفيد جديد
            </span>
            <h1 className="text-2xl font-bold text-[#1F2A37]">إنشاء حساب مواطن / مستفيد</h1>
            <p className="text-xs sm:text-sm text-[#6C737F] mt-1.5 leading-relaxed">
              أدخل بيانات الهوية لتسجيل حصتك في توزيع الغاز المنزلي، صهاريج المياه، أو مخصصات الوقود بمدينة تعز
            </p>
          </div>

          <ErrorBanner err={err} />

          <form onSubmit={submit} className="space-y-4 text-right">
            <div>
              <Label req htmlFor="phone">رقم الجوال (لإرسال رموز التوزيع وSMS)</Label>
              <PhoneInput value={phone} onChange={setPhone} error={!!err} id="phone" />
            </div>

            <div>
              <Label req htmlFor="pass">كلمة المرور</Label>
              <TextInput id="pass" type="password" placeholder="8 أحرف أو أرقام على الأقل" value={pass} onChange={setPass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label req htmlFor="fullname">الاسم الكامل (رباعي كما في الهوية)</Label>
                <TextInput id="fullname" placeholder="مثال: أحمد عبد الله صالح العبسي" value={name} onChange={setName} />
              </div>
              <div>
                <Label req htmlFor="idNum">رقم البطاقة الشخصية / العائلية</Label>
                <TextInput id="idNum" placeholder="9 أرقام على الأقل" value={idNumber} onChange={setIdNumber} />
              </div>
            </div>

            <div>
              <Label req>صورة البطاقة الشخصية أو العائلية (للتحقق ومنع الازدواجية)</Label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPickFile} />
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className={`w-full min-h-[56px] rounded-[8px] border border-dashed flex items-center justify-center gap-3 px-4 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                  file
                    ? 'border-[#1B8354] bg-[#F3FCF6] text-[#074D31]'
                    : 'border-[#9DA4AE] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#384250]'
                }`}
              >
                <Icons.Upload className="w-5 h-5 text-[#1B8354]" />
                <span className="truncate">{file ? `تم اختيار: ${file.name}` : 'اضغط لرفع صورة الهوية (JPEG / PNG / WEBP ≤ 5MB)'}</span>
              </button>
            </div>

            <div className="pt-2">
              <Label req>صفة الاستفادة في مدينة تعز (اختر واحدة على الأقل):</Label>
              <div className="space-y-3 mt-2">
                <CategoryCard
                  selected={isHome}
                  onToggle={() => setIsHome(!isHome)}
                  icon={Icons.Home}
                  title="رب أسرة (غاز منزلي + مياه)"
                  description="لتسجيل كارت الحصة الشهرية للأسرة في الحي السكني"
                >
                  <div>
                    <Label req htmlFor="familyCount">عدد أفراد الأسرة المقيمين في تعز:</Label>
                    <TextInput
                      id="familyCount"
                      type="number"
                      placeholder="مثال: 5"
                      value={familyCount}
                      onChange={setFamilyCount}
                      min="1"
                      max="50"
                    />
                  </div>
                </CategoryCard>

                <CategoryCard
                  selected={isDriver}
                  onToggle={() => setIsDriver(!isDriver)}
                  icon={Icons.Driver}
                  title="سائق مركبة نقل / أجرة (مخصصات الوقود)"
                  description="لحافلات النقل الداخلي ومركبات الأجرة بمدينة تعز"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label req htmlFor="vNum">رقم لوحة المركبة</Label>
                      <TextInput id="vNum" placeholder="مثال: 12345 / تعز" value={vehicleNumber} onChange={setVehicleNumber} />
                    </div>
                    <div>
                      <Label req htmlFor="vType">نوع المركبة</Label>
                      <TextInput id="vType" placeholder="مثال: باص دباب / تاكسي" value={vehicleType} onChange={setVehicleType} />
                    </div>
                  </div>
                </CategoryCard>

                <CategoryCard
                  selected={isBiz}
                  onToggle={() => setIsBiz(!isBiz)}
                  icon={Icons.Business}
                  title="نشاط تجاري / منشأة خدمية"
                  description="للمخابز، المطاعم، والمحلات المستحقة لحصص تجارية"
                >
                  <div>
                    <Label req htmlFor="bizName">اسم المحل أو النشاط التجاري</Label>
                    <TextInput id="bizName" placeholder="مثال: مخبز النصر الآلي" value={bizName} onChange={setBizName} />
                  </div>
                </CategoryCard>
              </div>
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="register_consumer"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading} className="mt-6">
              إنشاء الحساب ومتابعة التحقق OTP
            </PrimaryBtn>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#6C737F]">
            لديك حساب مسبقاً؟{' '}
            <button onClick={() => go('login')} className="font-semibold text-[#1B8354] hover:underline cursor-pointer">
              تسجيل الدخول
            </button>
            {' '}•{' '}
            <button onClick={() => go('register-provider')} className="font-semibold text-[#384250] hover:underline cursor-pointer">
              التسجيل كوكيل خدمة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RegisterProvider({ go }) {
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')
  const [name, setName] = useState('')
  const [providerTypeId, setProviderTypeId] = useState('')
  const [providerTypes, setProviderTypes] = useState({ status: 'loading', list: [], err: null })
  const [desc, setDesc] = useState('')
  const [startAt, setStartAt] = useState('08:00')
  const [endAt, setEndAt] = useState('18:00')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const turnstileRef = useRef(null)
  const typesSeq = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadProviderTypes = useCallback(async () => {
    const seq = ++typesSeq.current
    setProviderTypes({ status: 'loading', list: [], err: null })
    try {
      const list = await authApi.getProviderTypes()
      if (!mountedRef.current || seq !== typesSeq.current) return
      setProviderTypes({ status: 'ready', list: Array.isArray(list) ? list : [], err: null })
    } catch (e) {
      if (!mountedRef.current || seq !== typesSeq.current) return
      setProviderTypes({ status: 'error', list: [], err: e })
    }
  }, [])

  useEffect(() => {
    loadProviderTypes()
  }, [loadProviderTypes])

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    if (!PHONE_RE.test(phone)) return setErr({ code: 2000, message: 'رقم الجوال غير صالح (9 أرقام تبدأ بـ 7)' })
    if (pass.length < 8) return setErr({ code: 2000, message: 'كلمة المرور يجب أن لا تقل عن 8 أحرف' })
    if (!providerTypeId || Number(providerTypeId) <= 0) return setErr({ code: 2000, message: 'يرجى اختيار نوع مزود الخدمة' })
    const trimmedName = name.trim()
    if (trimmedName.length < 10 || trimmedName.length > 50) return setErr({ code: 2000, message: 'اسم النشاط أو المركز يجب أن يكون بين 10 و50 حرفاً' })
    if (!startAt || !endAt || endAt <= startAt) return setErr({ code: 2000, message: 'وقت الإغلاق يجب أن يكون بعد وقت البدء' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })

    setLoading(true)
    try {
      await authApi.registerProvider({
        phone,
        password: pass,
        name: trimmedName,
        description: desc.trim(),
        start_at: `2026-01-01T${startAt}:00Z`,
        end_at: `2026-01-01T${endAt}:00Z`,
        provider_type_id: Number(providerTypeId),
      }, turnstileToken)
      go('otp', { phone })
    } catch (e) {
      setErr(e)
      if (e?.code === 1003) {
        setProviderTypeId('')
        loadProviderTypes()
      }
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dga-canvas-grid py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-xl w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <BackBtn onClick={() => go('home')} label="الرئيسية" />
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] border-t-4 border-t-[#074D31] shadow-card p-6 sm:p-8 fade-in">
          <div className="text-right mb-6 pb-4 border-b border-[#E5E7EB]">
            <span className="inline-block px-2.5 py-1 rounded-[4px] bg-[#F3FCF6] border border-[#B8EACB] text-[#074D31] text-xs font-semibold mb-2.5">
              بوابة الشركاء ومقدمي الخدمة
            </span>
            <h1 className="text-2xl font-bold text-[#1F2A37]">تسجيل وكيل أو محطة توزيع معتمدة</h1>
            <p className="text-xs sm:text-sm text-[#6C737F] mt-1.5 leading-relaxed">
              لوكيل غاز، مورد مياه، أو محطة محروقات في مدينة تعز لإدارة الحصص والتسليم الموثق
            </p>
          </div>

          <ErrorBanner err={err} />

          <form onSubmit={submit} className="space-y-4 text-right">
            <div>
              <Label req htmlFor="pPhone">رقم الجوال الرسمي</Label>
              <PhoneInput value={phone} onChange={setPhone} error={!!err} id="pPhone" />
            </div>

            <div>
              <Label req htmlFor="pPass">كلمة المرور</Label>
              <TextInput id="pPass" type="password" placeholder="8 أحرف أو أرقام على الأقل" value={pass} onChange={setPass} />
            </div>

            <div>
              <Label req htmlFor="providerType">نوع مزود الخدمة</Label>
              <select
                id="providerType"
                value={providerTypeId}
                onChange={(e) => setProviderTypeId(e.target.value)}
                disabled={providerTypes.status !== 'ready'}
                className="w-full min-h-[44px] rounded-[4px] border border-[#9DA4AE] bg-white px-3.5 text-[#161616] text-sm font-normal outline-none transition-colors duration-150 hover:border-[#384250] focus:border-[#1B8354] focus:ring-2 focus:ring-[#1B8354]/15 disabled:bg-[#F3F4F6] disabled:text-[#9DA4AE] disabled:cursor-wait"
              >
                <option value="">
                  {providerTypes.status === 'loading' ? 'جارٍ تحميل أنواع مزودي الخدمة…' : 'اختر نوع مزود الخدمة'}
                </option>
                {providerTypes.list.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {providerTypes.status === 'error' && (
                <div className="mt-2.5">
                  <ErrorBanner err={providerTypes.err} />
                  <SecondaryBtn onClick={loadProviderTypes} className="w-full">
                    إعادة تحميل أنواع مزودي الخدمة
                  </SecondaryBtn>
                </div>
              )}

              {providerTypes.status === 'ready' && providerTypes.list.length === 0 && (
                <div className="mt-2.5">
                  <InfoBanner>لا توجد أنواع مزودي خدمة متاحة حالياً — أعد المحاولة لاحقاً.</InfoBanner>
                  <SecondaryBtn onClick={loadProviderTypes} className="w-full">
                    إعادة المحاولة
                  </SecondaryBtn>
                </div>
              )}
            </div>

            <div>
              <Label req htmlFor="bizTitle">اسم النشاط أو المحطة (10–50 حرفاً)</Label>
              <TextInput id="bizTitle" placeholder="مثال: وكالة الأمل لتوزيع الغاز — المسبح" value={name} onChange={setName} />
            </div>

            <div>
              <Label htmlFor="bizDesc">الوصف والحي التابع له بمدينة تعز (اختياري)</Label>
              <textarea
                id="bizDesc"
                placeholder="تحديد موقع المركز، المديرية، وطبيعة التوريد..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                className="w-full rounded-[4px] border border-[#9DA4AE] bg-white p-3.5 text-sm text-[#161616] placeholder:text-[#6C737F] outline-none transition-colors duration-150 hover:border-[#384250] focus:border-[#1B8354] focus:ring-2 focus:ring-[#1B8354]/15"
              />
            </div>

            <div>
              <Label req>ساعات العمل الرسمية لاستقبال المواطنين</Label>
              <div className="grid grid-cols-2 gap-3" dir="ltr">
                <div>
                  <span className="block text-xs font-medium text-[#6C737F] mb-1">وقت البدء (ص)</span>
                  <TextInput type="time" value={startAt} onChange={setStartAt} className="text-center font-mono" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-[#6C737F] mb-1">وقت الإغلاق (م)</span>
                  <TextInput type="time" value={endAt} onChange={setEndAt} className="text-center font-mono" />
                </div>
              </div>
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="register_provider"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading} className="mt-6">
              تقديم طلب اعتماد الوكالة ومتابعة التحقق
            </PrimaryBtn>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#6C737F]">
            لديك حساب مسجل بالفعل؟{' '}
            <button onClick={() => go('login')} className="font-semibold text-[#1B8354] hover:underline cursor-pointer">
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
