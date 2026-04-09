import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MessageCircle,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject' },
  { value: 'general', label: 'General Enquiry' },
  { value: 'order', label: 'Order Question' },
  { value: 'upcycle', label: 'Upcycle Discussion' },
  { value: 'fabric', label: 'Fabric Question' },
  { value: 'other', label: 'Other' },
];

const contactOptions = [
  {
    id: 'live-chat',
    icon: <MessageCircle size={24} />,
    title: 'Live Chat',
    description: 'Chat with our team',
    detail: 'Usually replies in minutes',
    accent: 'text-terracotta',
    accentBg: 'bg-terracotta/10',
    accentBorder: 'border-terracotta/30',
    action: () => {
      if (typeof window !== 'undefined' && window.Tawk_API?.maximize) {
        window.Tawk_API.maximize();
      } else {
        toast('Live chat is starting up — try again in a moment.', { icon: '💬' });
      }
    },
    actionLabel: 'Start Chat',
    actionClass: 'btn-primary',
  },
  {
    id: 'whatsapp',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    title: 'WhatsApp',
    description: 'Message us on WhatsApp',
    detail: 'Send photos, measurements, references',
    accent: 'text-green-600',
    accentBg: 'bg-green-50',
    accentBorder: 'border-green-300',
    isLink: true,
    href: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'}?text=Hi%20Tailoryy%2C%20I%27d%20like%20to%20enquire%20about%20your%20services.`,
    actionLabel: 'Open WhatsApp',
    actionClass: 'bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors',
  },
  {
    id: 'call',
    icon: <Phone size={24} />,
    title: 'Call Us',
    description: 'Speak to our team directly',
    detail: import.meta.env.VITE_CONTACT_PHONE || '+91 98765 43210',
    accent: 'text-espresso',
    accentBg: 'bg-espresso/10',
    accentBorder: 'border-espresso/30',
    isLink: true,
    href: `tel:${import.meta.env.VITE_CONTACT_PHONE || '+919876543210'}`,
    actionLabel: 'Call Now',
    actionClass: 'bg-espresso hover:bg-espresso/90 text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors',
  },
  {
    id: 'email',
    icon: <Mail size={24} />,
    title: 'Email Us',
    description: 'For detailed enquiries',
    detail: 'hello@tailoryy.com',
    accent: 'text-charcoal',
    accentBg: 'bg-charcoal/10',
    accentBorder: 'border-charcoal/30',
    isLink: true,
    href: 'mailto:hello@tailoryy.com',
    actionLabel: 'Send Email',
    actionClass: 'bg-charcoal hover:bg-charcoal/90 text-white rounded-full px-5 py-2 text-sm font-semibold transition-colors',
  },
];

