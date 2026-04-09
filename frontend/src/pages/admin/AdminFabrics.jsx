// AdminFabrics.jsx — Fabric catalogue management with inline availability toggle
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { FABRIC_TYPES } from '../../utils/constants'
import { formatCurrency } from '../../utils/formatters'

const EMPTY = { name: '', fabric_type: 'silk', color: '', hex_code: '#C4704A', image_url: '', price_per_metre: 0, description: '', is_available: true }

export default function AdminFabrics() {
  const [modalOpen, setModalOpen]  = useState(false)
  const [delModal,  setDelModal]   = useState(null)
  const [editing,   setEditing]    = useState(null)
  const [form,      setForm]       = useState(EMPTY)
  const qc = useQueryClient()

  const { data: fabrics = [], isLoading } = useQuery({
    queryKey: ['admin-fabrics'],
    queryFn:  () => api.get('/fabrics/').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (data) => editing
      ? api.put(`/fabrics/${editing.id}`, data).then(r => r.data)
      : api.post('/fabrics/', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-fabrics'] }); toast.success(editing ? 'Updated!' : 'Added!'); closeModal() },
    onError: (e) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: (id) => api.delete(`/fabrics/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-fabrics'] }); toast.success('Deleted'); setDelModal(null) },
    onError: (e) => toast.error(e.message),
  })

  const toggleAvailability = (fabric) => {
    api.put(`/fabrics/${fabric.id}`, { is_available: !fabric.is_available })
      .then(() => { qc.invalidateQueries({ queryKey: ['admin-fabrics'] }); toast.success(fabric.is_available ? 'Marked unavailable' : 'Marked available') })
      .catch(e => toast.error(e.message))
  }

  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(EMPTY) }
  const openAdd  = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (f) => { setEditing(f); setForm({ ...f }); setModalOpen(true) }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Fabrics — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-espresso">Fabric Catalogue</h1>
          <Button onClick={openAdd} className="gap-2"><Plus size={15} /> Add Fabric</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-border">
                <tr>
                  {['Colour', 'Name', 'Type', 'Price/m', 'Available', 'Actions'].map(h => (
                    <th key={h} className="p-3 text-left font-sans font-medium text-charcoal text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fabrics.map(fabric => (
                  <tr key={fabric.id} className="hover:bg-cream/40">
                    <td className="p-3">
                      <div className="w-8 h-8 rounded-full border border-border shadow-sm" style={{ backgroundColor: fabric.hex_code || '#C4704A' }} title={fabric.color} />
                    </td>
                    <td className="p-3">
                      <p className="font-sans font-medium text-espresso">{fabric.name}</p>
                      <p className="text-xs text-muted">{fabric.color}</p>
                    </td>
                    <td className="p-3"><Badge variant="neutral" className="capitalize">{fabric.fabric_type}</Badge></td>
                    <td className="p-3 font-sans font-medium">{formatCurrency(fabric.price_per_metre)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleAvailability(fabric)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${fabric.is_available ? 'bg-success' : 'bg-muted/40'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${fabric.is_available ? 'translate-x-5' : ''}`} />
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(fabric)} className="text-muted hover:text-terracotta transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => setDelModal(fabric)} className="text-muted hover:text-error transition-colors"><Trash2 size={15} /></button>
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
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Fabric' : 'Add Fabric'} size="md">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={e => set('name', e.target.value)} required />
          <div>
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Type</label>
            <select value={form.fabric_type} onChange={e => set('fabric_type', e.target.value)} className="input-base">
              {FABRIC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Input label="Colour Name" value={form.color} onChange={e => set('color', e.target.value)} placeholder="e.g. Royal Blue" />
          <div>
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Hex Code</label>
            <div className="flex gap-2">
              <input type="color" value={form.hex_code} onChange={e => set('hex_code', e.target.value)} className="w-10 h-10 rounded border border-border cursor-pointer" />
              <input type="text" value={form.hex_code} onChange={e => set('hex_code', e.target.value)} maxLength={7} placeholder="#C4704A" className="input-base flex-1" />
            </div>
          </div>
          <Input label="Price per Metre (₹)" type="number" value={form.price_per_metre} onChange={e => set('price_per_metre', +e.target.value)} min={0} />
          <Input label="Image URL" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://…" />
          <div className="sm:col-span-2">
            <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={2} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="avail" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} className="accent-terracotta w-4 h-4" />
            <label htmlFor="avail" className="text-sm font-sans text-charcoal cursor-pointer">Available in catalogue</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
          <Button onClick={() => save.mutate(form)} loading={save.isPending} className="flex-1">{editing ? 'Save Changes' : 'Add Fabric'}</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!delModal} onClose={() => setDelModal(null)} title="Delete Fabric" size="sm">
        <p className="font-sans text-charcoal mb-5">Delete "{delModal?.name}"? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDelModal(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => del.mutate(delModal.id)} loading={del.isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
