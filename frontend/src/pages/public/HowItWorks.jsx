import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Upload,
  Ruler,
  Scissors,
  Package,
  MessageSquare,
  Palette,
  Camera,
  RefreshCw,
  Shirt,
  CheckCircle,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Divider from '../../components/ui/Divider';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

/* ─── Flows ─── */
const flows = [
  {
    id: 'custom-stitch',
    title: 'Custom Stitch',
    tagline: 'Dream it. Describe it. Wear it.',
    description:
      "Have an outfit in mind — from your Pinterest board, a wedding vision, or your imagination? Share it with us and we'll bring it to life from scratch, in the fabric and silhouette of your choice.",
    accent: 'terracotta',
    accentBg: 'bg-terracotta/10',
    accentBorder: 'border-terracotta',
    accentText: 'text-terracotta',
    accentCircle: 'bg-terracotta text-white',
    steps: [
      {
        icon: <Upload size={20} />,
        title: 'Share Your Inspiration',
        desc: 'Send us photos, screenshots, sketches, or a description of what you have in mind. The more detail, the better.',
      },
      {
        icon: <Ruler size={20} />,
        title: 'Send Your Measurements',
        desc: "We'll guide you through taking accurate measurements at home with our simple measurement guide — no tailor visit needed.",
      },
      {
        icon: <Palette size={20} />,
        title: 'Choose Your Fabric',
        desc: 'Browse our fabric catalogue or describe your preference. We source silks, cottons, georgettes, and more from verified suppliers.',
      },
      {
        icon: <CheckCircle size={20} />,
        title: 'Confirm Your Order',
        desc: "We'll share a design summary and cost breakdown for your approval before we begin. No surprises.",
      },
      {
        icon: <Scissors size={20} />,
        title: 'We Stitch',
        desc: 'Our skilled tailors begin crafting your garment with precision. You receive progress updates along the way.',
      },
      {
        icon: <Package size={20} />,
        title: 'Delivered to Your Door',
        desc: 'Your finished garment is carefully packed and shipped directly to you, anywhere in India.',
      },
    ],
  },
  {
    id: 'upcycle',
    title: 'Upcycle It',
    tagline: 'Old garment. New story.',
    description:
      "That saree your mother gifted you, or a dress you love but never wear anymore — we can transform it into something you'll reach for every day. Upcycling is sustainable, sentimental, and uniquely yours.",
    accent: 'espresso',
    accentBg: 'bg-espresso/10',
    accentBorder: 'border-espresso',
    accentText: 'text-espresso',
    accentCircle: 'bg-espresso text-white',
    steps: [
      {
        icon: <Camera size={20} />,
        title: 'Photograph Your Garment',
        desc: 'Send clear photos of the garment from multiple angles. Show any areas of wear, embroidery, or special elements you want preserved.',
      },
      {
        icon: <MessageSquare size={20} />,
        title: 'Discuss the Transformation',
        desc: "We'll suggest what's possible — a lehenga into a skirt-blouse set, a saree into a gown, a kurta into a co-ord. You decide.",
      },
      {
        icon: <RefreshCw size={20} />,
        title: 'Ship Your Garment to Us',
        desc: "Once we agree on the design, you ship the garment to our studio. We'll confirm receipt and begin the transformation.",
      },
      {
        icon: <Package size={20} />,
        title: 'Transformed and Delivered',
        desc: 'Your reimagined piece is shipped back to you — refreshed, reworked, and ready to be loved all over again.',
      },
    ],
  },
  {
    id: 'own-fabric',
    title: 'Bring Your Fabric',
    tagline: 'You have the fabric. We have the skill.',
    description:
      "Have a special fabric — bought on a trip, gifted by a loved one, or passed down through generations? We'll stitch it into exactly the garment you envision, treating every metre with the care it deserves.",
    accent: 'charcoal',
    accentBg: 'bg-charcoal/10',
    accentBorder: 'border-charcoal',
    accentText: 'text-charcoal',
    accentCircle: 'bg-charcoal text-white',
    steps: [
      {
        icon: <Camera size={20} />,
        title: 'Share Fabric Details',
        desc: 'Send photos and details of your fabric — type, weight, quantity, and any special characteristics we should know about.',
      },
      {
        icon: <Ruler size={20} />,
        title: 'Measurements & Silhouette',
        desc: "Share your measurements and describe the silhouette. We'll advise whether the fabric quantity and type suits the design.",
      },
      {
        icon: <MessageSquare size={20} />,
        title: 'Design Discussion',
        desc: 'We refine the design together — neckline, sleeve style, length, lining, finishing details — until it feels exactly right.',
      },
      {
        icon: <Shirt size={20} />,
        title: 'Ship Your Fabric',
        desc: "Ship the fabric to our studio. We'll confirm receipt and handle it with care throughout the stitching process.",
      },
      {
        icon: <Package size={20} />,
        title: 'Stitched & Shipped Back',
        desc: 'Your garment is stitched to your specifications and shipped back to you, along with any leftover fabric.',
      },
    ],
  },
];

