// Home.jsx — Landing page with all editorial sections
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ArrowDown, Star, ChevronLeft, ChevronRight, MessageCircle, Phone } from 'lucide-react'
import api from '../../services/api'
import useTawk from '../../hooks/useTawk'
import Skeleton, { SkeletonCard } from '../../components/ui/Skeleton'
import Badge from '../../components/ui/Badge'

// ── Section: Hero ─────────────────────────────────────────────────────────────
function HeroSection() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 400], [0, -60])
  const y2 = useTransform(scrollY, [0, 400], [0, -30])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F0E6D8 100%)' }}>
      <div className="container-max w-full py-24 lg:py-0 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-sans text-sm font-medium text-terracotta tracking-widest uppercase mb-5">
              Premium Custom Stitching
            </p>
            <h1 className="font-serif text-espresso">
              Your Dream Outfit,
              <br />
              <em className="text-terracotta">Stitched to Perfection.</em>
            </h1>
            <p className="font-sans text-charcoal mt-6 mb-10 max-w-md leading-relaxed text-lg">
              Upload your inspiration, share your measurements, choose your fabric —
              we stitch and deliver it home. Custom, upcycled, or your own fabric.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/order" className="btn-primary text-base px-8 py-3.5">
                Start Your Order
              </Link>
              <Link to="/portfolio" className="btn-ghost text-base px-8 py-3.5">
                View Our Work
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Staggered image frames */}
        <div className="relative h-[520px] hidden lg:block">
          <motion.div style={{ y: y1 }}
            className="absolute top-0 right-8 w-52 h-72 rounded-lg overflow-hidden shadow-hover"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop"
              alt="Bridal lehenga" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
          <motion.div style={{ y: y2 }}
            className="absolute top-32 right-64 w-44 h-60 rounded-lg overflow-hidden shadow-hover"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.7 }}>
            <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop"
              alt="Draped saree" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
          <motion.div
            className="absolute bottom-16 right-24 w-40 h-52 rounded-lg overflow-hidden shadow-hover"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
            <img src="https://images.unsplash.com/photo-1596092921629-4f6e80c0af25?w=500&auto=format&fit=crop"
              alt="Kurta set" className="w-full h-full object-cover" loading="lazy" />
          </motion.div>
        </div>
      </div>

      {/* Scroll arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ArrowDown size={20} className="text-muted" />
      </motion.div>
    </section>
  )
}

// ── Section: Services ─────────────────────────────────────────────────────────
const SERVICES = [
  { num: '01', title: 'Dream It',   desc: 'Custom-stitch from scratch. Share your inspiration images, measurements, and fabric choice — we bring your vision to life.', to: '/services#custom-stitch' },
  { num: '02', title: 'Upcycle It', desc: 'Transform old garments into something beautiful. Give your favourite outfits a second life with our expert tailors.', to: '/services#upcycle' },
  { num: '03', title: 'Stitch It',  desc: "Bring your own fabric — we'll stitch it exactly how you want. Your fabric, our craftsmanship, delivered home.", to: '/services#own-fabric' },
]

function ServicesSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-max">
        <div className="text-center mb-14">
          <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">What We Do</p>
          <h2 className="font-serif text-espresso">Three ways to wear your dream</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES.map(({ num, title, desc, to }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="bg-white border border-border rounded-md p-8 group hover:shadow-hover hover:-translate-y-1 transition-all duration-200"
            >
              <p className="font-serif text-6xl font-light text-terracotta-light mb-4 select-none">{num}</p>
              <h3 className="font-serif text-xl text-espresso mb-3">{title}</h3>
              <p className="font-sans text-sm text-muted leading-relaxed mb-5">{desc}</p>
              <Link to={to} className="font-sans text-sm font-medium text-terracotta group-hover:underline inline-flex items-center gap-1">
                Learn more <span aria-hidden>→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section: Featured Lookbook ─────────────────────────────────────────────────
function FeaturedLookbook() {
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio-featured'],
    queryFn:  () => api.get('/portfolio/featured').then(r => r.data),
  })

  const items = data || []

  return (
    <section className="section-padding bg-ivory">
      <div className="container-max">
        <div className="text-center mb-12">
          <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">Our Work</p>
          <h2 className="font-serif text-espresso">From the Lookbook</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.slice(0, 8).map((item, i) => (
              <motion.div
                key={item.id}
                className="break-inside-avoid relative group overflow-hidden rounded-md cursor-pointer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  style={{ aspectRatio: i % 3 === 0 ? '3/4' : '4/5' }}
                />
                <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/40 transition-all duration-300 flex items-end p-4">
                  <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Badge variant="brand" className="mb-1">{item.category.replace('_', ' ')}</Badge>
                    <p className="font-serif text-sm text-white">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/portfolio" className="btn-ghost">View Full Lookbook →</Link>
        </div>
      </div>
    </section>
  )
}

// ── Section: How It Works ─────────────────────────────────────────────────────
const STEPS = [
  { icon: '📸', title: 'Upload Inspiration', desc: 'Share photos of styles you love' },
  { icon: '📏', title: 'Share Measurements', desc: 'Use our guided measurement guide' },
  { icon: '🧵', title: 'Choose Fabric',      desc: 'Browse our premium catalogue' },
  { icon: '✂️', title: 'We Stitch',          desc: 'Expert artisans get to work' },
  { icon: '📦', title: 'Delivered Home',     desc: 'Your outfit arrives perfectly packed' },
]

function HowItWorksSection() {
  return (
    <section className="section-padding bg-espresso overflow-hidden">
      <div className="container-max">
        <div className="text-center mb-14">
          <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="font-serif text-ivory">From idea to outfit in 5 steps</h2>
        </div>
        {/* Desktop: horizontal timeline */}
        <div className="hidden md:flex items-start gap-0">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.title}>
              <div className="flex-1 text-center">
                <div className="w-14 h-14 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {step.icon}
                </div>
                <p className="font-sans text-xs font-semibold text-terracotta mb-1">Step {i + 1}</p>
                <h3 className="font-serif text-base text-ivory mb-2">{step.title}</h3>
                <p className="font-sans text-xs text-ivory/50 leading-relaxed">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-shrink-0 w-8 mt-7 border-t border-dashed border-terracotta/30" />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Mobile: vertical */}
        <div className="flex md:hidden flex-col gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-terracotta/20 border border-terracotta/40 flex items-center justify-center flex-shrink-0 text-xl">
                {step.icon}
              </div>
              <div>
                <p className="font-sans text-xs font-semibold text-terracotta mb-0.5">Step {i + 1}</p>
                <h3 className="font-serif text-base text-ivory mb-1">{step.title}</h3>
                <p className="font-sans text-xs text-ivory/50">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/how-it-works" className="btn-ghost border-terracotta/60 text-terracotta hover:bg-terracotta">
            See Detailed Guide
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Section: Fabric Showcase ──────────────────────────────────────────────────
function FabricShowcaseSection() {
  const { data } = useQuery({
    queryKey: ['fabrics-home'],
    queryFn:  () => api.get('/fabrics/').then(r => r.data),
  })
  const fabrics = data || []

  return (
    <section className="section-padding bg-cream">
      <div className="container-max">
        <div className="text-center mb-10">
          <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">Materials</p>
          <h2 className="font-serif text-espresso">Premium fabric collection</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
          {fabrics.slice(0, 12).map((f) => (
            <div key={f.id} className="flex-shrink-0 text-center">
              <div
                className="w-16 h-16 rounded-full border-2 border-border shadow-card mx-auto mb-2"
                style={{ backgroundColor: f.hex_code || '#C4704A' }}
              />
              <p className="font-sans text-xs font-medium text-charcoal whitespace-nowrap">{f.name.split(' ').slice(-1)[0]}</p>
              <p className="font-sans text-xs text-muted capitalize">{f.fabric_type}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/fabric-catalogue" className="font-sans text-sm font-medium text-terracotta hover:underline">
            See Full Catalogue →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Section: Testimonials ─────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Priya Sharma",   rating: 5, text: "Bilkul perfect stitching! The lehenga fit me like a dream. Bahut khush hoon! Will always come back to Tailoryy." },
  { name: "Meera Patel",    rating: 5, text: "The upcycling was done beautifully. My old saree now looks brand new. Amazing quality and delivered on time!" },
  { name: "Ananya Reddy",   rating: 5, text: "Excellent workmanship. Every stitch, every detail was perfect. Highly recommend to anyone looking for custom outfits." },
  { name: "Kavitha Nair",   rating: 4, text: "Great communication, lovely fabric, and they followed my measurements perfectly. Will definitely order again." },
]

function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % TESTIMONIALS.length), 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="section-padding bg-ivory">
      <div className="container-max">
        <div className="text-center mb-12">
          <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">Customers</p>
          <h2 className="font-serif text-espresso">What they're saying</h2>
        </div>
        <div className="max-w-3xl mx-auto relative">
          <div className="overflow-hidden">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-border rounded-md p-8 text-center shadow-card"
            >
              <div className="flex justify-center gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < TESTIMONIALS[current].rating ? '#C4704A' : '#E8DDD4'} className="text-terracotta" />
                ))}
              </div>
              <p className="font-serif text-lg italic text-charcoal leading-relaxed mb-6">
                "{TESTIMONIALS[current].text}"
              </p>
              <p className="font-sans text-sm font-semibold text-espresso">{TESTIMONIALS[current].name}</p>
            </motion.div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-terracotta' : 'bg-border'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Section: Talk To Us ───────────────────────────────────────────────────────
