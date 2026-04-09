import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

const CATEGORIES = ['All', 'Lehenga', 'Saree', 'Kurta', 'Indo-Western', 'Upcycled', 'Western'];

function PortfolioItem({ item, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
      className="break-inside-avoid mb-4 cursor-pointer group relative overflow-hidden rounded-xl shadow-sm"
      onClick={() => onClick(item)}
    >
      <img
        src={item.images?.[0] || '/placeholder-garment.jpg'}
        alt={item.title}
        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <Badge variant="terracotta" className="self-start mb-2 text-xs">
          {item.category}
        </Badge>
        <p className="text-white font-serif text-lg leading-snug">{item.title}</p>
      </div>
    </motion.div>
  );
}

function PortfolioModal({ item, onClose }) {
  const [imageIndex, setImageIndex] = useState(0);
  const queryClient = useQueryClient();

  const images = item?.images || [];

  const wishlistMutation = useMutation({
    mutationFn: () => api.post(`/wishlist/${item._id}`),
    onSuccess: () => {
      toast.success('Added to wishlist!');
      queryClient.invalidateQueries(['wishlist']);
    },
    onError: (err) => {
      if (err?.response?.status === 401) {
        toast.error('Please log in to save to your wishlist.');
      } else {
        toast.error('Could not add to wishlist. Please try again.');
      }
    },
  });

  const prevImage = () => setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  if (!item) return null;

  return (
    <Modal isOpen={!!item} onClose={onClose} size="xl">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image gallery */}
        <div className="relative bg-cream rounded-l-xl overflow-hidden min-h-72">
          <img
            src={images[imageIndex] || '/placeholder-garment.jpg'}
            alt={`${item.title} — image ${imageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow transition"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === imageIndex ? 'bg-terracotta' : 'bg-white/60'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col">
          <button
            onClick={onClose}
            className="self-end text-muted hover:text-espresso transition mb-4"
          >
            <X size={20} />
          </button>
          <Badge variant="terracotta" className="self-start mb-3">
            {item.category}
          </Badge>
          <h2 className="font-serif text-2xl text-espresso mb-3">{item.title}</h2>
          <p className="text-charcoal text-sm leading-relaxed mb-5">
            {item.description || 'A beautifully crafted piece made with care and precision at Tailoryy.'}
          </p>

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <Tag size={14} className="text-muted mt-0.5" />
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto">
            <Button
              onClick={() => wishlistMutation.mutate()}
              isLoading={wishlistMutation.isPending}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Heart size={16} />
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [skip, setSkip] = useState(0);
  const [allItems, setAllItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const LIMIT = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portfolio', activeCategory, skip],
    queryFn: async () => {
      const params = { skip, limit: LIMIT };
      if (activeCategory !== 'All') params.category = activeCategory;
      const res = await api.get('/portfolio/', { params });
      return res.data;
    },
    keepPreviousData: true,
    onSuccess: (data) => {
      if (skip === 0) {
        setAllItems(data);
      } else {
        setAllItems((prev) => [...prev, ...data]);
      }
    },
  });

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setSkip(0);
    setAllItems([]);
  };

  const hasMore = data?.length === LIMIT;

  return (
    <>
      <Helmet>
        <title>Portfolio — Tailoryy</title>
        <meta
          name="description"
          content="Browse Tailoryy's portfolio of custom-stitched lehengas, sarees, kurtas, upcycled garments, and more — handcrafted for every occasion."
        />
      </Helmet>

      {/* Page header */}
      <section className="bg-ivory section-padding pt-20">
        <div className="container-max text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-espresso mb-4"
          >
            Our Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-charcoal text-lg max-w-xl mx-auto"
          >
            Every stitch tells a story. Explore the garments we've brought to life for our clients across India.
          </motion.p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container-max overflow-x-auto">
          <div className="flex gap-2 py-3 min-w-max px-4 md:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                  activeCategory === cat
                    ? 'bg-terracotta text-white border-terracotta'
                    : 'bg-white text-charcoal border-border hover:border-terracotta hover:text-terracotta'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio grid */}
      <section className="section-padding bg-white">
        <div className="container-max">
          {isLoading && skip === 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <SkeletonCard className="h-52 md:h-72" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">Unable to load portfolio. Please try again later.</p>
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">No pieces found in this category yet.</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              <AnimatePresence>
                {allItems.map((item) => (
                  <PortfolioItem key={item._id} item={item} onClick={setSelectedItem} />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={() => setSkip((s) => s + LIMIT)}
                isLoading={isLoading}
                className="btn-ghost border border-border px-8"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <PortfolioModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