/* ─── FAQs ─── */
const faqs = [
  {
    q: 'How do I take accurate measurements at home?',
    a: 'We provide a detailed measurement guide with photos when you place an order. Measurements include bust, waist, hip, shoulder width, sleeve length, and garment length. Most clients find it easy to follow — and you can always ask your family member for help.',
  },
  {
    q: 'Can I request changes after confirming my order?',
    a: "Minor adjustments (like hem length or sleeve style) can be accommodated before we start stitching. Once stitching begins, significant design changes may incur additional charges. We'll always communicate clearly before proceeding.",
  },
  {
    q: 'How long does it take to receive my order?',
    a: 'Custom Stitch orders take 10–15 business days. Upcycle orders take 7–12 days after we receive your garment. Bring Your Fabric orders take 8–12 days after fabric receipt. Delivery time (2–5 days) is additional.',
  },
  {
    q: "What if the finished garment doesn't fit properly?",
    a: "We offer one free alteration if there's a sizing issue caused by a measuring error on our end. If you provided incorrect measurements, we'll still help — alterations at a nominal fee. Your satisfaction matters to us.",
  },
  {
    q: 'Do you work with international clients?',
    a: "Currently, we ship within India only. We're working on expanding internationally. If you're based abroad with a delivery address in India, we're happy to work with you.",
  },
  {
    q: 'Can I see the fabric before you stitch?',
    a: "Yes. For orders where we source the fabric, we'll send photos and swatches (on request) before stitching begins. For your own fabric orders, you already know what you're working with — and we'll confirm its suitability before starting.",
  },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-5 py-4 text-left bg-white hover:bg-ivory transition-colors"
        onClick={onToggle}
      >
        <span className="font-medium text-espresso pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-muted flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 py-4 bg-ivory text-charcoal text-sm leading-relaxed border-t border-border">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlowSection({ flow, index }) {
  const isEven = index % 2 === 0;
  return (
    <section className={`section-padding ${isEven ? 'bg-white' : 'bg-ivory'}`} id={flow.id}>
      <div className="container-max">
        <div className={`grid md:grid-cols-2 gap-12 items-start ${isEven ? '' : 'md:flex-row-reverse'}`}>
          {/* Text side */}
          <motion.div {...fadeInUp} className={isEven ? 'md:order-1' : 'md:order-2'}>
            <div
              className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4 border ${flow.accentBg} ${flow.accentBorder} ${flow.accentText}`}
            >
              {flow.title}
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-espresso mb-3">{flow.tagline}</h2>
            <p className="text-charcoal leading-relaxed mb-8">{flow.description}</p>
            <Link to="/order">
              <Button className="btn-primary inline-flex items-center gap-2">
                Start {flow.title} <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>

          {/* Steps side */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`space-y-5 ${isEven ? 'md:order-2' : 'md:order-1'}`}
          >
            {flow.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${flow.accentCircle}`}
                  >
                    {i + 1}
                  </div>
                  {i < flow.steps.length - 1 && (
                    <div className={`w-px flex-1 mt-2 ${flow.accentBorder} border-l-2 border-dashed opacity-40`} />
                  )}
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={flow.accentText}>{step.icon}</span>
                    <h3 className="font-semibold text-espresso">{step.title}</h3>
                  </div>
                  <p className="text-charcoal text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Helmet>
        <title>How It Works — Tailoryy</title>
        <meta
          name="description"
          content="Learn how Tailoryy's custom stitching, upcycling, and bring-your-own-fabric services work — from inspiration to delivery."
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
            Simple. Personal. Crafted for you.
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl text-espresso mb-6"
          >
            How Tailoryy Works
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal text-lg leading-relaxed"
          >
            We offer three ways to get your perfect garment — custom stitched from scratch, transformed from something you already own, or stitched from fabric that means something to you. All three are equally personal.
          </motion.p>

          {/* Quick nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mt-10"
          >
            {flows.map((flow) => (
              <a
                key={flow.id}
                href={`#${flow.id}`}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-colors ${flow.accentBg} ${flow.accentBorder} ${flow.accentText} hover:opacity-80`}
              >
                {flow.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Flows */}
      {flows.map((flow, i) => (
        <FlowSection key={flow.id} flow={flow} index={i} />
      ))}

      {/* FAQ */}
      <section className="section-padding bg-cream">
        <div className="container-max max-w-3xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl text-espresso mb-4">
              Questions? We Have Answers.
            </h2>
            <p className="text-charcoal">
              Here are the questions we get asked most often. Don't see yours? Just ask us.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding bg-espresso text-center">
        <div className="container-max">
          <motion.h2
            {...fadeInUp}
            className="font-serif text-3xl md:text-4xl text-white mb-4"
          >
            Ready to Begin?
          </motion.h2>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-white/70 mb-8 max-w-lg mx-auto"
          >
            Your perfect garment is a few messages away. Start your order today and we'll guide you through every step.
          </motion.p>
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <Link to="/order">
              <Button className="bg-terracotta hover:bg-terracotta/90 text-white px-10 py-3 rounded-full font-semibold text-lg transition-colors">
                Start Your Order
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
