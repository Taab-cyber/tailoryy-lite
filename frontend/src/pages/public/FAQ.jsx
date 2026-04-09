import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

/* ─── FAQ Data ─── */
const faqGroups = [
  {
    id: 'ordering',
    title: 'Ordering',
    icon: '🛍️',
    faqs: [
      {
        q: 'How do I place an order with Tailoryy?',
        a: "You can start an order directly on our website by visiting the Order page and selecting your service — Custom Stitch, Upcycle It, or Bring Your Fabric. Once you submit the order form, our team will get in touch within one business day to confirm details, discuss the design, and walk you through the next steps. You can also reach us via WhatsApp if you prefer a more conversational start.",
      },
      {
        q: "Can I request something I don't see in your portfolio?",
        a: "Absolutely. Our portfolio is just a sample of what we've made. If you have a design in mind — whether it's a garment style we haven't shown, a very specific silhouette, or a fusion of styles — just describe it or share a reference image. We'll tell you honestly whether it's something we can execute and how.",
      },
      {
        q: 'Can I make changes to my order after placing it?',
        a: "Minor changes (like adjusting hem length, sleeve style, or adding a detail) can be accommodated before stitching begins. Once we start the actual stitching, significant design changes may not be possible or may incur an additional charge. We'll always communicate clearly before proceeding, so you'll have a chance to review and confirm the design before we start.",
      },
      {
        q: 'Do you take rush orders?',
        a: "We do occasionally accept rush orders depending on our current capacity. Rush orders typically incur a 20–30% additional fee due to the priority handling required. Please contact us before placing a rush order so we can confirm availability. We never compromise on quality — if we can't meet your deadline without rushing the craftsmanship, we'll tell you honestly.",
      },
    ],
  },
  {
    id: 'measurements',
    title: 'Measurements',
    icon: '📏',
    faqs: [
      {
        q: 'How do I take accurate measurements at home?',
        a: "We send a detailed measurement guide with step-by-step photos when you place an order. The guide covers all the key measurements — bust, waist, hip, shoulder width, sleeve length, and garment length. You'll need a flexible measuring tape and ideally a second person to help. If you're unsure about any measurement, just send us a photo or a video call — we're happy to guide you through it.",
      },
      {
        q: "What if the finished garment doesn't fit properly?",
        a: "If there's a fit issue caused by an error on our end — for example, if we measured incorrectly from the guide you sent — we'll alter it at no additional cost. If the issue is due to measurements you provided being inaccurate, we'll still help with alterations at a nominal fee. We want you to love what you receive, and we'll work with you to make that happen.",
      },
      {
        q: 'I have non-standard body proportions. Can you still stitch for me?',
        a: "Yes — that's exactly why custom stitching exists. Standard sizing is designed around an average that doesn't fit most people well. We work with your actual measurements, so whether you have a petite frame, a plus size, uneven shoulders, or any other consideration, we'll pattern the garment to fit you specifically. No adjustments needed after delivery in most cases.",
      },
    ],
  },
  {
    id: 'fabric',
    title: 'Fabric',
    icon: '🧵',
    faqs: [
      {
        q: 'How do I choose the right fabric for my garment?',
        a: "Browse our fabric catalogue to see what's available. Each fabric listing includes the type, colour, and price per metre. If you're unsure which fabric suits your design — for example, whether silk or georgette would work better for the drape you want — tell us the garment and occasion, and we'll recommend options. We're happy to share swatch photos on request before you finalise.",
      },
      {
        q: 'Can I send my own fabric for stitching?',
        a: "Yes — our 'Bring Your Fabric' service is designed exactly for this. You share photos and details of your fabric, we advise on its suitability and the quantity needed, and then you ship it to our studio. We'll stitch your garment and return any leftover fabric along with the finished piece.",
      },
      {
        q: 'What if the fabric I want is not in your catalogue?',
        a: "Our catalogue is updated regularly but doesn't cover everything. If you have a specific fabric in mind — a particular type, weight, or colour — describe it to us and we'll try to source it. We work with fabric suppliers across India and can often procure what you need. Additional sourcing time may be required.",
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: '💳',
    faqs: [
      {
        q: 'What payment methods do you accept?',
        a: "We accept UPI (Google Pay, PhonePe, Paytm), bank transfers (NEFT/IMPS), and debit/credit cards via our secure payment gateway. For international clients with a delivery address in India, we can arrange payment via bank transfer. We do not accept cash or cheque payments.",
      },
      {
        q: 'Do you charge an advance? When is the remaining amount due?',
        a: "We charge a 50% advance when your order is confirmed and the design is finalised. The remaining 50% is due before we dispatch your order. For Upcycle and Bring Your Fabric orders, the advance is charged once we receive and assess your garment or fabric. We'll send you a breakdown of all charges before collecting any payment.",
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    icon: '📦',
    faqs: [
      {
        q: 'How long does delivery take after my garment is ready?',
        a: "Once your garment is ready, we dispatch it via a reputable courier service. Standard delivery within India typically takes 2–5 business days, depending on your location. We provide a tracking number as soon as the order is dispatched. Metro cities are usually faster; remote areas may take slightly longer.",
      },
      {
        q: 'Do you deliver outside India?',
        a: "We currently ship within India only. We're actively working on enabling international shipping. If you are based abroad but have a delivery address in India (family member, friend, or forwarding address), we're happy to deliver there. Keep an eye on our website for updates on international delivery.",
      },
    ],
  },
  {
    id: 'support',
    title: 'Chat & Support',
    icon: '💬',
    faqs: [
      {
        q: 'What are your support hours?',
        a: "Our team is available Monday to Saturday, 10am to 7pm IST. We aim to respond to all WhatsApp messages and emails within a few hours during working hours. If you reach out on a Sunday or public holiday, we'll get back to you on the next working day. For urgent matters, WhatsApp is the fastest channel.",
      },
      {
        q: 'I have a complaint about my order. How do I raise it?',
        a: "We're sorry to hear something didn't go as expected. Please reach out to us via email at hello@tailoryy.com or WhatsApp with your order details and photos if relevant. We take every complaint seriously and aim to resolve issues within 3–5 business days. Our goal is to make every experience right — please don't hesitate to contact us.",
      },
    ],
  },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex justify-between items-start px-5 py-4 text-left bg-white hover:bg-ivory transition-colors gap-4"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-espresso text-sm md:text-base leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className={`text-muted flex-shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 py-4 bg-ivory/70 border-t border-border text-charcoal text-sm leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQGroup({ group }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      id={group.id}
      className="scroll-mt-20"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl" role="img" aria-label={group.title}>
          {group.icon}
        </span>
        <h2 className="font-serif text-2xl text-espresso">{group.title}</h2>
      </div>
      <div className="space-y-3">
        {group.faqs.map((faq, i) => (
          <FAQItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <>
      <Helmet>
        <title>FAQ — Tailoryy</title>
        <meta
          name="description"
          content="Answers to the most common questions about Tailoryy's custom stitching, upcycling, measurements, payments, and delivery."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-ivory section-padding pt-24 text-center">
        <div className="container-max max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 rounded-full bg-terracotta/15 flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle size={28} className="text-terracotta" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl text-espresso mb-5"
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal text-lg leading-relaxed"
          >
            Everything you need to know before, during, and after placing an order. Can't find what you're looking for? Just ask us.
          </motion.p>

          {/* Group nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {faqGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="px-4 py-1.5 rounded-full border border-border bg-white text-espresso text-sm font-medium hover:border-terracotta hover:text-terracotta transition-colors"
              >
                {group.icon} {group.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ groups */}
      <section className="section-padding bg-white">
        <div className="container-max max-w-3xl mx-auto space-y-12">
          {faqGroups.map((group) => (
            <FAQGroup key={group.id} group={group} />
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="section-padding bg-cream text-center">
        <div className="container-max max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl text-espresso mb-4">
              Still have a question?
            </h2>
            <p className="text-charcoal mb-8 leading-relaxed">
              Our team is happy to help with anything not covered here. Reach out over WhatsApp, email, or our contact form — we usually respond within a few hours on working days.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button className="btn-primary px-8">
                  Contact Us
                </Button>
              </Link>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}?text=Hi%20Tailoryy%2C%20I%20have%20a%20question.`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="btn-ghost border border-border px-8">
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
