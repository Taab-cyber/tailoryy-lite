// AdminOrders.jsx — Paginated order management with filters and CSV export
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS, SERVICE_LABELS } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'cutting', 'stitching', 'quality_check', 'shipped', 'delivered', 'cancelled']
const SERVICE_OPTIONS = ['', 'custom_stitch', 'upcycle', 'own_fabric']
const PAGE_SIZE = 20

export default function AdminOrders() {
  const [statusFilter,  setStatusFilter]  = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(0)
  const [selected,      setSelected]      = useState([])
  const [bulkStatus,    setBulkStatus]    = useState('')
  const qc = useQueryClient()

  const params = new URLSearchParams()
  if (statusFilter)  params.append('status',       statusFilter)
  if (serviceFilter) params.append('service_type', serviceFilter)
  params.append('skip',  page * PAGE_SIZE)
  params.append('limit', PAGE_SIZE)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, serviceFilter, page],
    queryFn:  () => api.get(`/orders/?${params}`).then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/orders/${id}/status`, { status }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated') },
    onError:   (e) => toast.error(e.message),
  })

  const filtered = search
    ? orders.filter(o => o.order_number.toLowerCase().includes(search.toLowerCase()))
    : orders

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.length === 0) return
    await Promise.all(selected.map(id => updateStatus.mutateAsync({ id, status: bulkStatus })))
    setSelected([])
    setBulkStatus('')
    toast.success(`Updated ${selected.length} orders`)
  }

  const exportCSV = () => {
    const headers = ['Order#', 'Service', 'Status', 'Amount', 'Date']
    const rows = filtered.map(o => [
      o.order_number, o.service_type, o.status,
      o.total_amount, new Date(o.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'tailoryy-orders.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Orders — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="font-serif text-2xl text-espresso">Orders</h1>
          <Button variant="ghost" size="sm" onClick={exportCSV} className="gap-2 self-start">
            <Download size={15} /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-border rounded-md p-4 mb-5 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search order number…"
              className="input-base pl-8 py-2 text-sm"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
            className="input-base py-2 text-sm w-40">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s ? ORDER_STATUS_LABELS[s] : 'All Statuses'}</option>)}
          </select>
          <select value={serviceFilter} onChange={e => { setServiceFilter(e.target.value); setPage(0) }}
            className="input-base py-2 text-sm w-44">
            {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s ? SERVICE_LABELS[s] : 'All Services'}</option>)}
          </select>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="bg-terracotta-light border border-terracotta/30 rounded-md p-3 mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-terracotta-dark">{selected.length} selected</span>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} className="input-base py-1.5 text-sm w-40">
              <option value="">Set status…</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
            </select>
            <Button size="sm" onClick={handleBulkUpdate} loading={updateStatus.isPending}>Apply</Button>
            <button onClick={() => setSelected([])} className="text-sm text-muted hover:text-espresso ml-auto">Clear</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream border-b border-border">
                  <tr>
                    <th className="p-3 text-left">
                      <input type="checkbox"
                        checked={selected.length === filtered.length && filtered.length > 0}
                        onChange={e => setSelected(e.target.checked ? filtered.map(o => o.id) : [])}
                        className="accent-terracotta"
                      />
                    </th>
                    {['Order #', 'Service', 'Date', 'Status', 'Amount', 'Actions'].map(h => (
                      <th key={h} className="p-3 text-left font-sans font-medium text-charcoal text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-muted font-sans">No orders found</td></tr>
                  ) : filtered.map(order => (
                    <tr key={order.id} className="hover:bg-cream/50 transition-colors">
                      <td className="p-3">
                        <input type="checkbox" checked={selected.includes(order.id)}
                          onChange={e => setSelected(p => e.target.checked ? [...p, order.id] : p.filter(i => i !== order.id))}
                          className="accent-terracotta" />
                      </td>
                      <td className="p-3 font-mono text-xs text-charcoal font-semibold">{order.order_number}</td>
                      <td className="p-3"><Badge variant="neutral">{SERVICE_LABELS[order.service_type]}</Badge></td>
                      <td className="p-3 text-muted text-xs">{formatDate(order.created_at)}</td>
                      <td className="p-3">
                        <select
                          value={order.status}
                          onChange={e => updateStatus.mutate({ id: order.id, status: e.target.value })}
                          className="text-xs border border-border rounded px-2 py-1 bg-white cursor-pointer"
                        >
                          {STATUS_OPTIONS.filter(Boolean).map(s => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 font-sans font-medium text-espresso">{formatCurrency(order.total_amount)}</td>
                      <td className="p-3">
                        <Link to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-terracotta text-xs font-medium hover:underline">
                          <Eye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted font-sans">Page {page + 1}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft size={15} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={filtered.length < PAGE_SIZE}>
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
