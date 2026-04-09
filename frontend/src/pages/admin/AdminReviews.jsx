// AdminReviews.jsx — Review moderation: approve or delete
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'

export default function AdminReviews() {
  const [tab,       setTab]      = useState('pending')
  const [delModal,  setDelModal] = useState(null)
  const qc = useQueryClient()

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn:  () => api.get('/reviews/admin').then(r => r.data),
  })

  const approve = useMutation({
    mutationFn: (id) => api.put(`/reviews/${id}/approve`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review approved') },
    onError: (e) => toast.error(e.message),
  })

  const del = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Deleted'); setDelModal(null) },
    onError: (e) => toast.error(e.message),
  })

  const filtered = reviews.filter(r => {
    if (tab === 'pending')  return !r.is_approved
    if (tab === 'approved') return r.is_approved
    return true
  })

  const counts = {
    pending:  reviews.filter(r => !r.is_approved).length,
    approved: reviews.filter(r => r.is_approved).length,
    all:      reviews.length,
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Reviews — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <h1 className="font-serif text-2xl text-espresso mb-5">Reviews</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['pending','approved','all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-sm text-sm font-sans font-medium transition-colors capitalize ${
                tab === t ? 'bg-terracotta text-white' : 'bg-white border border-border text-charcoal hover:border-terracotta hover:text-terracotta'
              }`}>
              {t} <span className="ml-1 text-xs opacity-70">({counts[t]})</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted font-sans">No {tab} reviews</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <div key={review.id} className="bg-white border border-border rounded-md p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={14} fill={i <= review.rating ? '#C4704A' : '#E8DDD4'} className="text-terracotta" />
                        ))}
                      </div>
                      <Badge variant={review.is_approved ? 'success' : 'warning'}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                      <span className="text-xs text-muted font-sans">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="font-sans text-sm text-charcoal leading-relaxed mb-2">
                      {review.comment || <em className="text-muted">No comment provided</em>}
                    </p>
                    <p className="text-xs text-muted font-mono">Order: {review.order_id?.slice(0,8)}…</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!review.is_approved && (
                      <Button size="sm" onClick={() => approve.mutate(review.id)} loading={approve.isPending} className="gap-1">
                        <Check size={13} /> Approve
                      </Button>
                    )}
                    <button onClick={() => setDelModal(review)} className="p-2 text-muted hover:text-error rounded-sm hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={!!delModal} onClose={() => setDelModal(null)} title="Delete Review" size="sm">
        <p className="font-sans text-charcoal mb-5">Permanently delete this review? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setDelModal(null)} className="flex-1">Cancel</Button>
          <Button variant="danger" onClick={() => del.mutate(delModal.id)} loading={del.isPending} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
