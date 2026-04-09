// AdminPromoCodes.jsx — Promo code management: create, toggle, view usage stats
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { formatDate, formatCurrency } from '../../utils/formatters'

const EMPTY = {
  code: '', type: 'percentage', value: 10, min_order_amount: 0,
  max_uses: 100, expiry_date: '', is_active: true, description: '',
}

export default function AdminPromoCodes() {
  const [modalOpen, setModalOpen] = useState(false)
  const [delModal,  setDelModal]  = useState(null)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const qc = useQueryClient()

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn:  () => api.get('/promos/').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (data) => editing
      ? api.put(`/promos/${editing.id}`, data).then(r => r.data)
      : api.post('/promos/', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promos'] })
      toast.success(editing ? 'Promo updated!' : 'Promo created!')
      closeModal()
    },
    onError: (e) => toast.error(e.response?.data?.detail || e.message),
  })

  const del = useMutation({
    mutationFn: (id) => api.delete(`/promos/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-promos'] })
      toast.success('Deleted')
      setDelModal(null)
    },
    onError: (e) => toast.error(e.message),
  })

  const toggleActive = (promo) => {
    api.put(`/promos/${promo.id}`, { is_active: !promo.is_active })
      .then(() => {
        qc.invalidateQueries({ queryKey: ['admin-promos'] })
        toast.success(promo.is_active ? 'Deactivated' : 'Activated')
      })
      .catch(e => toast.error(e.message))
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(EMPTY) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({
      ...p,
      expiry_date: p.expiry_date ? p.expiry_date.slice(0, 10) : '',
    })
    setModalOpen(true)
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.code.trim()) return toast.error('Code is required')
    if (form.value <= 0)   return toast.error('Value must be greater than 0')
    save.mutate({
      ...form,
      value:            +form.value,
      min_order_amount: +form.min_order_amount,
      max_uses:         +form.max_uses,
      expiry_date:      form.expiry_date || null,
    })
  }

  const isExpired = (p) => p.expiry_date && new Date(p.expiry_date) < new Date()
  const usagePct  = (p) => p.max_uses > 0 ? Math.min(100, Math.round((p.used_count / p.max_uses) * 100)) : 0

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Promo Codes — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-espresso">Promo Codes</h1>
          <Button onClick={openAdd} className="gap-2"><Plus size={15} /> New Code</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="mx-auto text-muted mb-4" />
            <p className="text-muted font-sans">No promo codes yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-border">
                <tr>
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="p-3 text-left font-sans font-medium text-charcoal text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promos.map(promo => (
                  <tr key={promo.id} className="hover:bg-cream/40">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-espresso tracking-widest">{promo.code}</span>
                        {promo.description && (
                          <span className="text-xs text-muted font-sans truncate max-w-[120px]">{promo.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-sans font-semibold text-terracotta">
                      {promo.type === 'percentage' ? `${promo.value}% off` : `${formatCurrency(promo.value)} off`}
                    </td>
                    <td className="p-3 text-muted font-sans text-xs">
                      {promo.min_order_amount > 0 ? `Min ${formatCurrency(promo.min_order_amount)}` : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 bg-border rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-terracotta transition-all"
                            style={{ width: `${usagePct(promo)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted font-mono whitespace-nowrap">
                          {promo.used_count ?? 0}/{promo.max_uses}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted font-sans">
                      {promo.expiry_date
                        ? <span className={isExpired(promo) ? 'text-error' : ''}>{formatDate(promo.expiry_date)}</span>
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isExpired(promo) ? (
                          <Badge variant="error">Expired</Badge>
                        ) : (
                          <button
                            onClick={() => toggleActive(promo)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${promo.is_active ? 'bg-success' : 'bg-muted/40'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${promo.is_active ? 'translate-x-5' : ''}`} />
                          </button>
                        )}
                        <Badge variant={promo.is_active && !isExpired(promo) ? 'success' : 'neutral'}>
                          {isExpired(promo) ? 'Expired' : promo.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(promo)} className="text-muted hover:text-terracotta transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => setDelModal(promo)} className="text-muted hover:text-error transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Promo Code' : 'New Promo Code'} size="md">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Code</label>
            <input
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
              placeholder="e.g. FIRST20"
              className="input-base font-mono tracking-widest uppercase"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Discount Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input-base">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <Input
            label={form.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
            type="number"
            value={form.value}
            onChange={e => set('value', e.target.value)}
            min={1}
            max={form.type === 'percentage' ? 100 : undefined}
          />
          <Input
            label="Min Order Amount (₹)"
            type="number"
            value={form.min_order_amount}
            onChange={e => set('min_order_amount', e.target.value)}
            min={0}
          />
          <Input
            label="Max Uses"
            type="number"
            value={form.max_uses}
            onChange={e => set('max_uses', e.target.value)}
            min={1}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiry_date}
            onChange={e => set('expiry_date', e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="e.g. First order discount"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)}
              className="accent-terracotta w-4 h-4"
            />
            <label htmlFor="active" className="text-sm font-sans text-charcoal cursor-pointer">Active (customers can use this code)</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={save.isPending} className="flex-1">
            {editing ? 'Save Changes' : 'Create Code'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!delModal} onClose={() => setDelModal(null)} title="Delete Promo Code" size="sm">
        <p className="font-sans text-charcoal mb-5">
          Delete code <span className="font-mono font-bold text-espresso">{delModal?.code}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDelModal(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => del.mutate(delModal.id)} loading={del.isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
