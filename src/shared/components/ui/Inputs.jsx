export function Label({ children, req, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[14px] leading-5 font-medium text-[#161616] mb-2 mt-4 first:mt-0">
      {children} {req && <span className="text-[#B42318] font-semibold">*</span>}
    </label>
  )
}

export function PhoneInput({ value, onChange, error, id = 'phone' }) {
  return (
    <div className="flex gap-2">
      <span
        className="flex items-center justify-center rounded-[4px] border border-[#9DA4AE] bg-[#F3F4F6] px-3.5 text-sm font-medium font-mono text-[#161616] select-none"
        dir="ltr"
      >
        +967
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
        placeholder="7XXXXXXXX"
        dir="ltr"
        className={`flex-1 min-h-[44px] rounded-[4px] border bg-white px-3.5 text-left font-mono text-base font-medium text-[#161616] outline-none transition-colors duration-150 placeholder:text-[#6C737F] placeholder:font-sans focus:ring-2 ${
          error
            ? 'border-[#B42318] bg-[#FEF3F2]/40 focus:border-[#B42318] focus:ring-[#B42318]/15'
            : 'border-[#9DA4AE] hover:border-[#384250] focus:border-[#1B8354] focus:ring-[#1B8354]/15'
        }`}
      />
    </div>
  )
}

export function TextInput({ id, type = 'text', placeholder, value, onChange, className = '', error, ...props }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full min-h-[44px] rounded-[4px] border bg-white px-3.5 text-[#161616] text-sm font-normal outline-none transition-colors duration-150 placeholder:text-[#6C737F] focus:ring-2 disabled:bg-[#F3F4F6] disabled:text-[#9DA4AE] ${
        error
          ? 'border-[#B42318] bg-[#FEF3F2]/40 focus:border-[#B42318] focus:ring-[#B42318]/15'
          : 'border-[#9DA4AE] hover:border-[#384250] focus:border-[#1B8354] focus:ring-[#1B8354]/15'
      } ${className}`}
      {...props}
    />
  )
}
