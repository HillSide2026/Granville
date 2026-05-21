import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuditEvent, Customer } from '@/types/granville'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  created: 'secondary',
  restricted: 'outline',
  closed: 'destructive',
}

export function Compliance() {
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/admin/customers').then((r) => r.data),
  })

  const { data: auditEvents = [], isLoading: loadingAudit } = useQuery<AuditEvent[]>({
    queryKey: ['audit-events'],
    queryFn: () => api.get('/admin/audit-events').then((r) => r.data),
  })

  const sortedEvents = [...auditEvents].reverse()

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold tracking-tight'>Compliance</h1>
          <p className='text-sm text-muted-foreground'>KYC status and audit trail</p>
        </div>

        <Tabs defaultValue='kyc'>
          <TabsList className='mb-4'>
            <TabsTrigger value='kyc'>Customers / KYC</TabsTrigger>
            <TabsTrigger value='audit'>Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value='kyc'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Legal Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-10 text-center text-muted-foreground'>Loading…</TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='py-10 text-center text-muted-foreground'>No customers.</TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <span className='font-mono text-xs' title={c.id}>{c.id.slice(0, 8)}…</span>
                        </TableCell>
                        <TableCell className='font-medium'>{c.legalName}</TableCell>
                        <TableCell><Badge variant='outline'>{c.type}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[c.status] ?? 'secondary'}>{c.status}</Badge>
                        </TableCell>
                        <TableCell>{c.email ?? '—'}</TableCell>
                        <TableCell>{c.countryCode ?? '—'}</TableCell>
                        <TableCell className='text-xs'>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='audit'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource Type</TableHead>
                    <TableHead>Resource ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAudit ? (
                    <TableRow>
                      <TableCell colSpan={5} className='py-10 text-center text-muted-foreground'>Loading…</TableCell>
                    </TableRow>
                  ) : sortedEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='py-10 text-center text-muted-foreground'>No audit events.</TableCell>
                    </TableRow>
                  ) : (
                    sortedEvents.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className='text-xs text-muted-foreground'>
                          {new Date(e.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell><Badge variant='outline'>{e.actorType}</Badge></TableCell>
                        <TableCell><code className='text-xs'>{e.action}</code></TableCell>
                        <TableCell className='text-xs'>{e.resourceType}</TableCell>
                        <TableCell>
                          <span className='font-mono text-xs' title={e.resourceId}>
                            {e.resourceId.slice(0, 8)}…
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
