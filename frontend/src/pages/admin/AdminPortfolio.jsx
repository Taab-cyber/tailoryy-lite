// AdminPortfolio.jsx — Portfolio CRUD with image upload and drag-to-reorder
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { PORTFOLIO_CATEGORIES } from '../../utils/constants'

const EMPTY = { title: '', category: 'lehenga', description: '', tags: '', is_featured: false, display_order: 0, images: [] }

export default function AdminPortfolio() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [delModal,   setDelModal]   = useState(null)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [uploading,  setUploading]  = useState(false)
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn:  () => api.get('/portfolio/?limit=100').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (data) => editing
      ? api.put(`/portfolio/${editing.id}`, data).then(r => r.data)
      : api.post('/portfolio/', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-portfolio'] })
      toast.success(editing ? 'Updated!' : 'Added!')
      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY)
    },
    onError: (e) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: (id) => api.delete(`/portfolio/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-portfolio'] }); toast.success('Deleted'); setDelModal(null) },
    onError: (e) => toast.error(e.message),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 5,
    onDrop: async (files) => {
      setUploading(true)
      try {
        const urls = []
        for (const file of files) {
          const fd = new FormData(); fd.append('file', file)
          const res = await api.post('/uploads/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          urls.push(res.data.url)
        }
        setForm(f => ({ ...f, images: [...f.images, ...urls] }))
        toast.success(`${urls.length} image(s) uploaded`)
      } catch (e) { toast.error('Upload failed') }
      finally { setUploading(false) }
    },
  })

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({ ...item, tags: (item.tags || []).join(', ') })
    setModalOpen(true)
  }

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error('Title required')
    save.mutate({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Portfolio — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-espresso">Portfolio</h1>
          <Button onClick={openAdd} className="gap-2"><Plus size={15} /> Add New Look</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="relative group rounded-md overflow-hidden border border-border bg-white shadow-card">
                <img
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'}
                  alt={item.title}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
                {item.is_featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="brand"><Star size={10} /> Featured</Badge>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-sans font-medium text-sm text-espresso truncate">{item.title}</p>
                  <p className="font-sans text-xs text-muted capitalize">{item.category.replace('_',' ')}</p>
                </div>
                <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => openEdit(item)} className="p-2 bg-white rounded-full text-charcoal hover:text-terracotta transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDelModal(item)} className="p-2 bg-white rounded-full text-charcoal hover:text-error transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Look' : 'Add New Look'} size="lg">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
          <div>
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="input-base">
              {PORTFOLIO_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="Bridal, Silk, Red" />
          <Input label="Display Order" type="number" value={form.display_order} onChange={e => setForm(f => ({...f, display_order: +e.target.value}))} />
          <div className="sm:col-span-2 flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({...f, is_featured: e.target.checked}))} className="accent-terracotta w-4 h-4" />
            <label htmlFor="featured" className="text-sm font-sans text-charcoal cursor-pointer">Featured on homepage</label>
          </div>

          {/* Image upload */}
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-charcoal font-sans block mb-1.5">Images</label>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-terracotta bg-terracotta-light/20' : 'border-border hover:border-terracotta/50'}`}>
              <input {...getInputProps()} />
              {uploading ? <Spinner /> : <p className="text-sm text-muted font-sans">{isDragActive ? 'Drop here…' : 'Drag images or click to upload (max 5)'}</p>}
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-sm border border-border" />
                    <button onClick={() => setForm(f => ({...f, images: f.images.filter((_,j) => j !== i)}))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={save.isPending} className="flex-1">{editing ? 'Save Changes' : 'Add to Portfolio'}</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!delModal} onClose={() => setDelModal(null)} title="Delete Portfolio Item" size="sm">
        <p className="font-sans text-charcoal mb-5">Are you sure you want to delete "{delModal?.title}"? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDelModal(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => del.mutate(delModal.id)} loading={del.isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
