import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve(null)
    if (window.turnstile) return resolve(window.turnstile)

    let script = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (!script) {
      script = document.createElement('script')
      script.id = TURNSTILE_SCRIPT_ID
      script.src = TURNSTILE_SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const onScriptLoad = () => {
      if (window.turnstile) {
        resolve(window.turnstile)
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval)
            resolve(window.turnstile)
          }
        }, 50)
        setTimeout(() => {
          clearInterval(interval)
          if (window.turnstile) resolve(window.turnstile)
          else reject(new Error('Cloudflare Turnstile failed to initialize within timeout.'))
        }, 10000)
      }
    }

    script.addEventListener('load', onScriptLoad, { once: true })
    script.addEventListener('error', () => reject(new Error('Failed to load Cloudflare Turnstile script.')), { once: true })

    if (window.turnstile) {
      resolve(window.turnstile)
    }
  })
}

export const TurnstileWidget = forwardRef(function TurnstileWidget(
  {
    siteKey = '1x00000000000000000000AA',
    action,
    onVerify,
    onExpire,
    onError,
    theme = 'light',
    language = 'ar',
    className = '',
  },
  ref
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [loadError, setLoadError] = useState(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch (err) {
          console.warn('[Turnstile] Reset failed:', err)
        }
      }
    },
    getResponse: () => {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current)
      }
      return null
    },
    getWidgetId: () => widgetIdRef.current,
  }))

  useEffect(() => {
    let isCancelled = false

    loadTurnstileScript()
      .then((turnstile) => {
        if (isCancelled || !containerRef.current || !turnstile) return

        if (widgetIdRef.current) {
          try {
            turnstile.remove(widgetIdRef.current)
          } catch {}
          widgetIdRef.current = null
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: action || undefined,
          theme,
          language,
          callback: (token) => {
            if (!isCancelled && onVerify) onVerify(token)
          },
          'expired-callback': () => {
            if (!isCancelled && onExpire) onExpire()
          },
          'error-callback': (code) => {
            if (!isCancelled && onError) onError(code)
          },
        })
      })
      .catch((err) => {
        if (!isCancelled) {
          setLoadError(err.message)
          if (onError) onError(err)
        }
      })

    return () => {
      isCancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
        widgetIdRef.current = null
      }
    }
  }, [siteKey, action, theme, language])

  return (
    <div className={`my-3 flex flex-col items-center justify-center ${className}`}>
      <div ref={containerRef} className="cf-turnstile min-h-[65px] flex items-center justify-center" />
      {loadError && (
        <p className="mt-1 text-xs text-[#B42318] font-medium">
          تعذر تحميل نظام التحقق الأمني: {loadError}
        </p>
      )}
    </div>
  )
})

export default TurnstileWidget
