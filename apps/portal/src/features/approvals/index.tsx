import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import type { IconName } from '@/components/ui/icon-registry'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  approvalChecks,
  flaggedItems,
  formatCad,
  runLines,
  runSummary,
} from './data'

type CheckTone = 'ok' | 'flag'

const toneMarker: Record<CheckTone, string> = {
  ok: 'bg-[var(--portal-status-completed-bg)] text-[var(--portal-status-completed-text)] ring-[var(--portal-status-completed-border)]',
  flag: 'bg-[var(--portal-status-review-bg)] text-[var(--portal-status-review-text)] ring-[var(--portal-status-review-border)]',
}

function CheckMarker({ tone, icon }: { tone: CheckTone; icon: IconName }) {
  return (
    <span
      className={cn(
        'flex size-9 items-center justify-center rounded-full ring-1',
        toneMarker[tone]
      )}
    >
      <Icon name={icon} className='size-4' />
    </span>
  )
}

function LineCheckBadge({ status }: { status: 'ok' | 'new' | 'up' }) {
  if (status === 'ok')
    return <Badge variant='completed'>Paid before</Badge>
  if (status === 'new') return <Badge variant='review'>New recipient</Badge>
  return <Badge variant='review'>Amount +40%</Badge>
}

export function Approvals() {
  const [approved, setApproved] = useState(false)

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='portal-page'>
        {/* ── Page header / decision ─────────────────────────────── */}
        <div className='portal-page-header flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div>
            <p className='text-label text-[var(--portal-status-review-text)]'>
              Payment run · Awaiting your approval
            </p>
            <h1 className='mt-2 text-h2'>August contractor run</h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Prepared by{' '}
              <span className='text-foreground'>Sarah Okonkwo</span> · today at
              9:14&nbsp;AM · covers August 2026
            </p>
          </div>

          {!approved && (
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive'
                onClick={() =>
                  toast('Run rejected', {
                    description: 'The whole run is cancelled and Sarah is notified.',
                  })
                }
              >
                Reject
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  toast('Sent back to Sarah', {
                    description: 'She can revise the run and resubmit it for approval.',
                  })
                }
              >
                Send back to Sarah
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size='sm'>
                    <Icon name='circle-check' className='mr-1 h-4 w-4' />
                    Approve &amp; send
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve and send this run?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This releases{' '}
                      <span className='font-medium text-foreground'>
                        {runLines.length} payments
                      </span>{' '}
                      totalling{' '}
                      <span className='font-medium tabular-nums text-foreground'>
                        {formatCad(runSummary.total)}
                      </span>{' '}
                      across {runSummary.currencies} currencies at the locked
                      rates. This can&rsquo;t be undone once sent.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setApproved(true)
                        toast.success('Run approved — 18 payments queued', {
                          description: 'Recipients will be paid in their own currency.',
                        })
                      }}
                    >
                      Yes, approve &amp; send
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {approved && (
            <Badge variant='completed' className='h-8 gap-1.5 px-3 text-sm'>
              <Icon name='circle-check' className='size-4' />
              Approved · GRV-RUN-2608-4471
            </Badge>
          )}
        </div>

        {/* ── Summary strip ──────────────────────────────────────── */}
        <Card className='mb-6'>
          <CardContent className='grid grid-cols-2 gap-6 md:grid-cols-4'>
            <div>
              <p className='text-label text-muted-foreground'>Total to send</p>
              <p className='mt-1 text-h3 font-semibold tabular-nums'>
                {formatCad(runSummary.total)}
              </p>
            </div>
            <div>
              <p className='text-label text-muted-foreground'>Payees</p>
              <p className='mt-1 text-h3 font-semibold tabular-nums'>
                {runLines.length}
              </p>
            </div>
            <div>
              <p className='text-label text-muted-foreground'>Currencies</p>
              <p className='mt-1 text-h3 font-semibold tabular-nums'>
                {runSummary.currencies}
              </p>
            </div>
            <div>
              <p className='text-label text-muted-foreground'>Balance after</p>
              <p className='mt-1 text-h3 font-semibold tabular-nums text-muted-foreground'>
                {formatCad(runSummary.balanceAfter)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Why this run is correct ────────────────────────────── */}
        <div className='portal-section'>
          <div className='mb-3 flex items-baseline justify-between gap-4'>
            <h2 className='text-h3'>Why this run is correct</h2>
            <span className='text-sm text-muted-foreground'>
              6 checks · 2 need a look
            </span>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {approvalChecks.map((c) => (
              <Card key={c.label}>
                <CardContent className='flex gap-3'>
                  <CheckMarker tone={c.tone} icon={c.icon} />
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{c.label}</span>
                      <Badge
                        variant={c.tone === 'ok' ? 'completed' : 'review'}
                        className='ml-auto'
                      >
                        {c.state}
                      </Badge>
                    </div>
                    <p className='mt-1.5 text-sm text-muted-foreground'>
                      {c.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Needs your eye ─────────────────────────────────────── */}
        {!approved && (
          <Card className='portal-section border-[var(--portal-status-review-border)] bg-[var(--portal-status-review-bg)]/40'>
            <CardContent className='p-0'>
              <div className='flex items-center gap-2 px-5 pt-4 pb-3'>
                <Icon
                  name='shield'
                  className='size-4 text-[var(--portal-status-review-text)]'
                />
                <span className='font-medium'>
                  Needs your eye before you approve
                </span>
                <span className='text-sm text-[var(--portal-status-review-text)]'>
                  3 items
                </span>
              </div>
              {flaggedItems.map((f) => (
                <div key={f.name}>
                  <Separator />
                  <div className='flex flex-col gap-1 px-5 py-3 md:flex-row md:items-center md:gap-4'>
                    <div className='md:w-48 md:shrink-0'>
                      <div className='font-medium'>{f.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {f.role}
                      </div>
                    </div>
                    <p className='flex-1 text-sm text-muted-foreground'>
                      {f.why}{' '}
                      <span className='text-foreground italic'>{f.note}</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── The full run ───────────────────────────────────────── */}
        <div className='portal-section'>
          <h2 className='mb-3 text-h3'>The full run</h2>
          <Card>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payee</TableHead>
                    <TableHead className='text-right'>They receive</TableHead>
                    <TableHead className='text-right'>Costs you</TableHead>
                    <TableHead>Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runLines.map((line) => (
                    <TableRow key={line.name}>
                      <TableCell>
                        <div className='flex min-w-0 items-center gap-3'>
                          <span
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ring-1',
                              line.status === 'ok'
                                ? 'bg-muted text-muted-foreground ring-border'
                                : 'bg-[var(--portal-status-review-bg)] text-[var(--portal-status-review-text)] ring-[var(--portal-status-review-border)]'
                            )}
                          >
                            {line.initials}
                          </span>
                          <div className='min-w-0'>
                            <div className='font-medium'>{line.name}</div>
                            <div className='text-xs text-muted-foreground'>
                              {line.role} ·{' '}
                              <span
                                className={
                                  line.status === 'ok'
                                    ? ''
                                    : 'text-[var(--portal-status-review-text)]'
                                }
                              >
                                {line.evidence}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <span className='tabular-nums'>{line.localAmount}</span>{' '}
                        <span className='text-xs text-muted-foreground'>
                          {line.currency}
                        </span>
                      </TableCell>
                      <TableCell className='text-right font-semibold tabular-nums'>
                        {formatCad(line.costCad)}
                      </TableCell>
                      <TableCell>
                        <LineCheckBadge status={line.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ── Record reassurance ─────────────────────────────────── */}
        <div className='mt-6 flex items-start gap-3 rounded-lg border bg-card p-4'>
          <Icon name='reconciliation' className='mt-0.5 size-4 text-primary' />
          <p className='text-sm text-muted-foreground'>
            When you approve,{' '}
            <span className='text-foreground'>
              Granville moves the money and records every payment
            </span>{' '}
            — each person is paid in their own currency, and you get one
            reconciled statement. You approve the run; the licences, rails, and
            FX are ours.
          </p>
        </div>
      </Main>
    </>
  )
}
