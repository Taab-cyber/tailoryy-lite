import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  IndianRupee,
  Scissors,
  RefreshCw,
  Shirt,
  ArrowRight,
  Sparkles,
  Leaf,
  Heart,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Divider from '../../components/ui/Divider';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

/* ─── Service data ─── */
const services = [
  {
    id: 'custom-stitch',
    label: 'Custom Stitch',
    icon: <Scissors size={28} />,
    tagline: 'Designed around you. Stitched from scratch.',
    description:
      "Our most popular service. Bring us any design — a photo, a sketch, a reference, or just a feeling — and we'll craft the garment to your exact measurements and taste. Ideal for weddings, festive occasions, everyday ethnic wear, and everything in between.",
    bgClass: 'bg-white',
    accentClass: 'text-terracotta',
    accentBg: 'bg-terracotta/10',
    accentCircle: 'bg-terracotta text-white',
    benefitIcon: <CheckCircle size={18} className="text-terracotta flex-shrink-0 mt-0.5" />,
    benefits: [
      'Fully personalised to your measurements — no standard sizing',
      'Choose from our fabric catalogue or describe what you want',
      'Receive progress updates before and during stitching',
      'One free alteration included if sizing is off on our end',
      'Suitable for lehengas, sarees, kurtas, blouses, Indo-Western fusion wear, and more',
    ],
    process: [
      'Share your inspiration (photos, description, or both)',
      'Take your measurements using our step-by-step guide',
      'Select your fabric from our catalogue',
      'Approve design summary and pricing',
      'We stitch and ship — typically within 10–15 business days',
    ],
    turnaround: '10–15 business days',
    priceFrom: '₹1,500',
    cta: 'Order Custom Stitch',
    ctaLink: '/order?service=custom-stitch',
    highlightBadge: 'Most Popular',
  },
  {
    id: 'upcycle',
    label: 'Upcycle It',
    icon: <RefreshCw size={28} />,
    tagline: 'Give your old clothes a new life.',
    description:
      "Have a garment you love but no longer wear — or one that carries sentimental value but needs reinventing? We'll transform it into something you'll treasure wearing again. Sustainable fashion that honours the story already in the fabric.",
    bgClass: 'bg-ivory',
    accentClass: 'text-espresso',
    accentBg: 'bg-espresso/10',
    accentCircle: 'bg-espresso text-white',
    benefitIcon: <Leaf size={18} className="text-espresso flex-shrink-0 mt-0.5" />,
    canUpcycle: [
      'Sarees → gowns, skirts, blouses, or dupattas',
      'Lehengas → co-ord sets, skirts, or crop tops',
      'Kurtas → dresses, tunics, or short tops',
      'Wedding wear → wearable everyday pieces',
      'Old denim, western wear → fusion outfits',
      'Inherited fabrics → entirely new garments',
    ],
    process: [
      'Send clear photos of your garment from all angles',
      "We propose transformation options based on what's possible",
      'You choose your preferred design direction',
      'Ship the garment to our studio (we confirm receipt)',
      'We transform and ship it back within 7–12 days',
    ],
    turnaround: '7–12 days after we receive your garment',
    priceFrom: '₹500 – ₹2,000',
    cta: 'Upcycle Now',
    ctaLink: '/order?service=upcycle',
    highlightBadge: 'Sustainable',
  },
  {
    id: 'own-fabric',
    label: 'Bring Your Fabric',
    icon: <Shirt size={28} />,
    tagline: 'Your fabric. Our craftsmanship.',
    description:
      "Bought a gorgeous fabric on your last trip? Inherited a cherished sari fabric? Have metres of something beautiful sitting unused? Send it to us and we'll stitch it into the garment you've always imagined — with precision, care, and zero waste.",
    bgClass: 'bg-cream',
    accentClass: 'text-charcoal',
    accentBg: 'bg-charcoal/10',
    accentCircle: 'bg-charcoal text-white',
    benefitIcon: <Heart size={18} className="text-charcoal flex-shrink-0 mt-0.5" />,
    howItWorks: [
      'Photograph your fabric and share details (type, quantity, any special characteristics)',
      "We'll confirm suitability for your design and advise on quantity needed",
      'Share measurements and finalise the design together',
      'Ship the fabric to our studio',
      'We stitch and return your finished garment, plus any leftover fabric',
    ],
    process: [
      'Share fabric photos and details',
      'Design discussion and measurement collection',
      'Ship your fabric to Tailoryy studio',
      'We stitch to your specifications',
      'Your garment is shipped back within 8–12 days of fabric receipt',
    ],
    turnaround: '8–12 days after fabric receipt',
    priceFrom: '₹800+',
    cta: 'Start Stitching',
    ctaLink: '/order?service=own-fabric',
    highlightBadge: 'Personal Touch',
  },
];

