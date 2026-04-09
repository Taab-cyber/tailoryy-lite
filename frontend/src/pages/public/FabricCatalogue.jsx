import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { X, Tag, IndianRupee, Circle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

const FABRIC_TYPES = ['All', 'Silk', 'Cotton', 'Georgette', 'Linen', 'Velvet', 'Chiffon', 'Net'];
const COLOR_FAMILIES = ['All', 'Light', 'Dark', 'Warm', 'Cool'];

const COLOR_FAMILY_MAP = {
  Light: ['#fff', '#faf', '#ffe', '#eee', '#f5f', '#e0f', '#fef', '#f8f'],
  Dark: ['#000', '#111', '#222', '#333', '#1a1', '#00f', '#600', '#080'],
  Warm: ['#f00', '#f80', '#ff0', '#f50', '#e40', '#c30', '#a00', '#b60'],
  Cool: ['#00f', '#088', '#0af', '#4af', '#8af', '#0ff', '#04f', '#26a'],
};

function hexFamilyMatch(hex, family) {
  if (!hex) return true;
  const h = hex.toLowerCase().replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  if (family === 'Light') return brightness > 170;
  if (family === 'Dark') return brightness < 85;
  if (family === 'Warm') return r > g && r > b;
  if (family === 'Cool') return b >= r && b >= g;
  return true;
}

function FabricCard({ fabric, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(fabric)}
      className="card-base card-hover cursor-pointer p-4 flex flex-col items-center text-center gap-3 group"
    >
      {/* Circular colour swatch */}
      <div
        className="w-20 h-20 rounded-full border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundColor: fabric.hex_code || '#d4c5b0' }}
        title={fabric.color_name}
      />
      <div>
        <p className="font-semibold text-espresso text-sm leading-snug">{fabric.name}</p>
        <Badge variant="outline" className="mt-1 text-xs">
          {fabric.fabric_type}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-terracotta text-sm font-semibold">
        <IndianRupee size={13} />
        {fabric.price_per_metre}/m
      </div>
    </motion.div>
  );
}

