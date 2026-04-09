// Wishlist.jsx — Customer wishlist page with optimistic removal
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Heart, Trash2, ShoppingBag, ExternalLink, BookOpen } from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'

// ─── skeleton card ────────────────────────────────────────────────────────────

function WishlistSkeletonCard() {
  return (
    <div className="card-base overflow-hidden">
      <Skeleton className="h-56 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" rounded />
        <Skeleton className="h-3 w-1/2" rounded />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" rounded />
          <Skeleton className="h-8 flex-1" rounded />
        </div>
      </div>
    </div>
  )
}

// ─── empty state ──────────────────────────────────────────────────────────────

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      {/* Simple CSS heart illustration */}
      <div className="relative w-20 h-20 mb-6" aria-hidden>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart
            size={56}
            className="text-terracotta-light stroke-terracotta"
            strokeWidth={1.5}
            fill="currentColor"
            style={{ color: '#F0D5C5' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart
            size={56}
            className="text-terracotta-light opacity-30 animate-ping"
            strokeWidth={0}
            fill="currentColor"
            style={{ color: '#F0D5C5' }}
          />
        </div>
      </div>
      <h3 className="font-serif text-2xl text-espresso mb-2">Your wishlist is empty</h3>
      <p className="text-muted font-sans text-sm max-w-sm mb-6">
        Browse our portfolio for inspiration and save the looks you love.
      </p>
      <Link to="/portfolio">
        <Button size="md" className="gap-2">
          <BookOpen size={16} /> Browse Portfolio
        </Button>
      </Link>
    </div>
  )
}

// ─── wishlist card ────────────────────────────────────────────────────────────

function WishlistCard({ item, onRemove, removing }) {
  const imageUrl = item.portfolio_item?.image
    || item.portfolio_item?.images?.[0]
    || item.image
    || null

  const title    = item.portfolio_item?.title    || item.title    || 'Untitled'
  const category = item.portfolio_item?.category || item.category || null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.25 }}
      className="card-base overflow-hidden group"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/5] bg-cream">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ '--tw-scale-x': 'var(--scale)', '--tw-scale-y': 'var(--scale)' }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream">
            <Heart size={40} className="text-terracotta-light" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/25 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          {item.portfolio_item?.id && (
            <Link
              to={`/portfolio/${item.portfolio_item.id}`}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-card hover:bg-cream transition-colors"
              aria-label="View portfolio item"
            >
              <ExternalLink size={15} className="text-espresso" />
            </Link>
          )}
        </div>

        {/* Remove heart button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={removing}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all hover:scale-110 disabled:opacity-50"
          aria-label="Remove from wishlist"
        >
          <Heart
            size={15}
            className={`transition-colors ${removing ? 'text-muted' : 'text-error fill-error'}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-sans font-medium text-sm text-espresso line-clamp-1 flex-1">
            {title}
          </h3>
          {category && (
            <Badge variant="neutral" className="text-[10px] flex-shrink-0 capitalize">
              {category}
            </Badge>
          )}
        </div>

        {item.portfolio_item?.description && (
          <p className="text-xs text-muted font-sans line-clamp-2 mb-3">
            {item.portfolio_item.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Link to="/order" className="flex-1">
            <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
              <ShoppingBag size={13} /> Order Like This
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            loading={removing}
            onClick={() => onRemove(item.id)}
            className="gap-1 text-xs text-error border-red-200 hover:border-error hover:bg-red-50 hover:text-error px-3"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Wishlist() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  () => api.get('/wishlist/').then((r) => r.data),
    staleTime: 30_000,
  })

  const items = data?.results ?? data ?? []

  const { mutate: remove, variables: removingId, isPending: isRemoving } = useMutation({
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] })
      const prev = queryClient.getQueryData(['wishlist'])

      queryClient.setQueryData(['wishlist'], (old) => {
        if (!old) return old
        // Handle both paginated { results } and plain array
        if (Array.isArray(old)) return old.filter((item) => item.id !== id)
        return { ...old, results: old.results?.filter((item) => item.id !== id) }
      })

      return { prev }
    },
    mutationFn: (id) => api.delete(`/wishlist/${id}/`),
    onSuccess: () => {
      toast.success('Removed from wishlist')
    },
    onError: (err, _id, ctx) => {
      // Roll back
      if (ctx?.prev) queryClient.setQueryData(['wishlist'], ctx.prev)
      toast.error(err.message || 'Could not remove item')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })

  return (
    <>
      <Helmet>
        <title>My Wishlist — Tailoryy</title>
      </Helmet>

      <div className="section-padding">
        <div className="container-max">

          {/* Heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl text-espresso flex items-center gap-2">
                <Heart size={24} className="text-terracotta" />
                My Wishlist
              </h1>
              {!isLoading && (
                <p className="text-muted font-sans text-sm mt-1">
                  {items.length} saved item{items.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {items.length > 0 && (
              <Link to="/portfolio">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <BookOpen size={14} /> Browse More
                </Button>
              </Link>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => <WishlistSkeletonCard key={n} />)}
            </div>
          ) : items.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <WishlistCard
                    key={item.id}
                    item={item}
                    onRemove={remove}
                    removing={isRemoving && removingId === item.id}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}

        </div>
      </div>
    </>
  )
}
