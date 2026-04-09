// Footer.jsx — Brand footer with links, contact, social, copyright
import React from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mail, Phone, Instagram, Facebook } from 'lucide-react'
import Divider from '../ui/Divider'

const quickLinks = [
  { to: '/portfolio',        label: 'Portfolio' },
  { to: '/how-it-works',     label: 'How It Works' },
  { to: '/services',         label: 'Services' },
  { to: '/fabric-catalogue', label: 'Fabric Catalogue' },
  { to: '/faq',              label: 'FAQ' },
  { to: '/contact',          label: 'Contact' },
]

const serviceLinks = [
  { to: '/services#custom-stitch', label: 'Custom Stitch' },
  { to: '/services#upcycle',       label: 'Upcycle It' },
  { to: '/services#own-fabric',    label: 'Bring Your Fabric' },
  { to: '/order',                  label: 'Place an Order' },
]

export default function Footer() {
  const phone    = import.meta.env.VITE_CONTACT_PHONE || '+91-XXXXX-XXXXX'
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX'

  return (
    <footer className="bg-espresso text-ivory/80">
      <div className="container-max py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-sans text-2xl font-medium text-ivory">tailor</span>
              <span className="font-serif text-2xl font-semibold text-terracotta italic">yy</span>
            </Link>
            <p className="font-serif text-base italic text-terracotta-light leading-relaxed">
              Your dream outfit, stitched to perfection.
            </p>
            <p className="text-sm leading-relaxed text-ivory/60">
              A premium online fashion house for custom-stitched outfits,
              upcycled garments, and fabric-to-fashion transformations —
              delivered home.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <SocialLink href="https://instagram.com" icon={<Instagram size={16} />} label="Instagram" />
              <SocialLink href="https://facebook.com"  icon={<Facebook size={16} />} label="Facebook" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-ivory mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-ivory/60 hover:text-terracotta transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-base font-semibold text-ivory mb-5">Our Services</h4>
            <ul className="space-y-3">
              {serviceLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-ivory/60 hover:text-terracotta transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold text-ivory mb-5">Get in Touch</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href={`https://wa.me/${whatsapp}?text=Hi%20Tailoryy!%20I%27d%20like%20to%20ask%20about%20an%20outfit.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-ivory/60 hover:text-terracotta transition-colors"
                >
                  <MessageCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>Chat on WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@tailoryy.com"
                  className="flex items-start gap-3 text-sm text-ivory/60 hover:text-terracotta transition-colors"
                >
                  <Mail size={15} className="mt-0.5 flex-shrink-0" />
                  <span>hello@tailoryy.com</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-start gap-3 text-sm text-ivory/60 hover:text-terracotta transition-colors"
                >
                  <Phone size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{phone}<br /><span className="text-xs text-ivory/40">Mon–Sat, 10am–7pm IST</span></span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => window.Tawk_API?.maximize?.()}
                  className="flex items-start gap-3 text-sm text-ivory/60 hover:text-terracotta transition-colors text-left"
                >
                  <MessageCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>Live Chat with us</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Divider className="border-white/10 mx-8" />

      {/* Bottom bar */}
      <div className="container-max py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-ivory/40 font-sans">
          © {new Date().getFullYear()} Tailoryy. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          <Link to="/privacy" className="text-xs text-ivory/40 hover:text-terracotta transition-colors">Privacy Policy</Link>
          <Link to="/terms"   className="text-xs text-ivory/40 hover:text-terracotta transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-ivory/50 hover:border-terracotta hover:text-terracotta transition-colors"
    >
      {icon}
    </a>
  )
}