function ContactOptionCard({ option }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`card-base p-6 border-2 ${option.accentBorder} flex flex-col gap-4 h-full`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${option.accentBg} ${option.accent}`}>
        {option.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-espresso text-lg">{option.title}</h3>
        <p className="text-charcoal text-sm mt-1">{option.description}</p>
        <p className={`text-sm font-medium mt-1 ${option.accent}`}>{option.detail}</p>
      </div>
      {option.isLink ? (
        <a href={option.href} target="_blank" rel="noopener noreferrer" className="self-start">
          <span className={option.actionClass}>{option.actionLabel}</span>
        </a>
      ) : (
        <button onClick={option.action} className={`self-start ${option.actionClass} rounded-full px-5 py-2 text-sm font-semibold transition-colors`}>
          {option.actionLabel}
        </button>
      )}
    </motion.div>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_MESSAGE = 500;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const messageValue = watch('message', '');

  const contactMutation = useMutation({
    mutationFn: (data) => api.post('/contact/', data),
    onSuccess: () => {
      setSubmitted(true);
      reset();
    },
    onError: () => {
      toast.error('Something went wrong. Please try again or reach us on WhatsApp.');
    },
  });

  const onSubmit = (data) => {
    contactMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Tailoryy</title>
        <meta
          name="description"
          content="Get in touch with Tailoryy — chat, WhatsApp, call, or email us. We're here to help with your custom garment, upcycle, or fabric questions."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-ivory section-padding pt-24 text-center">
        <div className="container-max max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-terracotta text-sm font-semibold uppercase tracking-widest mb-3"
          >
            We'd love to hear from you
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl text-espresso mb-5"
          >
            Let's Talk
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal text-lg leading-relaxed"
          >
            Whether you have a question, a garment idea, or just want to understand how we work — reach out through any of the channels below. We're a small team and we read every message personally.
          </motion.p>
        </div>
      </section>

      {/* Contact option cards */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactOptions.map((option) => (
              <ContactOptionCard key={option.id} option={option} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="section-padding bg-ivory">
        <div className="container-max max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-espresso mb-3">
              Send Us a Message
            </h2>
            <p className="text-charcoal">
              Prefer to write? Fill in the form below and we'll get back to you within one business day.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16 card-base p-10"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="font-serif text-2xl text-espresso mb-3">Message Sent!</h3>
                <p className="text-charcoal leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out. We'll review your message and get back to you within one business day.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-terracotta text-sm hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="card-base p-6 md:p-8 space-y-5"
                noValidate
              >
                {/* Name + Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">
                      Your Name <span className="text-terracotta">*</span>
                    </label>
                    <Input
                      {...register('name', { required: 'Please enter your name' })}
                      placeholder="Priya Sharma"
                      className={`input-base w-full ${errors.name ? 'border-red-400' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">
                      Email Address <span className="text-terracotta">*</span>
                    </label>
                    <Input
                      {...register('email', {
                        required: 'Please enter your email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                      type="email"
                      placeholder="priya@example.com"
                      className={`input-base w-full ${errors.email ? 'border-red-400' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Phone + Subject */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">
                      Phone Number{' '}
                      <span className="text-muted font-normal">(optional)</span>
                    </label>
                    <Input
                      {...register('phone', {
                        pattern: {
                          value: /^[+\d\s\-()]{7,15}$/,
                          message: 'Please enter a valid phone number',
                        },
                      })}
                      type="tel"
                      placeholder="+91 98765 43210"
                      className={`input-base w-full ${errors.phone ? 'border-red-400' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-espresso mb-1.5">
                      Subject <span className="text-terracotta">*</span>
                    </label>
                    <Select
                      {...register('subject', { required: 'Please select a subject' })}
                      className={`input-base w-full ${errors.subject ? 'border-red-400' : ''}`}
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-espresso">
                      Message <span className="text-terracotta">*</span>
                    </label>
                    <span className={`text-xs ${messageValue.length > MAX_MESSAGE - 50 ? 'text-terracotta' : 'text-muted'}`}>
                      {messageValue.length}/{MAX_MESSAGE}
                    </span>
                  </div>
                  <Textarea
                    {...register('message', {
                      required: 'Please write a message',
                      maxLength: {
                        value: MAX_MESSAGE,
                        message: `Message cannot exceed ${MAX_MESSAGE} characters`,
                      },
                      minLength: {
                        value: 10,
                        message: 'Please write at least 10 characters',
                      },
                    })}
                    rows={5}
                    placeholder="Tell us about your garment idea, a question about an existing order, or anything else on your mind..."
                    className={`input-base w-full resize-none ${errors.message ? 'border-red-400' : ''}`}
                    maxLength={MAX_MESSAGE}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={contactMutation.isPending}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <Send size={16} />
                  Send Message
                </Button>

                <p className="text-xs text-muted text-center">
                  We typically respond within one business day. For urgent help, use WhatsApp or Live Chat above.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Studio info */}
      <section className="section-padding bg-espresso text-center">
        <div className="container-max max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-serif text-2xl text-white">Our Studio</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              We work remotely — all consultations, approvals, and updates happen over chat, email, or call. You don't need to visit us in person. We deliver directly to your door, anywhere in India.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/60 mt-4">
              <span>Mon – Sat: 10am – 7pm IST</span>
              <span className="hidden md:inline">·</span>
              <span>Sunday: Closed</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
