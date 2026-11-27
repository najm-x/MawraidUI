// ═══════════ شاشتَا استعادة وإعادة تعيين كلمة المرور ═══════════
import { useRef, useState } from 'react'
import { authApi } from '../../../services/api'
import { PHONE_RE } from '../../../shared/constants/regex'
import { Icons, BrandLogo, BackBtn, ErrorBanner, InfoBanner, Label, PhoneInput, TextInput, PrimaryBtn } from '../../../shared/components/ui'
import TurnstileWidget from '../components/TurnstileWidget'

export function Forgot({ go }) {
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const turnstileRef = useRef(null)

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    setInfo(null)
    if (!PHONE_RE.test(phone)) return setErr({ code: 2000, message: 'رقم الجوال غير صالح (9 أرقام تبدأ بـ 7)' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })
    setLoading(true)
    try {
      await authApi.forgetPassword(phone, turnstileToken)
      setInfo('تم إرسال رمز الاستعادة بنجاح عبر رسالة SMS — صالح لمدة 15 دقيقة')
      setTimeout(() => go('reset', { phone }), 1200)
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
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <BackBtn onClick={() => go('login')} label="تسجيل الدخول" />
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] border-t-4 border-t-[#DBA102] shadow-card p-6 sm:p-8 fade-in text-right">
          <div className="w-12 h-12 rounded-[8px] bg-[#FFFAEB] border border-[#FEDF89] text-[#B54708] flex items-center justify-center mb-4">
            <Icons.Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-[#1F2A37] mb-1.5">استعادة كلمة المرور</h1>
          <p className="text-xs sm:text-sm text-[#6C737F] mb-6 leading-relaxed">
            أدخل رقم هاتفك المسجل لاستلام رمز استعادة الحساب
          </p>

          <ErrorBanner err={err} />
          {info && <InfoBanner>{info}</InfoBanner>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label req htmlFor="forgotPhone">رقم الجوال المسجل في المنصة</Label>
              <PhoneInput value={phone} onChange={setPhone} error={!!err} id="forgotPhone" />
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="forget_password"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading} className="mt-6">
              إرسال رمز الاستعادة
            </PrimaryBtn>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center text-xs text-[#6C737F]">
            تذكرت كلمة المرور؟{' '}
            <button onClick={() => go('login')} className="font-semibold text-[#1B8354] hover:underline cursor-pointer">
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#6C737F] py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}

export function Reset({ go }) {
  const [key, setKey] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function submit(e) {
    if (e) e.preventDefault()
    setErr(null)
    if (!key.trim()) return setErr({ code: 2000, message: 'يرجى إدخال رمز الاستعادة المرسل إليك' })
    if (pass.length < 8) return setErr({ code: 2000, message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' })
    setLoading(true)
    try {
      await authApi.resetPassword(key.trim(), pass)
      go('login')
    } catch (e) {
      setErr(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dga-canvas-grid py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="cursor-pointer" onClick={() => go('home')}>
            <BrandLogo size="sm" />
          </div>
          <BackBtn onClick={() => go('forgot')} label="رجوع" />
        </div>

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] border-t-4 border-t-[#1B8354] shadow-card p-6 sm:p-8 fade-in text-right">
          <div className="w-12 h-12 rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#067647] flex items-center justify-center mb-4">
            <Icons.Shield className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-[#1F2A37] mb-1.5">تعيين كلمة مرور جديدة</h1>
          <p className="text-xs sm:text-sm text-[#6C737F] mb-6 leading-relaxed">
            أدخل رمز الاستعادة المرسل إلى رقمك، ثم اختر كلمة مرور جديدة قوية
          </p>

          <ErrorBanner err={err} />

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label req htmlFor="resetKey">رمز الاستعادة المرسل (SMS)</Label>
              <TextInput
                id="resetKey"
                placeholder="أدخل الرمز المستلم"
                value={key}
                onChange={setKey}
              />
            </div>

            <div>
              <Label req htmlFor="newPass">كلمة المرور الجديدة</Label>
              <div className="relative">
                <TextInput
                  id="newPass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="8 أحرف أو أرقام على الأقل"
                  value={pass}
                  onChange={setPass}
                  className="pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C737F] hover:text-[#161616] p-1 rounded-[4px] cursor-pointer"
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPass ? <Icons.EyeOff className="w-4 h-4" /> : <Icons.Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <PrimaryBtn type="submit" loading={loading} className="mt-6">
              حفظ كلمة المرور وتسجيل الدخول
            </PrimaryBtn>
          </form>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#6C737F] py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}
