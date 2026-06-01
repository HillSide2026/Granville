export const iconRegistry = {
  // --- Brand ---
  'brand-mark': '/icons/brand/mark.svg',

  // --- Domain icons (FinPack: Banking & Finance / Analytics) ---
  wallet: '/icons/banking/wallet.svg',
  bank: '/icons/banking/bank.svg',
  'payment-flow': '/icons/payment/payments-transactions.svg',
  analytics: '/icons/analytics/browser-web-graph-analitycs.svg',
  shield: '/icons/security/shield-protection-secure-check.svg',
  compliance: '/icons/security/fingerprint-bio-protection.svg',

  // --- Navigation & settings ---
  settings: '/icons/setting/settings-cog.svg',
  bell: '/icons/notification/bell-notifications.svg',
  'user-settings': '/icons/user/user-profile-setting-cog.svg',
  palette: '/icons/edit/graphic-tablet-draw.svg',
  'more-horizontal': '/icons/setting/settings-dot-horizontal.svg',
  menu: '/icons/menu/horizontal-lines.svg',
  'panel-left': '/icons/menu/horizontal-lines.svg',

  // --- Users ---
  users: '/icons/user/group-user.svg',
  'user-add': '/icons/user/user-profile-add-plus.svg',

  // --- Auth ---
  login: '/icons/log/login-arrow.svg',
  logout: '/icons/log/exit-log-out.svg',
  loader: '/icons/arrow/refresh-rotate-arrows.svg',

  // --- Finance features ---
  budget: '/icons/payment/credit-card-check-done.svg',
  'credit-card': '/icons/payment/credit-card-pos.svg',
  'credit-cards': '/icons/payment/credit-cards.svg',
  'conversion-exchange': '/icons/banking/conversion-exchange.svg',
  'trending-up': '/icons/analytics/business-chart-line.svg',

  // --- Actions ---
  plus: '/icons/plus/add-plus.svg',
  'plus-circle': '/icons/plus/add-plus-circle.svg',
  edit: '/icons/edit/edit-pen.svg',
  delete: '/icons/delete/bin-delete-remove.svg',
  x: '/icons/cross/cross-remove-close.svg',
  minus: '/icons/minus/minus-square.svg',
  refresh: '/icons/arrow/refresh-rotate-arrows.svg',

  // --- Arrows ---
  'arrow-right': '/icons/arrow/arrow-right.svg',
  'arrow-left': '/icons/arrow/arrow-left.svg',
  'arrow-up': '/icons/arrow/arrow-up.svg',
  'arrow-down': '/icons/arrow/arrow-down.svg',
  'chevron-right': '/icons/arrow/small-arrow-right.svg',
  'chevron-left': '/icons/arrow/small-arrow-left.svg',
  'chevron-up': '/icons/arrow/small-arrow-up.svg',
  'chevron-down': '/icons/arrow/small-arrow-down.svg',
  'chevrons-up-down': '/icons/arrow/arrow-arrows-up-down.svg',
  'double-arrow-left': '/icons/arrow/double-arrow-left.svg',
  'double-arrow-right': '/icons/arrow/double-arrow-right.svg',

  // --- UI states ---
  check: '/icons/check/checkmark.svg',
  'circle-check': '/icons/check/circle-check.svg',
  circle: '/icons/check/check-circle.svg',
  eye: '/icons/eye/eye-open-show-visible.svg',
  'eye-off': '/icons/eye/eye-closed-remove.svg',
  search: '/icons/search/magnifier-search.svg',
  calendar: '/icons/calendar/calendar-lined.svg',

  // --- Appearance ---
  moon: '/icons/theme/weather-moon.svg',
  sun: '/icons/theme/weather-sun.svg',
  laptop: '/icons/device/computer-case-monitor.svg',

  // --- Misc ---
  question: '/icons/question/ask-circle.svg',
  telescope: '/icons/target/target.svg',
} as const

export type IconName = keyof typeof iconRegistry
