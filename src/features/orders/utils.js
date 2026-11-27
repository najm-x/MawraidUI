// ═══════════ ثوابت وأدوات تنسيق وتحقق لميزة طلبات المستفيد — DGA Status Tags ═══════════

export const ORDER_STATUS_META = {
  pending: {
    label: 'قيد الانتظار',
    badgeClass: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    dotClass: 'bg-[#B54708]',
  },
  accepted: {
    label: 'مقبول',
    badgeClass: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    dotClass: 'bg-[#175CD3]',
  },
  completed: {
    label: 'مكتمل',
    badgeClass: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
    dotClass: 'bg-[#067647]',
  },
  rejected: {
    label: 'مرفوض',
    badgeClass: 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]',
    dotClass: 'bg-[#B42318]',
  },
  cancelled: {
    label: 'ملغي',
    badgeClass: 'bg-[#F3F4F6] text-[#4D5761] border-[#D2D6DB]',
    dotClass: 'bg-[#6C737F]',
  },
}

export const ORDER_STATUS_FILTERS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'rejected', label: 'مرفوض' },
  { value: 'cancelled', label: 'ملغي' },
]

export const CONSUMER_TYPE_OPTIONS = [
  {
    value: 'home',
    label: 'منزلي (رب أسرة)',
    shortLabel: 'منزلي',
    description: 'للحصة المنزلية السكنية',
  },
  {
    value: 'business',
    label: 'نشاط تجاري',
    shortLabel: 'نشاط تجاري',
    description: 'للمنشآت والمحلات الخدمية',
  },
  {
    value: 'driver',
    label: 'سائق مركبة',
    shortLabel: 'سائق',
    description: 'لمركبات النقل والأجرة',
  },
]

export const CONSUMER_TYPE_LABELS = {
  home: 'منزلي (رب أسرة)',
  business: 'نشاط تجاري',
  driver: 'سائق مركبة',
}

export const PAYMENT_METHOD_LABELS = {
  cash: 'نقداً عند الاستلام',
  wallet: 'المحفظة الإلكترونية',
}

export const PAYMENT_STATUS_META = {
  unpaid: {
    label: 'غير مدفوع',
    badgeClass: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
  },
  paid: {
    label: 'مدفوع',
    badgeClass: 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]',
  },
  refunded: {
    label: 'مسترد',
    badgeClass: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
  },
}

const GAZ_STOCK_TYPE_LABELS = {
  exchange: 'استبدال أسطوانات',
  refill: 'تعبئة فورية',
}

export function getOrderStatusMeta(status) {
  return (
    ORDER_STATUS_META[status] || {
      label: status || 'غير معروف',
      badgeClass: 'bg-[#F3F4F6] text-[#384250] border-[#D2D6DB]',
      dotClass: 'bg-[#6C737F]',
    }
  )
}

export function getPaymentStatusMeta(paymentStatus) {
  return (
    PAYMENT_STATUS_META[paymentStatus] || {
      label: paymentStatus || '—',
      badgeClass: 'bg-[#F3F4F6] text-[#384250] border-[#D2D6DB]',
    }
  )
}

export function formatConsumerType(type) {
  return CONSUMER_TYPE_LABELS[type] || type || '—'
}

export function formatPaymentMethod(method) {
  return PAYMENT_METHOD_LABELS[method] || method || '—'
}

export function formatOrderGazType(val) {
  if (!val) return null
  return GAZ_STOCK_TYPE_LABELS[String(val).trim().toLowerCase()] || String(val)
}

export function formatOrderAmount(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-US')
}

export function formatOrderPrice(p) {
  if (p === null || p === undefined || Number.isNaN(Number(p))) return '—'
  return Number(p).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function formatOrderDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function isSessionExpiredError(err) {
  return err?.status === 401 || err?.code === 1106
}

export function getUnitAvailableAmount(stock, unit) {
  if (!stock || !unit) return 0
  const balances = Array.isArray(stock.balances) ? stock.balances : []
  const balanceObj = balances.find((b) => b.unit_id === unit.id || b.unit === unit.name)
  if (balanceObj && balanceObj.amount !== undefined && balanceObj.amount !== null) {
    return Math.max(0, Math.floor(Number(balanceObj.amount) || 0))
  }
  const rate = Number(unit.rate)
  const available = Number(stock.available) || 0
  if (rate > 0) return Math.max(0, Math.floor(available / rate))
  return 0
}

export function getEnabledConsumerTypes(user) {
  const src = user?.consumer_profile || user?.consumer || user?.profile || user
  if (!src || typeof src !== 'object') return ['home', 'business', 'driver']

  const hasExplicitFlags =
    typeof src.is_home === 'boolean' ||
    typeof src.is_business === 'boolean' ||
    typeof src.is_driver === 'boolean'

  if (!hasExplicitFlags) return ['home', 'business', 'driver']

  const enabled = []
  if (src.is_home) enabled.push('home')
  if (src.is_business) enabled.push('business')
  if (src.is_driver) enabled.push('driver')

  return enabled.length > 0 ? enabled : ['home', 'business', 'driver']
}

export function validateCreateOrder({
  stockId,
  unitId,
  quantity,
  maxAvailable,
  addressId,
  consumerType,
  notes,
}) {
  if (!stockId) {
    return { code: 2000, message: 'معرّف المخزون غير صالح' }
  }
  const parsedUnitId = Number(unitId)
  if (!Number.isInteger(parsedUnitId) || parsedUnitId <= 0) {
    return { code: 2000, message: 'يرجى اختيار الوحدة المطلوبة' }
  }
  const parsedQty = Number(quantity)
  if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
    return { code: 1603, message: 'يجب أن تكون الكمية رقماً صحيحاً أكبر من صفر' }
  }
  if (typeof maxAvailable === 'number' && parsedQty > maxAvailable) {
    return { code: 1602, message: `الكمية المطلوبة تتجاوز المتاح حالياً (${maxAvailable})` }
  }
  if (!addressId || typeof addressId !== 'string') {
    return { code: 2000, message: 'يرجى اختيار عنوان التوصيل المحفوظ' }
  }
  if (!['home', 'business', 'driver'].includes(consumerType)) {
    return { code: 1802, message: 'يرجى اختيار صفة المستفيد' }
  }
  if (typeof notes === 'string' && notes.trim().length > 500) {
    return { code: 2000, message: 'الملاحظات يجب ألا تتجاوز 500 حرف' }
  }
  return null
}

export function validateCancelReason(reason) {
  if (typeof reason === 'string' && reason.trim().length > 500) {
    return { code: 2000, message: 'سبب الإلغاء يجب ألا يتجاوز 500 حرف' }
  }
  return null
}