function TalkToUsSection() {
  const { openChat, isOnline } = useTawk()
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX'
  const phone    = import.meta.env.VITE_CONTACT_PHONE   || '+91-XXXXX-XXXXX'

  const cards = [
    {
      icon: <MessageCircle size={22} className="text-terracotta" />,
      label: 'Chat with Us',
      sub:   isOnline ? 'Online now — replies in minutes' : 'Leave a message',
      cta:   'Open Chat',
      action: openChat,
    },
    {
      icon: <span className="text-[22px]">💬</span>,
      label: 'WhatsApp Us',
      sub:   'Send photos, ask questions',
      cta:   'Message on WhatsApp',
      href:  `https://wa.me/${whatsapp}?text=Hi%20Tailoryy!%20I%27d%20like%20to%20ask%20about%20an%20outfit.`,
    },
    {
      icon: <Phone size={22} className="text-terracotta" />,
      label: 'Call Us',
      sub:   'Mon–Sat, 10am–7pm IST',
      cta:   phone,
      href:  `tel:${phone}`,
    },
  ]

  return (
    <section className="section-padding bg-cream">
      <div className="container-max text-center">
        <p className="font-sans text-xs font-medium text-terracotta uppercase tracking-widest mb-3">Get in Touch</p>
        <h2 className="font-serif text-espresso mb-4">We're Here for You</h2>
        <p className="font-sans text-muted max-w-md mx-auto mb-12 leading-relaxed">
          Questions before you order? Want to discuss a design idea? Reach out — we respond quickly.
        </p>
        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {cards.map((c) => (
            <div key={c.label} className="bg-white border border-border rounded-md p-6 flex flex-col items-center gap-3 hover:shadow-hover hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 bg-terracotta-light/40 rounded-full flex items-center justify-center">
                {c.icon}
              </div>
              <p className="font-serif text-base text-espresso">{c.label}</p>
              <p className="font-sans text-xs text-muted">{c.sub}</p>
              {c.href ? (
                <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="font-sans text-sm font-medium text-terracotta hover:underline">
                  {c.cta} →
                </a>
              ) : (
                <button onClick={c.action} className="font-sans text-sm font-medium text-terracotta hover:underline">
                  {c.cta} →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Section: CTA Banner ───────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-24 bg-terracotta">
      <div className="container-max text-center">
        <h2 className="font-serif text-4xl text-white mb-4">
          Ready to Create Something Beautiful?
        </h2>
        <p className="font-sans text-white/80 mb-10 max-w-md mx-auto leading-relaxed">
          Join thousands of customers who've found their perfect fit with Tailoryy.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/order" className="bg-white text-terracotta font-sans font-semibold px-8 py-3.5 rounded-sm hover:bg-ivory transition-colors">
            Start Your Order
          </Link>
          <Link to="/portfolio" className="border border-white/60 text-white font-sans font-medium px-8 py-3.5 rounded-sm hover:bg-white/10 transition-colors">
            View Portfolio
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Main Home page ────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Helmet>
        <title>Tailoryy — Your Dream Outfit, Stitched to Perfection</title>
        <meta name="description" content="Custom-stitched outfits, upcycled garments, and fabric-to-fashion transformations. Delivered home." />
        <meta property="og:title" content="Tailoryy — Custom Stitching Fashion House" />
      </Helmet>
      <HeroSection />
      <ServicesSection />
      <FeaturedLookbook />
      <HowItWorksSection />
      <FabricShowcaseSection />
      <TestimonialsSection />
      <TalkToUsSection />
      <CTABanner />
    </>
  )
}
