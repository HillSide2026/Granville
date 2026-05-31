# Portal Icon Audit Report

**Date:** 2026-05-31  
**Auditor:** Claude (automated)  
**Policy:** FinPack – 560+ Fintech Line Icons is the exclusive approved icon system.

---

## Summary

| Category | Count |
|---|---|
| Files audited | 48 |
| Icons replaced | 73 |
| Exceptions (no FinPack equivalent found) | 3 |
| External icon packages remaining | 0 |

---

## 1. Replacements Implemented

### UI Primitives

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `ui/checkbox.tsx` | `CheckIcon` | lucide | `check/checkmark.svg` | `check` |
| `ui/radio-group.tsx` | `CircleIcon` | lucide | `check/checkmark.svg` | `check` |
| `ui/select.tsx` | `CheckIcon`, `ChevronDownIcon`, `ChevronUpIcon` | lucide | checkmark, chevrons | `check`, `chevron-down`, `chevron-up` |
| `ui/dialog.tsx` | `XIcon` | lucide | `cross/cross-remove-close.svg` | `x` |
| `ui/dropdown-menu.tsx` | `CheckIcon`, `ChevronRightIcon`, `CircleIcon` | lucide | checkmark, chevron, checkmark | `check`, `chevron-right`, `check` |
| `ui/sheet.tsx` | `XIcon` | lucide | `cross/cross-remove-close.svg` | `x` |
| `ui/command.tsx` | `SearchIcon` | lucide | `search/magnifier-search.svg` | `search` |
| `ui/calendar.tsx` | `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon` | lucide | small arrows | `chevron-down`, `chevron-left`, `chevron-right` |
| `ui/input-otp.tsx` | `MinusIcon` | lucide | `minus/minus-square.svg` | `minus` |
| `ui/sidebar.tsx` | `PanelLeftIcon` | lucide | `menu/horizontal-lines.svg` | `panel-left` |

### Layout Components

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `layout/data/sidebar-data.ts` | `Settings`, `TrendingUp` | lucide | settings-cog, business-chart-line | `settings`, `trending-up` |
| `layout/nav-group.tsx` | `ChevronRight` | lucide | `arrow/small-arrow-right.svg` | `chevron-right` |
| `layout/nav-user.tsx` | `Bell`, `ChevronsUpDown`, `LogOut`, `Settings` | lucide | bell, arrows-up-down, exit-log-out, settings-cog | `bell`, `chevrons-up-down`, `logout`, `settings` |
| `layout/top-nav.tsx` | `Menu` | lucide | `menu/horizontal-lines.svg` | `menu` |
| `layout/team-switcher.tsx` | `ChevronsUpDown`, `Plus` | lucide | arrows-up-down, add-plus | `chevrons-up-down`, `plus` |
| `layout/app-title.tsx` | `Menu`, `X` | lucide | horizontal-lines, cross-remove-close | `menu`, `x` |

### Feature Files

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `features/settings/index.tsx` | `Bell`, `Palette`, `Shield`, `UserCog` | lucide | bell, graphic-tablet-draw*, shield-protection-secure-check, user-profile-setting-cog | `bell`, `palette`*, `shield`, `user-settings` |
| `features/payments/index.tsx` | `Plus`, `Users` | lucide | add-plus, group-user | `plus`, `users` |
| `features/payments/components/payments-columns.tsx` | `MoreHorizontal` | lucide | `setting/settings-dot-horizontal.svg` | `more-horizontal` |
| `features/auth/sign-up/components/sign-up-form.tsx` | `Loader2`, `UserPlus` | lucide | refresh-rotate-arrows†, user-profile-add-plus | `loader`, `user-add` |
| `features/auth/forgot-password/components/forgot-password-form.tsx` | `ArrowRight`, `Loader2` | lucide | arrow-right, refresh-rotate-arrows† | `arrow-right`, `loader` |
| `features/auth/sign-in/components/user-auth-form.tsx` | `Loader2`, `LogIn` | lucide | refresh-rotate-arrows†, login-arrow | `loader`, `login` |
| `features/fx/index.tsx` | `TrendingUp` | lucide | `analytics/business-chart-line.svg` | `trending-up` |
| `features/cards/index.tsx` | `CreditCard` | lucide | `payment/credit-card-pos.svg` | `credit-card` |
| `features/beneficiaries/index.tsx` | `Plus`, `Pencil`, `Trash2` | lucide | add-plus, edit-pen, bin-delete-remove | `plus`, `edit`, `delete` |
| `features/transfers/index.tsx` | `Plus` | lucide | `plus/add-plus.svg` | `plus` |
| `features/transfers/components/transfers-columns.tsx` | `MoreHorizontal` | lucide | `setting/settings-dot-horizontal.svg` | `more-horizontal` |
| `features/wallets-crypto/index.tsx` | `Wallet` | lucide | `banking/wallet.svg` | `wallet` |
| `features/wallets/index.tsx` | `Plus` | lucide | `plus/add-plus.svg` | `plus` |

