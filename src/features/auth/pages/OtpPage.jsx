// ═══════════ شاشة التحقق OTP — POST /verify-phone + resend ═══════════
import { useEffect, useRef, useState } from 'react'
import { authApi } from '../../../services/api'
import { Icons, BrandLogo, BackBtn, ErrorBanner, InfoBanner, PrimaryBtn } from '../../../shared/components/ui'
import TurnstileWidget from '../components/TurnstileWidget'

export default function Otp({ go, phone }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [err, setErr] = useState(null)
  const [info, setInfo] = useState(`تم إرسال رمز التحقق المكون من 6 أرقام إلى الرقم +967 ${phone || ''}`)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const inputs = useRef([])
  const turnstileRef = useRef(null)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 10)
    return () => clearInterval(t)
  }, [countdown])

  function onDigit(i, v) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) {
      inputs.current[i + 1]?.focus()
    }
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  async function verify(e) {
    if (e) e.preventDefault()
    setErr(null)
    const code = digits.join('')
    if (code.length !== 6) return setErr({ code: 2000, message: 'يرجى إدخال رمز التحقق كاملاً (6 أرقام)' })
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })
    setLoading(true)
    try {
      await authApi.verifyPhone(phone, code, turnstileToken)
      go('login')
    } catch (e) {
      setErr(e)
    } finally {
      setTurnstileToken(null)
      turnstileRef.current?.reset()
      setLoading(false)
    }
  }

  async function resend() {
    setErr(null)
    if (!turnstileToken) return setErr({ code: 2000, message: 'يرجى إكمال التحقق الأمني أولاً' })
    try {
      await authApi.resendOtp(phone, turnstileToken)
      setInfo('تم إرسال رمز تحقق جديد بنجاح إلى هاتفك')
      setCountdown(60)
    } catch (e) {
      setErr(e)
      setCountdown(60)
    } finally {
      setTurnstileToken(null)
      turnstileRef.current?.reset()
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

        <div className="bg-white rounded-[16px] border border-[#E5E7EB] border-t-4 border-t-[#1B8354] shadow-card p-6 sm:p-8 fade-in text-center">
          <div className="w-12 h-12 mx-auto rounded-[8px] bg-[#F3FCF6] border border-[#B8EACB] text-[#1B8354] flex items-center justify-center mb-4">
            <Icons.Shield className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-[#1F2A37] mb-1.5">التحقق من رقم الجوال</h1>
          <p className="text-xs sm:text-sm text-[#6C737F] mb-6 leading-relaxed">
            خطوة أمان أساسية لتأكيد ملكية رقم الهاتف وإصدار بطاقة المستفيد الرقمية
          </p>

          <div className="text-right">
            <InfoBanner>{info}</InfoBanner>
            <ErrorBanner err={err} />
          </div>

          <form onSubmit={verify} className="mt-6 space-y-6">
            <div>
              <label className="block text-xs font-medium text-[#384250] mb-3">أدخل رمز التحقق (6 أرقام):</label>
              <div className="flex gap-2 sm:gap-2.5 justify-center" dir="ltr">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    value={d}
                    inputMode="numeric"
                    maxLength={1}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    onChange={(e) => onDigit(i, e.target.value)}
                    className={`w-12 h-14 sm:w-13 sm:h-15 rounded-[4px] border text-center text-xl sm:text-2xl font-bold font-mono outline-none transition-colors duration-150 focus:ring-2 focus:ring-[#1B8354]/15 ${
                      d
                        ? 'border-[#1B8354] bg-[#F3FCF6] text-[#074D31]'
                        : 'border-[#9DA4AE] bg-white hover:border-[#384250] focus:border-[#1B8354]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="verify_phone"
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />

            <PrimaryBtn type="submit" loading={loading} disabled={!turnstileToken || loading}>
              تأكيد وتفعيل الحساب
            </PrimaryBtn>
          </form>

          <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
            <button
              onClick={resend}
              disabled={countdown > 0}
              className="w-full min-h-[42px] px-4 rounded-[4px] border border-[#D2D6DB] bg-white hover:bg-[#F3F4F6] text-[#161616] text-xs font-medium flex items-center justify-center gap-2 dga-btn-motion disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Icons.Clock className="w-4 h-4 text-[#6C737F]" />
              <span>{countdown > 0 ? `إعادة الإرسال بعد (${countdown} ثانية)` : 'إعادة إرسال رمز التحقق'}</span>
            </button>
          </div>

          <div className="mt-5 dga-callout-warning p-3.5 text-xs text-[#1F2A37] leading-6 text-right">
            <div className="font-semibold text-[#B54708] mb-0.5">تعليمات أمان:</div>
            • صلاحية الرمز 5 دقائق • بحد أقصى 3 محاولات خاطئة قبل طلب رمز جديد.
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#6C737F] py-4">
        منصة موارد — مدينة تعز
      </div>
    </div>
  )
}