function FabricModal({ fabric, onClose }) {
  if (!fabric) return null;
  const isAvailable = fabric.available !== false;

  return (
    <Modal isOpen={!!fabric} onClose={onClose} size="lg">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Colour display */}
        <div
          className="min-h-56 md:min-h-full rounded-l-xl flex items-center justify-center"
          style={{ backgroundColor: fabric.hex_code || '#d4c5b0' }}
        >
          <div className="text-center p-6">
            <div className="w-24 h-24 rounded-full border-4 border-white/40 mx-auto shadow-lg"
              style={{ backgroundColor: fabric.hex_code || '#d4c5b0' }}
            />
            <p className="mt-4 text-white/90 font-medium drop-shadow">{fabric.color_name}</p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col">
          <button
            onClick={onClose}
            className="self-end text-muted hover:text-espresso transition mb-4"
          >
            <X size={20} />
          </button>

          <Badge variant="outline" className="self-start mb-3 text-xs">
            {fabric.fabric_type}
          </Badge>
          <h2 className="font-serif text-2xl text-espresso mb-1">{fabric.name}</h2>
          <p className="text-muted text-sm mb-4">{fabric.color_name}</p>

          {fabric.description && (
            <p className="text-charcoal text-sm leading-relaxed mb-5">{fabric.description}</p>
          )}

          <div className="flex items-center gap-6 mb-5">
            <div>
              <p className="text-xs text-muted mb-0.5">Price per metre</p>
              <div className="flex items-center gap-1 text-terracotta font-bold text-lg">
                <IndianRupee size={15} />
                {fabric.price_per_metre}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted mb-0.5">Availability</p>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-red-500'}`}>
                {isAvailable ? <CheckCircle size={14} /> : <Circle size={14} />}
                {isAvailable ? 'In Stock' : 'Out of Stock'}
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Link to={`/order?fabric=${fabric._id}`} onClick={onClose}>
              <Button className="w-full btn-primary">
                Request This Fabric
              </Button>
            </Link>
            <p className="text-xs text-muted text-center mt-2">
              We'll include this fabric in your order form
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function FabricCatalogue() {
  const [fabricType, setFabricType] = useState('All');
  const [colorFamily, setColorFamily] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState(null);

  const { data: fabrics, isLoading, isError } = useQuery({
    queryKey: ['fabrics', fabricType],
    queryFn: async () => {
      const params = {};
      if (fabricType !== 'All') params.fabric_type = fabricType;
      const res = await api.get('/fabrics/', { params });
      return res.data;
    },
  });

  const filteredFabrics = (fabrics || []).filter((f) => {
    if (colorFamily === 'All') return true;
    return hexFamilyMatch(f.hex_code, colorFamily);
  });

  return (
    <>
      <Helmet>
        <title>Fabric Catalogue — Tailoryy</title>
        <meta
          name="description"
          content="Browse Tailoryy's curated fabric catalogue — silks, cottons, georgettes, linens, and more. Find the perfect fabric for your custom garment."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-ivory section-padding pt-24 text-center">
        <div className="container-max max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-5xl text-espresso mb-4"
          >
            Fabric Catalogue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-charcoal text-lg"
          >
            We source only quality fabrics from trusted suppliers. Browse our catalogue to find the perfect foundation for your garment.
          </motion.p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container-max py-3 space-y-2">
          {/* Type filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max px-4 md:px-0">
              <span className="text-xs text-muted self-center mr-1 font-medium">Type:</span>
              {FABRIC_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFabricType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
                    fabricType === type
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-white text-charcoal border-border hover:border-terracotta hover:text-terracotta'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* Color family filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max px-4 md:px-0">
              <span className="text-xs text-muted self-center mr-1 font-medium">Colour:</span>
              {COLOR_FAMILIES.map((cf) => (
                <button
                  key={cf}
                  onClick={() => setColorFamily(cf)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border whitespace-nowrap ${
                    colorFamily === cf
                      ? 'bg-espresso text-white border-espresso'
                      : 'bg-white text-charcoal border-border hover:border-espresso hover:text-espresso'
                  }`}
                >
                  {cf}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="section-padding bg-white">
        <div className="container-max">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonCard key={i} className="h-44" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">Unable to load fabrics. Please try again later.</p>
            </div>
          ) : filteredFabrics.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-5xl mb-4">🧵</div>
              <p className="text-espresso font-serif text-xl mb-2">No fabrics found</p>
              <p className="text-muted">Try adjusting your filters to see more options.</p>
              <Button
                onClick={() => { setFabricType('All'); setColorFamily('All'); }}
                className="btn-ghost mt-6 border border-border"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted">
                  {filteredFabrics.length} fabric{filteredFabrics.length !== 1 ? 's' : ''} found
                </p>
                {(fabricType !== 'All' || colorFamily !== 'All') && (
                  <button
                    onClick={() => { setFabricType('All'); setColorFamily('All'); }}
                    className="text-xs text-terracotta hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {filteredFabrics.map((fabric) => (
                    <FabricCard key={fabric._id} fabric={fabric} onClick={setSelectedFabric} />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info banner */}
      <section className="bg-terracotta-light section-padding py-10">
        <div className="container-max flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl text-espresso mb-2">
              Have your own fabric?
            </h3>
            <p className="text-charcoal text-sm max-w-sm">
              You don't have to choose from our catalogue. Send us your fabric and we'll stitch it into the garment you want.
            </p>
          </div>
          <Link to="/services#own-fabric">
            <Button className="btn-primary whitespace-nowrap">
              Bring Your Fabric
            </Button>
          </Link>
        </div>
      </section>

      {/* Fabric detail modal */}
      <AnimatePresence>
        {selectedFabric && (
          <FabricModal fabric={selectedFabric} onClose={() => setSelectedFabric(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