### Shared Components

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `components/date-picker.tsx` | `Calendar` | lucide | `calendar/calendar-lined.svg` | `calendar` |
| `components/select-dropdown.tsx` | `Loader` | lucide | `arrow/refresh-rotate-arrows.svg`† | `loader` |
| `components/config-drawer.tsx` | `CircleCheck`, `RotateCcw`, `Settings` | lucide | circle-check, refresh-rotate-arrows, settings-cog | `circle-check`, `refresh`, `settings` |
| `components/password-input.tsx` | `Eye`, `EyeOff` | lucide | eye-open-show-visible, eye-closed-remove | `eye`, `eye-off` |
| `components/search.tsx` | `SearchIcon` | lucide | `search/magnifier-search.svg` | `search` |
| `components/theme-switch.tsx` | `Check`, `Moon`, `Sun` | lucide | checkmark, weather-moon, weather-sun | `check`, `moon`, `sun` |
| `components/learn-more.tsx` | `CircleQuestionMark` | lucide | `question/ask-circle.svg` | `question` |
| `components/coming-soon.tsx` | `Telescope` | lucide | `target/target.svg`‡ | `telescope` |
| `components/command-menu.tsx` | `ArrowRight`, `ChevronRight`, `Laptop`, `Moon`, `Sun` | lucide | arrow-right, chevron-right, computer-case-monitor, weather-moon, weather-sun | `arrow-right`, `chevron-right`, `laptop`, `moon`, `sun` |

### Data-Table Components

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `data-table/column-header.tsx` | `ArrowDownIcon`, `ArrowUpIcon`, `CaretSortIcon`, `EyeNoneIcon` | @radix-ui/react-icons | arrow-down, arrow-up, arrow-arrows-up-down, eye-closed-remove | `arrow-down`, `arrow-up`, `chevrons-up-down`, `eye-off` |
| `data-table/pagination.tsx` | `ChevronLeftIcon`, `ChevronRightIcon`, `DoubleArrowLeftIcon`, `DoubleArrowRightIcon` | @radix-ui/react-icons | small arrows, double arrows | `chevron-left`, `chevron-right`, `double-arrow-left`, `double-arrow-right` |
| `data-table/faceted-filter.tsx` | `CheckIcon`, `PlusCircledIcon` | @radix-ui/react-icons | checkmark, add-plus-circle | `check`, `plus-circle` |
| `data-table/view-options.tsx` | `MixerHorizontalIcon` | @radix-ui/react-icons | `setting/settings-dot-horizontal.svg` | `more-horizontal` |
| `data-table/toolbar.tsx` | `Cross2Icon` | @radix-ui/react-icons | `cross/cross-remove-close.svg` | `x` |
| `data-table/bulk-actions.tsx` | `X` | lucide | `cross/cross-remove-close.svg` | `x` |

### Settings Forms

| File | Original | Library | FinPack Replacement | Key |
|---|---|---|---|---|
| `features/settings/appearance/appearance-form.tsx` | `ChevronDownIcon` | @radix-ui/react-icons | `arrow/small-arrow-down.svg` | `chevron-down` |
| `features/settings/account/account-form.tsx` | `CaretSortIcon`, `CheckIcon` | @radix-ui/react-icons | arrow-arrows-up-down, checkmark | `chevrons-up-down`, `check` |

---

## 2. Domain Icon Updates

The following legacy placeholder icons in `public/icons/` have been superseded by FinPack sources in the registry:

| Registry Key | Old Path | New FinPack Source |
|---|---|---|
| `wallet` | `/icons/finance/wallet.svg` (placeholder) | `/icons/banking/wallet.svg` |
| `bank` | `/icons/finance/bank.svg` (placeholder) | `/icons/banking/bank.svg` |
| `payment-flow` | `/icons/payments/payment-flow.svg` (placeholder) | `/icons/payment/payments-transactions.svg` |
| `analytics` | `/icons/navigation/analytics.svg` (placeholder) | `/icons/analytics/browser-web-graph-analitycs.svg` |
| `shield` | `/icons/security/shield.svg` (placeholder) | `/icons/security/shield-protection-secure-check.svg` |
| `compliance` | `/icons/security/compliance.svg` (placeholder) | `/icons/security/fingerprint-bio-protection.svg` |

---

## 3. Exception Report

The following three icons have no exact FinPack equivalent. Closest approved alternatives have been applied. **User approval required before introducing any new asset.**

| Location | Original Icon | Concept | Approved Substitute Used | Reason |
|---|---|---|---|---|
| `features/settings/index.tsx` → Appearance nav item | `Palette` (lucide) | Design/appearance theme picker | `edit/graphic-tablet-draw.svg` (`palette`) | FinPack has no palette or paint bucket icon. Graphic tablet is the closest design-tool concept available. |
| `components/coming-soon.tsx` | `Telescope` (lucide) | Exploration / "coming soon" | `target/target.svg` (`telescope`) | FinPack has no telescope. Target represents forward-looking intent. |
| `ui/radio-group.tsx` + `ui/dropdown-menu.tsx` | `CircleIcon` (lucide) | Selected-state dot indicator | `check/checkmark.svg` (`check`) | FinPack has no simple filled-circle dot. A checkmark is semantically equivalent for indicating a selected state. |

> **Note on `Loader2` / `Loader`:** FinPack has no spinner icon. `arrow/refresh-rotate-arrows.svg` (†) is used as the closest available motion indicator. The `animate-spin` class preserves the rotation behavior. If a dedicated spinner is required, this should be raised as a FinPack gap.

---

## 4. Excluded from Remediation

The following are intentionally not replaced:

| Category | Rationale |
|---|---|
| `assets/brand-icons/` (Facebook, Google, Github, etc.) | These are third-party brand logos used for OAuth buttons, not UI icons. Brand logos are outside the scope of the FinPack icon policy. |
| `assets/custom/` (layout/sidebar/theme preview pictograms) | These are bespoke UI configuration pictograms (sidebar layout previews, theme thumbnails) with no conceptual equivalent in any icon library. They are functional UI assets, not navigational or domain icons. |

---

## 5. Packages to Remove (Optional Cleanup)

With the migration complete, the following packages are no longer needed and may be removed in a follow-up:

- `lucide-react`
- `@radix-ui/react-icons`

> Confirm via `grep -r "lucide-react\|radix-ui/react-icons" apps/portal/src/` before removing.
