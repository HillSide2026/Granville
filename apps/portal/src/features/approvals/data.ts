import type { IconName } from '@/components/ui/icon-registry'

/** Mock data for the payment-run approval screen. Stands in for the
 *  PaymentRun aggregate + evidence layer until the backend ships them. */

export function formatCad(n: number): string {
  return `CA$${n.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const runSummary = {
  total: 42317.4,
  currencies: 6,
  balanceAfter: 19162.6,
}

export type ApprovalCheck = {
  label: string
  icon: IconName
  tone: 'ok' | 'flag'
  state: string
  detail: string
}

export const approvalChecks: ApprovalCheck[] = [
  {
    label: 'Recipients',
    icon: 'users',
    tone: 'flag',
    state: '2 new',
    detail:
      '16 of 18 have been paid before. 2 new recipients were added by Sarah — bank details verified today.',
  },
  {
    label: 'Amounts',
    icon: 'trending-up',
    tone: 'flag',
    state: '1 changed',
    detail:
      '17 amounts match last month. 1 is up 40% — Rahul Mehta’s retainer, against a signed new scope.',
  },
  {
    label: 'Exchange rates',
    icon: 'conversion-exchange',
    tone: 'ok',
    state: 'Locked',
    detail:
      'All 6 currencies locked at mid-market + 0.5% for 41 minutes. No hidden spread.',
  },
  {
    label: 'Balance',
    icon: 'wallet',
    tone: 'ok',
    state: 'Covered',
    detail:
      'CA$42,317.40 of CA$61,480.00 available. Nothing else is scheduled against it today.',
  },
  {
    label: 'Duplicates',
    icon: 'circle-check',
    tone: 'ok',
    state: 'None',
    detail:
      'No recipient appears twice, and this run doesn’t repeat any payment already made in July.',
  },
  {
    label: 'Compliance',
    icon: 'shield',
    tone: 'ok',
    state: 'Cleared',
    detail:
      'All 18 recipients screened against sanctions and PEP lists. No matches to review.',
  },
]

export const flaggedItems = [
  {
    name: 'Rahul Mehta',
    role: 'Senior developer · India',
    why: 'Retainer up 40% — US$3,458 → US$4,841.',
    note: 'Sarah: “New retainer scope, signed SOW attached.”',
  },
  {
    name: 'Kseniya Volkova',
    role: 'Motion designer · Serbia',
    why: 'New recipient. First payment — EUR account verified today.',
    note: 'Sarah: “Replacing Andrej, same rate.”',
  },
  {
    name: 'Grace Mensah',
    role: 'Account manager · remote',
    why: 'New recipient. First payment — USD account verified today.',
    note: 'Sarah: “Started July, first full month.”',
  },
]

export type RunLine = {
  name: string
  role: string
  initials: string
  localAmount: string
  currency: string
  costCad: number
  status: 'ok' | 'new' | 'up'
  evidence: string
}

export const runLines: RunLine[] = [
  { name: 'Amara Okafor', role: 'Brand designer · Nigeria', initials: 'AO', localAmount: '₦2,507,000', currency: 'NGN', costCad: 2180.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Rahul Mehta', role: 'Senior developer · India', initials: 'RM', localAmount: 'US$4,841.36', currency: 'USD', costCad: 6632.0, status: 'up', evidence: 'Up 40% vs July · signed SOW' },
  { name: 'Kseniya Volkova', role: 'Motion designer · Serbia', initials: 'KV', localAmount: '€1,999.20', currency: 'EUR', costCad: 2940.0, status: 'new', evidence: 'New recipient · verified today' },
  { name: 'Sofia Duarte', role: 'Copywriter · Brazil', initials: 'SD', localAmount: 'R$7,040.00', currency: 'BRL', costCad: 1760.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Mateo Santos', role: 'QA engineer · Philippines', initials: 'MS', localAmount: '₱58,220', currency: 'PHP', costCad: 1420.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Priya Nair', role: 'Developer · India', initials: 'PN', localAmount: '₹125,050', currency: 'INR', costCad: 2050.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Chinedu Balogun', role: 'Developer · Nigeria', initials: 'CB', localAmount: '₦2,277,000', currency: 'NGN', costCad: 1980.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Bianca Rossi', role: 'Illustrator · Italy', initials: 'BR', localAmount: '€1,570.80', currency: 'EUR', costCad: 2310.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Arjun Kapoor', role: 'Developer · India', initials: 'AK', localAmount: '₹136,640', currency: 'INR', costCad: 2240.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Grace Mensah', role: 'Account manager · remote', initials: 'GM', localAmount: 'US$2,321.40', currency: 'USD', costCad: 3180.0, status: 'new', evidence: 'New recipient · verified today' },
  { name: 'Diego Fernández', role: 'Developer · Argentina', initials: 'DF', localAmount: 'US$2,014.80', currency: 'USD', costCad: 2760.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Ana Lima', role: 'Designer · Brazil', initials: 'AL', localAmount: 'R$6,160.00', currency: 'BRL', costCad: 1540.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Ravi Deshpande', role: 'DevOps · India', initials: 'RD', localAmount: '₹147,010', currency: 'INR', costCad: 2410.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Joy Okeke', role: 'Social lead · Nigeria', initials: 'JO', localAmount: '₦1,840,000', currency: 'NGN', costCad: 1600.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Marco Bianchi', role: 'Developer · Italy', initials: 'MB', localAmount: '€2,053.60', currency: 'EUR', costCad: 3020.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Reena Iyer', role: 'Content · India', initials: 'RI', localAmount: '₹71,980', currency: 'INR', costCad: 1180.0, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Paolo Cruz', role: 'Designer · Philippines', initials: 'PC', localAmount: '₱54,751', currency: 'PHP', costCad: 1335.4, status: 'ok', evidence: 'Verified · matches July' },
  { name: 'Tomas Silva', role: 'Developer · Portugal', initials: 'TS', localAmount: '€1,210.40', currency: 'EUR', costCad: 1780.0, status: 'ok', evidence: 'Verified · matches July' },
]