function ServiceSection({ service, index }) {
  const isEven = index % 2 === 0;

  return (
    <section id={service.id} className={`section-padding ${service.bgClass} scroll-mt-16`}>
      <div className="container-max">
        {/* Section header */}
        <motion.div {...fadeInUp} className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${service.accentBg} ${service.accentClass}`}>
              {service.icon}
            </div>
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-widest ${service.accentClass} block mb-0.5`}
              >
                {service.highlightBadge}
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-espresso">{service.label}</h2>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted mb-0.5">
                <Clock size={14} /> Turnaround
              </div>
              <p className="text-espresso font-medium">{service.turnaround}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted mb-0.5">
                <IndianRupee size={14} /> Starting price
              </div>
              <p className="text-espresso font-medium">{service.priceFrom}</p>
            </div>
          </div>
        </motion.div>

        <div className={`grid md:grid-cols-2 gap-12 items-start`}>
          {/* Left: tagline + description + benefits/list */}
          <motion.div {...fadeInUp} className={isEven ? 'md:order-1' : 'md:order-2'}>
            <p className={`font-serif text-xl mb-4 ${service.accentClass}`}>{service.tagline}</p>
            <p className="text-charcoal leading-relaxed mb-8">{service.description}</p>

            {/* Benefits / Can Upcycle / How It Works list */}
            {service.benefits && (
              <>
                <h3 className="font-semibold text-espresso mb-4">Why choose Custom Stitch?</h3>
                <ul className="space-y-3">
                  {service.benefits.map((b, i) => (
                    <li key={i} className="flex gap-3 text-charcoal text-sm">
                      {service.benefitIcon}
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {service.canUpcycle && (
              <>
                <h3 className="font-semibold text-espresso mb-4">What can we upcycle?</h3>
                <ul className="space-y-3">
                  {service.canUpcycle.map((b, i) => (
                    <li key={i} className="flex gap-3 text-charcoal text-sm">
                      {service.benefitIcon}
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {service.howItWorks && (
              <>
                <h3 className="font-semibold text-espresso mb-4">Here's how it works</h3>
                <ul className="space-y-3">
                  {service.howItWorks.map((b, i) => (
                    <li key={i} className="flex gap-3 text-charcoal text-sm">
                      {service.benefitIcon}
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-8">
              <Link to={service.ctaLink}>
                <Button className="btn-primary inline-flex items-center gap-2">
                  {service.cta} <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: numbered process */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={isEven ? 'md:order-2' : 'md:order-1'}
          >
            <div className={`rounded-2xl p-6 border border-border ${service.accentBg}`}>
              <h3 className="font-semibold text-espresso mb-6 flex items-center gap-2">
                <Sparkles size={16} className={service.accentClass} />
                Step-by-step process
              </h3>
              <ol className="space-y-5">
                {service.process.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${service.accentCircle}`}
                    >
                      {i + 1}
                    </div>
                    <div className="pt-1 text-charcoal text-sm leading-relaxed">{step}</div>
                  </li>
                ))}
              </ol>

              <Divider className="my-6" />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className={`p-3 rounded-xl bg-white/60`}>
                  <p className="text-xs text-muted mb-1">Turnaround</p>
                  <p className={`font-semibold text-sm ${service.accentClass}`}>{service.turnaround}</p>
                </div>
                <div className={`p-3 rounded-xl bg-white/60`}>
                  <p className="text-xs text-muted mb-1">Starting from</p>
                  <p className={`font-semibold text-sm ${service.accentClass}`}>{service.priceFrom}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>Services — Tailoryy</title>
        <meta
          name="description"
          content="Tailoryy offers three bespoke services: Custom Stitch from scratch, Upcycle your old garments, or bring your own fabric to be stitched into something beautiful."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-ivory section-padding pt-24 text-center">
        <div className="container-max max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3"
          >
            What We Offer
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl text-espresso mb-6"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal text-lg leading-relaxed"
          >
            Whether you're starting from a dream, transforming something old, or using fabric with a history — we have a service built for you. All three are personal, all three are crafted with care.
          </motion.p>

          {/* Quick nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {services.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-5 py-2 rounded-full border border-border bg-white text-espresso text-sm font-medium hover:border-terracotta hover:text-terracotta transition-colors"
              >
                {s.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Service sections */}
      {services.map((service, i) => (
        <ServiceSection key={service.id} service={service} index={i} />
      ))}

      {/* Bottom CTA */}
      <section className="section-padding bg-espresso text-center">
        <div className="container-max">
          <motion.h2 {...fadeInUp} className="font-serif text-3xl md:text-4xl text-white mb-4">
            Not sure which service you need?
          </motion.h2>
          <motion.p {...fadeInUp} transition={{ delay: 0.1 }} className="text-white/70 mb-8 max-w-lg mx-auto">
            Reach out to us — we'll help you figure out the best approach for your garment, your timeline, and your budget. No pressure, no obligation.
          </motion.p>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="flex flex-wrap gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-terracotta hover:bg-terracotta/90 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Talk to Us
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
