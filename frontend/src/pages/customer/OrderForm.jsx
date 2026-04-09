// OrderForm.jsx — 7-step order wizard for Tailoryy fashion house
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import {
  Scissors,
  RefreshCw,
  Layers,
  UploadCloud,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Tag,
  Truck,
  Zap,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Home,
  AlertCircle,
  CheckCircle,
  Package,
  MessageCircle,
  LayoutDashboard,
} from 'lucide-react'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Card from '../../components/ui/Card'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7

const SERVICES = [
  {
    id: 'custom_stitch',
    label: 'Custom Stitch',
    desc: 'Design from scratch with your inspiration images',
    icon: Scissors,
  },
  {
    id: 'upcycle',
    label: 'Upcycle It',
    desc: 'Transform an old garment into something new',
    icon: RefreshCw,
  },
  {
    id: 'bring_fabric',
    label: 'Bring Your Fabric',
    desc: 'We stitch your provided fabric',
    icon: Layers,
  },
]

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest / Bust', required: true },
  { key: 'waist', label: 'Waist', required: true },
  { key: 'hip', label: 'Hip', required: true },
  { key: 'shoulder', label: 'Shoulder Width', required: true },
  { key: 'sleeve', label: 'Sleeve Length', required: true },
  { key: 'top_length', label: 'Top Length', required: true },
  { key: 'bottom_length', label: 'Bottom Length', required: true },
  { key: 'height', label: 'Height', required: false },
  { key: 'weight', label: 'Weight (kg)', required: false },
]

const FABRIC_OPTIONS = [
  { value: 'silk', label: 'Silk' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'georgette', label: 'Georgette' },
  { value: 'linen', label: 'Linen' },
  { value: 'velvet', label: 'Velvet' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'net', label: 'Net' },
  { value: 'other', label: 'Other' },
]

const COLOURS = [
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Blush', hex: '#FFB6C1' },
  { name: 'Rose', hex: '#FF007F' },
  { name: 'Red', hex: '#EF233C' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Coral', hex: '#FF6B6B' },
  { name: 'Orange', hex: '#FF8C00' },
  { name: 'Amber', hex: '#FFBF00' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Yellow', hex: '#FFE135' },
  { name: 'Sage', hex: '#9CAF88' },
  { name: 'Mint', hex: '#98FF98' },
  { name: 'Green', hex: '#4CAF50' },
  { name: 'Forest', hex: '#228B22' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Sky', hex: '#87CEEB' },
  { name: 'Blue', hex: '#4169E1' },
  { name: 'Navy', hex: '#001F5B' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Violet', hex: '#7F00FF' },
  { name: 'Purple', hex: '#9B59B6' },
  { name: 'Mauve', hex: '#E0B0FF' },
  { name: 'Lilac', hex: '#C8A2C8' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Hot Pink', hex: '#FF69B4' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Brown', hex: '#795548' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Rust', hex: '#B7410E' },
  { name: 'Terracotta', hex: '#C0755A' },
  { name: 'Peach', hex: '#FFCBA4' },
  { name: 'Dusty Rose', hex: '#DCAE96' },
  { name: 'Slate', hex: '#708090' },
]

const EMBELLISHMENTS = [
  'Zari Work',
  'Mirror Work',
  'Sequins',
  'Thread Embroidery',
  'Beadwork',
  'None',
  'Other',
]

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const PROMO_CODES = {
  TAILORYY10: { discount: 10, type: 'percent' },
  FIRST20:    { discount: 20, type: 'percent' },
  UPCYCLE15:  { discount: 15, type: 'percent' },
}

const MEASUREMENT_TIPS = [
  { label: 'Chest / Bust', tip: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor.' },
  { label: 'Waist', tip: 'Measure around your natural waistline, usually the narrowest part of your torso.' },
  { label: 'Hip', tip: 'Measure around the fullest part of your hips, about 7–9 inches below your waist.' },
  { label: 'Shoulder Width', tip: 'Measure from one shoulder seam to the other, across the back.' },
  { label: 'Sleeve Length', tip: 'Measure from the shoulder seam down to your wrist with your arm slightly bent.' },
  { label: 'Top Length', tip: 'Measure from the shoulder (nape of neck) down to where you want the top/blouse to end.' },
  { label: 'Bottom Length', tip: 'Measure from your waist down to where you want the garment to end.' },
  { label: 'Height', tip: 'Stand straight against a wall and measure from floor to the top of your head.' },
  { label: 'Weight', tip: 'Optional — helps our team estimate fabric requirements.' },
]

// ─── Utility helpers ──────────────────────────────────────────────────────────

function getBasePrice(serviceId) {
  if (serviceId === 'bring_fabric') return 1500
  if (serviceId === 'upcycle') return 2000
  return 2500
}

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(true); return }
    const script = document.createElement('script')
    script.src = src
    script.onload  = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function fireConfetti() {
  import('canvas-confetti').then(({ default: confetti }) => {
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ['#C0755A','#D4956A','#8B4513','#FFD700','#FF69B4'] })
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 } }), 400)
  }).catch(() => {})
}

// ─── SVG Body Silhouette ──────────────────────────────────────────────────────

function BodySilhouette() {
  const dots = [
    { cx: 100, cy: 115, label: 'Shoulder' },
    { cx: 100, cy: 148, label: 'Chest/Bust' },
    { cx: 100, cy: 180, label: 'Waist' },
    { cx: 100, cy: 210, label: 'Hip' },
    { cx: 60,  cy: 175, label: 'Sleeve' },
    { cx: 100, cy: 155, label: 'Top Length' },
    { cx: 100, cy: 270, label: 'Bottom Length' },
  ]

  return (
    <svg viewBox="0 0 200 400" className="w-full h-auto max-h-80 mx-auto" aria-label="Body measurement guide">
      {/* Head */}
      <ellipse cx="100" cy="45" rx="22" ry="28" fill="#F5E6DC" stroke="#C0755A" strokeWidth="1.5" />
      {/* Neck */}
      <rect x="90" y="70" width="20" height="18" rx="4" fill="#F5E6DC" stroke="#C0755A" strokeWidth="1.5" />
      {/* Torso */}
      <path
        d="M65,88 C52,92 44,105 42,125 C40,145 42,165 44,185 C46,205 50,220 52,240 L148,240 C150,220 154,205 156,185 C158,165 160,145 158,125 C156,105 148,92 135,88 C125,84 115,82 100,82 C85,82 75,84 65,88 Z"
        fill="#F5E6DC" stroke="#C0755A" strokeWidth="1.5"
      />
      {/* Left arm */}
      <path
        d="M65,88 C58,95 50,110 46,130 C43,148 42,165 44,180"
        fill="none" stroke="#C0755A" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Right arm */}
      <path
        d="M135,88 C142,95 150,110 154,130 C157,148 158,165 156,180"
        fill="none" stroke="#C0755A" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Left leg */}
      <path
        d="M52,240 C50,265 48,290 48,320 C48,345 50,365 52,380"
        fill="none" stroke="#C0755A" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Right leg */}
      <path
        d="M148,240 C150,265 152,290 152,320 C152,345 150,365 148,380"
        fill="none" stroke="#C0755A" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Left foot */}
      <ellipse cx="52" cy="384" rx="14" ry="6" fill="#F5E6DC" stroke="#C0755A" strokeWidth="1.5" />
      {/* Right foot */}
      <ellipse cx="148" cy="384" rx="14" ry="6" fill="#F5E6DC" stroke="#C0755A" strokeWidth="1.5" />

      {/* Measurement dots */}
      {dots.map((d) => (
        <g key={d.label}>
          <circle cx={d.cx} cy={d.cy} r="6" fill="#C0755A" opacity="0.9" />
          <circle cx={d.cx} cy={d.cy} r="3" fill="white" />
        </g>
      ))}
    </svg>
  )
}

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const completed = step < current
        const active    = step === current
        return (
          <React.Fragment key={step}>
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium font-sans border-2 transition-all duration-300
                ${completed ? 'bg-terracotta border-terracotta text-white' : ''}
                ${active    ? 'bg-white border-terracotta text-terracotta' : ''}
                ${!completed && !active ? 'bg-white border-gray-300 text-gray-400' : ''}
              `}
            >
              {completed ? <Check size={14} /> : step}
            </div>
            {step < total && (
              <div
                className={`h-0.5 w-6 sm:w-10 transition-all duration-300 ${completed ? 'bg-terracotta' : 'bg-gray-200'}`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }) {
  const pct = Math.round(((current - 1) / (total - 1)) * 100)
  return (
    <div className="w-full mb-2">
      <div className="flex justify-between text-xs text-muted font-sans mb-1">
        <span>Step {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-terracotta rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

// ─── Step wrapper animation ───────────────────────────────────────────────────

const stepVariants = {
  enter:  (dir) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
}

// ─── File upload item ─────────────────────────────────────────────────────────

function UploadThumb({ file, onRemove }) {
  const url = file.preview || (file.url ? file.url : null)
  return (
    <div className="relative group rounded-sm overflow-hidden border border-border bg-cream aspect-square">
      {url && (
        <img src={url} alt={file.name || 'upload'} className="w-full h-full object-cover" />
      )}
      {file.uploading && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-1">
          <Spinner size="sm" />
          <span className="text-xs text-muted font-sans">{file.progress ?? 0}%</span>
        </div>
      )}
      {file.error && (
        <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center p-1">
          <span className="text-xs text-error font-sans text-center">{file.error}</span>
        </div>
      )}
      <button
        onClick={() => onRemove(file.id)}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-espresso/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
        aria-label="Remove image"
      >
        <X size={10} />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderForm() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()

  const [step, setStep]           = useState(1)
  const [direction, setDirection] = useState(1)
  const [errors, setErrors]       = useState({})
  const [showMeasureModal, setShowMeasureModal] = useState(false)
  const [showFabricDrawer, setShowFabricDrawer] = useState(false)
  const [fabricCatalogue, setFabricCatalogue]   = useState([])
  const [fabricLoading, setFabricLoading]       = useState(false)
  const [savedMeasurements, setSavedMeasurements] = useState(null)
  const [promoInput, setPromoInput]   = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoError, setPromoError]   = useState('')
  const [orderCreating, setOrderCreating] = useState(false)
  const [createdOrder, setCreatedOrder]   = useState(null)
  const [paymentDone, setPaymentDone]     = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1
    service: '',
    // Step 2
    inspirationImages: [],  // [{id, name, preview, url, uploading, progress, error}]
    description: '',
    // Step 3
    measurements: { chest:'', waist:'', hip:'', shoulder:'', sleeve:'', top_length:'', bottom_length:'', height:'', weight:'' },
    saveMeasurements: false,
    // Step 4
    fabricType: '',
    selectedFabric: null,
    colours: [],
    colourDescription: '',
    embellishments: [],
    // Step 5
    fullName:  user?.full_name || '',
    phone:     user?.phone || '',
    address:   '',
    city:      '',
    state:     '',
    pincode:   '',
    saveAddress: false,
    deliveryType: 'standard',
    specialInstructions: '',
  })

  const update = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const updateMeasurement = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      measurements: { ...prev.measurements, [key]: value },
    }))

  // ── Load saved measurements ──────────────────────────────────────────────

  const loadSavedMeasurements = useCallback(async () => {
    try {
      const { data } = await api.get('/users/me/measurements')
      setSavedMeasurements(data)
    } catch {
      // not found — ignore
    }
  }, [])

  useEffect(() => { loadSavedMeasurements() }, [loadSavedMeasurements])

  const applySavedMeasurements = () => {
    if (!savedMeasurements) return
    const m = {}
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      if (savedMeasurements[key] != null) m[key] = String(savedMeasurements[key])
    })
    setFormData((prev) => ({ ...prev, measurements: { ...prev.measurements, ...m } }))
    toast.success('Saved measurements applied!')
  }

  // ── File upload (react-dropzone) ─────────────────────────────────────────

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach((r) => {
      const msg = r.errors?.[0]?.message || 'File rejected'
      toast.error(`${r.file.name}: ${msg}`)
    })

    if (formData.inspirationImages.length + acceptedFiles.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }

    const newItems = acceptedFiles.map((f) => ({
      id:       Math.random().toString(36).slice(2),
      name:     f.name,
      preview:  URL.createObjectURL(f),
      url:      null,
      uploading: true,
      progress:  0,
      error:    null,
      _file:    f,
    }))

    setFormData((prev) => ({
      ...prev,
      inspirationImages: [...prev.inspirationImages, ...newItems],
    }))

    // Upload each file
    for (const item of newItems) {
      const fd = new FormData()
      fd.append('file', item._file)
      try {
        const { data } = await api.post('/uploads/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / (e.total || 1))
            setFormData((prev) => ({
              ...prev,
              inspirationImages: prev.inspirationImages.map((img) =>
                img.id === item.id ? { ...img, progress: pct } : img
              ),
            }))
          },
        })
        setFormData((prev) => ({
          ...prev,
          inspirationImages: prev.inspirationImages.map((img) =>
            img.id === item.id ? { ...img, uploading: false, url: data.url || data.file_url } : img
          ),
        }))
      } catch (err) {
        setFormData((prev) => ({
          ...prev,
          inspirationImages: prev.inspirationImages.map((img) =>
            img.id === item.id ? { ...img, uploading: false, error: 'Upload failed' } : img
          ),
        }))
        toast.error(`Failed to upload ${item.name}`)
      }
    }
  }, [formData.inspirationImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  })

  const removeImage = (id) => {
    setFormData((prev) => ({
      ...prev,
      inspirationImages: prev.inspirationImages.filter((img) => img.id !== id),
    }))
  }

  // ── Fabric catalogue ─────────────────────────────────────────────────────

  const openFabricDrawer = async () => {
    setShowFabricDrawer(true)
    if (fabricCatalogue.length > 0) return
    setFabricLoading(true)
    try {
      const { data } = await api.get('/fabrics/')
      setFabricCatalogue(Array.isArray(data) ? data : data.results || [])
    } catch {
      toast.error('Could not load fabric catalogue')
    } finally {
      setFabricLoading(false)
    }
  }

  // ── Colour multi-select (max 3) ──────────────────────────────────────────

  const toggleColour = (name) => {
    setFormData((prev) => {
      const sel = prev.colours
      if (sel.includes(name)) return { ...prev, colours: sel.filter((c) => c !== name) }
      if (sel.length >= 3) { toast('Max 3 colours', { icon: '🎨' }); return prev }
      return { ...prev, colours: [...sel, name] }
    })
  }

  // ── Embellishments ───────────────────────────────────────────────────────

  const toggleEmbellishment = (val) => {
    setFormData((prev) => {
      const sel = prev.embellishments
      if (sel.includes(val)) return { ...prev, embellishments: sel.filter((e) => e !== val) }
      return { ...prev, embellishments: [...sel, val] }
    })
  }

  // ── Promo code ───────────────────────────────────────────────────────────

  const applyPromo = () => {
    setPromoError('')
    const code = promoInput.trim().toUpperCase()
    if (!code) { setPromoError('Enter a promo code'); return }
    const found = PROMO_CODES[code]
    if (!found) { setPromoError('Invalid promo code'); setPromoResult(null); return }
    setPromoResult({ code, ...found })
    toast.success(`Promo applied: ${found.discount}% off!`)
  }

  // ── Pricing calculation ──────────────────────────────────────────────────

  const basePrice    = getBasePrice(formData.service)
  const expressFee   = formData.deliveryType === 'express' ? 500 : 0
  const subtotal     = basePrice + expressFee
  const discountAmt  = promoResult ? Math.round((subtotal * promoResult.discount) / 100) : 0
  const totalEst     = subtotal - discountAmt
  const advanceAmt   = Math.round(totalEst * 0.5)

  // ── Validation per step ──────────────────────────────────────────────────

  const validate = () => {
    const e = {}

    if (step === 1) {
      if (!formData.service) e.service = 'Please select a service to continue'
    }

    if (step === 3) {
      MEASUREMENT_FIELDS.filter((f) => f.required).forEach(({ key, label }) => {
        const val = formData.measurements[key]
        if (!val || isNaN(Number(val)) || Number(val) <= 0)
          e[`meas_${key}`] = `${label} is required`
      })
    }

    if (step === 5) {
      if (!formData.fullName.trim())   e.fullName  = 'Full name is required'
      if (!formData.phone.trim())      e.phone     = 'Phone number is required'
      else if (!/^\d{10}$/.test(formData.phone.trim())) e.phone = 'Enter a valid 10-digit number'
      if (!formData.address.trim())    e.address   = 'Address is required'
      if (!formData.city.trim())       e.city      = 'City is required'
      if (!formData.state)             e.state     = 'Please select a state'
      if (!/^\d{6}$/.test(formData.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode'
    }

    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Please fix the errors before continuing')
      return false
    }
    return true
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    if (!validate()) return
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goPrev = () => {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 1))
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Place order (Step 6 → Step 7) ────────────────────────────────────────

  const placeOrder = async () => {
    if (!validate()) return
    setOrderCreating(true)
    try {
      const imageUrls = formData.inspirationImages
        .filter((i) => i.url)
        .map((i) => i.url)

      const payload = {
        service_type:    formData.service,
        inspiration_images: imageUrls,
        description:     formData.description,
        measurements:    formData.measurements,
        fabric_type:     formData.fabricType,
        fabric_id:       formData.selectedFabric?.id || null,
        colours:         formData.colours,
        colour_description: formData.colourDescription,
        embellishments:  formData.embellishments,
        delivery_type:   formData.deliveryType,
        special_instructions: formData.specialInstructions,
        shipping_address: {
          full_name: formData.fullName,
          phone:     formData.phone,
          address:   formData.address,
          city:      formData.city,
          state:     formData.state,
          pincode:   formData.pincode,
        },
        promo_code:      promoResult?.code || null,
        estimated_total: totalEst,
        advance_amount:  advanceAmt,
      }

      const { data } = await api.post('/orders/', payload)
      setCreatedOrder(data)

      // Save measurements if requested
      if (formData.saveMeasurements) {
        try {
          await api.put('/users/me/measurements', formData.measurements)
        } catch { /* non-fatal */ }
      }

      // Save address if requested
      if (formData.saveAddress) {
        try {
          await api.put('/users/me/address', {
            full_name: formData.fullName,
            phone:     formData.phone,
            address:   formData.address,
            city:      formData.city,
            state:     formData.state,
            pincode:   formData.pincode,
          })
        } catch { /* non-fatal */ }
      }

      setDirection(1)
      setStep(7)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.')
    } finally {
      setOrderCreating(false)
    }
  }

  // ── Razorpay payment ─────────────────────────────────────────────────────

  const initiatePayment = async () => {
    if (!createdOrder) return
    setPaymentLoading(true)

    const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
    const isDemoMode = !rzpKey || rzpKey === 'rzp_test_demo'

    if (isDemoMode) {
      // Demo / mock payment
      await new Promise((r) => setTimeout(r, 1200))
      setPaymentDone(true)
      fireConfetti()
      setPaymentLoading(false)
      return
    }

    try {
      const { data: rzpOrder } = await api.post('/payments/create-order', {
        order_id: createdOrder.id,
        amount:   advanceAmt,
      })

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!loaded) { toast.error('Payment gateway unavailable'); setPaymentLoading(false); return }

      const options = {
        key:         rzpKey,
        amount:      rzpOrder.amount,
        currency:    rzpOrder.currency || 'INR',
        name:        'Tailoryy',
        description: `Order #${createdOrder.order_number || createdOrder.id}`,
        order_id:    rzpOrder.razorpay_order_id,
        prefill: {
          name:    formData.fullName,
          contact: formData.phone,
          email:   user?.email || '',
        },
        theme: { color: '#C0755A' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              order_id:            createdOrder.id,
            })
            setPaymentDone(true)
            fireConfetti()
          } catch {
            toast.error('Payment verification failed. Contact support.')
          } finally {
            setPaymentLoading(false)
          }
        },
        modal: { ondismiss: () => setPaymentLoading(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed')
      setPaymentLoading(false)
    }
  }

  // ── Step renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div>
      <h2 className="font-serif text-2xl text-espresso mb-2">Choose Your Service</h2>
      <p className="text-muted font-sans text-sm mb-6">What would you like us to create for you?</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICES.map(({ id, label, desc, icon: Icon }) => {
          const selected = formData.service === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => { update('service', id); setErrors({}) }}
              className={`
                text-left p-6 rounded-md border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta
                ${selected
                  ? 'border-terracotta bg-terracotta-light/30 shadow-sm'
                  : 'border-border bg-white hover:border-terracotta/40 hover:bg-cream/50'}
              `}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${selected ? 'bg-terracotta text-white' : 'bg-cream text-terracotta'}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-serif text-lg text-espresso mb-1">{label}</h3>
              <p className="font-sans text-sm text-muted">{desc}</p>
              {selected && (
                <div className="mt-3 flex items-center gap-1.5 text-terracotta font-sans text-xs font-medium">
                  <Check size={13} /> Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      {errors.service && (
        <p className="mt-3 text-sm text-error font-sans flex items-center gap-1.5">
          <AlertCircle size={14} /> {errors.service}
        </p>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 className="font-serif text-2xl text-espresso mb-2">Upload Inspiration</h2>
      <p className="text-muted font-sans text-sm mb-6">Share images that inspire your design. JPG, PNG, WEBP — max 10MB each, up to 10 files.</p>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-colors mb-4
          ${isDragActive ? 'border-terracotta bg-terracotta-light/20' : 'border-terracotta/40 hover:border-terracotta hover:bg-cream/40 bg-cream/20'}
        `}
      >
        <input {...getInputProps()} />
        <UploadCloud size={36} className="mx-auto mb-3 text-terracotta opacity-70" />
        <p className="font-sans text-sm text-charcoal font-medium">
          {isDragActive ? 'Drop images here…' : 'Drag images here or click to browse'}
        </p>
        <p className="font-sans text-xs text-muted mt-1">JPG, PNG, WEBP · Max 10MB · Up to 10 files</p>
      </div>

      {/* Thumbnail grid */}
      {formData.inspirationImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {formData.inspirationImages.map((file) => (
            <UploadThumb key={file.id} file={file} onRemove={removeImage} />
          ))}
        </div>
      )}

      {/* Description */}
      <Textarea
        label="Describe what you're envisioning"
        placeholder="Tell us about colours, silhouette, occasion, style references…"
        value={formData.description}
        onChange={(e) => update('description', e.target.value)}
        maxLength={500}
        rows={4}
      />
    </div>
  )

  const renderStep3 = () => (
    <div>
      <h2 className="font-serif text-2xl text-espresso mb-2">Your Measurements</h2>
      <p className="text-muted font-sans text-sm mb-6">Enter your measurements in centimetres for a perfect fit.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: SVG + actions */}
        <div>
          <BodySilhouette />
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowMeasureModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-terracotta font-sans hover:underline"
            >
              <HelpCircle size={15} /> How to Measure?
            </button>
            {savedMeasurements && (
              <button
                type="button"
                onClick={applySavedMeasurements}
                className="inline-flex items-center gap-1.5 text-sm text-charcoal font-sans hover:text-terracotta transition-colors border border-border rounded-sm px-3 py-1.5 w-fit hover:border-terracotta"
              >
                <Check size={14} /> Use saved measurements
              </button>
            )}
          </div>
        </div>

        {/* Right: Inputs */}
        <div className="flex flex-col gap-4">
          {MEASUREMENT_FIELDS.map(({ key, label, required }) => (
            <Input
              key={key}
              label={`${label} ${required ? '' : '(optional)'}`}
              type="number"
              min="0"
              step="0.5"
              placeholder="cm"
              value={formData.measurements[key]}
              onChange={(e) => { updateMeasurement(key, e.target.value); setErrors((prev) => { const n = {...prev}; delete n[`meas_${key}`]; return n }) }}
              error={errors[`meas_${key}`]}
              required={required}
            />
          ))}

          <label className="flex items-center gap-2.5 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={formData.saveMeasurements}
              onChange={(e) => update('saveMeasurements', e.target.checked)}
              className="w-4 h-4 accent-terracotta rounded"
            />
            <span className="font-sans text-sm text-charcoal">Save to my profile</span>
          </label>
        </div>
      </div>

      {/* Measurement tips modal */}
      <Modal
        isOpen={showMeasureModal}
        onClose={() => setShowMeasureModal(false)}
        title="How to Measure"
        size="md"
      >
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          {MEASUREMENT_TIPS.map(({ label, tip }) => (
            <div key={label} className="border-b border-border pb-3 last:border-0">
              <h4 className="font-sans font-semibold text-sm text-espresso mb-1">{label}</h4>
              <p className="font-sans text-sm text-muted">{tip}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )

  const renderStep4 = () => (
    <div>
      <h2 className="font-serif text-2xl text-espresso mb-2">Fabric & Colour</h2>
      <p className="text-muted font-sans text-sm mb-6">Tell us about your fabric preference and colour choices.</p>

      {/* Fabric */}
      <div className="flex gap-3 items-end mb-6">
        <div className="flex-1">
          <Select
            label="Fabric Type"
            value={formData.fabricType}
            onChange={(e) => update('fabricType', e.target.value)}
            options={FABRIC_OPTIONS}
            placeholder="Select fabric"
          />
        </div>
        <Button variant="outline" size="sm" onClick={openFabricDrawer} className="mb-0.5 whitespace-nowrap">
          Browse Catalogue
        </Button>
      </div>

      {formData.selectedFabric && (
        <div className="flex items-center gap-3 mb-6 p-3 rounded-sm bg-cream border border-border">
          {formData.selectedFabric.image_url && (
            <img src={formData.selectedFabric.image_url} alt={formData.selectedFabric.name} className="w-12 h-12 object-cover rounded-sm" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-espresso truncate">{formData.selectedFabric.name}</p>
            <p className="font-sans text-xs text-muted">{formData.selectedFabric.material || ''}</p>
          </div>
          <button
            type="button"
            onClick={() => update('selectedFabric', null)}
            className="text-muted hover:text-error transition-colors"
            aria-label="Remove fabric"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Colours */}
      <div className="mb-6">
        <p className="font-sans text-sm font-medium text-charcoal mb-3">
          Colour Palette <span className="text-muted font-normal">(select up to 3)</span>
        </p>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
          {COLOURS.map(({ name, hex }) => {
            const selected = formData.colours.includes(name)
            const isLight  = ['Ivory','Cream','White','Champagne','Yellow','Mint'].includes(name)
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => toggleColour(name)}
                className={`
                  relative w-8 h-8 rounded-full border-2 transition-all
                  ${selected ? 'border-terracotta scale-110 shadow-md' : 'border-transparent hover:scale-105 hover:border-gray-300'}
                  ${isLight ? 'ring-1 ring-gray-200' : ''}
                `}
                style={{ backgroundColor: hex }}
                aria-pressed={selected}
                aria-label={name}
              >
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check size={12} className={isLight ? 'text-espresso' : 'text-white'} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {formData.colours.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {formData.colours.map((c) => {
              const found = COLOURS.find((col) => col.name === c)
              return (
                <span key={c} className="inline-flex items-center gap-1.5 text-xs font-sans bg-cream border border-border rounded-full px-2.5 py-1">
                  <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ backgroundColor: found?.hex }} />
                  {c}
                  <button onClick={() => toggleColour(c)} className="text-muted hover:text-error"><X size={10} /></button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Colour description */}
      <div className="mb-6">
        <Textarea
          label="Describe your colour preference"
          placeholder="e.g., Deep jewel tones, pastel gradient, monochrome with contrast trim…"
          value={formData.colourDescription}
          onChange={(e) => update('colourDescription', e.target.value)}
          rows={3}
        />
      </div>

      {/* Embellishments */}
      <div>
        <p className="font-sans text-sm font-medium text-charcoal mb-3">Embellishments</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EMBELLISHMENTS.map((em) => {
            const checked = formData.embellishments.includes(em)
            return (
              <label
                key={em}
                className={`
                  flex items-center gap-2.5 cursor-pointer p-3 rounded-sm border transition-all
                  ${checked ? 'border-terracotta bg-terracotta-light/20' : 'border-border hover:border-terracotta/40'}
                `}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleEmbellishment(em)}
                  className="w-4 h-4 accent-terracotta rounded"
                />
                <span className="font-sans text-sm text-charcoal">{em}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Fabric catalogue drawer */}
      <Modal
        isOpen={showFabricDrawer}
        onClose={() => setShowFabricDrawer(false)}
        title="Fabric Catalogue"
        size="xl"
      >
        {fabricLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : fabricCatalogue.length === 0 ? (
          <p className="text-center text-muted font-sans py-8">No fabrics found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
            {fabricCatalogue.map((fab) => (
              <button
                key={fab.id}
                type="button"
                onClick={() => { update('selectedFabric', fab); setShowFabricDrawer(false) }}
                className={`
                  text-left rounded-sm border-2 overflow-hidden transition-all hover:shadow-md
                  ${formData.selectedFabric?.id === fab.id ? 'border-terracotta' : 'border-border hover:border-terracotta/50'}
                `}
              >
                {fab.image_url ? (
                  <img src={fab.image_url} alt={fab.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-cream flex items-center justify-center">
                    <Layers size={24} className="text-muted" />
                  </div>
                )}
                <div className="p-2">
                  <p className="font-sans text-xs font-medium text-espresso truncate">{fab.name}</p>
                  {fab.price_per_metre && (
                    <p className="font-sans text-xs text-muted">₹{fab.price_per_metre}/m</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )

  const renderStep5 = () => (
    <div>
      <h2 className="font-serif text-2xl text-espresso mb-2">Delivery Details</h2>
      <p className="text-muted font-sans text-sm mb-6">Where should we deliver your creation?</p>

      {/* Shipping address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Input
          label="Full Name"
          placeholder="Sneha Sharma"
          value={formData.fullName}
          onChange={(e) => { update('fullName', e.target.value); setErrors((p) => ({...p, fullName: ''})) }}
          error={errors.fullName}
          required
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="10-digit mobile number"
          value={formData.phone}
          onChange={(e) => { update('phone', e.target.value); setErrors((p) => ({...p, phone: ''})) }}
          error={errors.phone}
          required
        />
        <div className="sm:col-span-2">
          <Input
            label="Address Line"
            placeholder="Street, Locality, Landmark"
            value={formData.address}
            onChange={(e) => { update('address', e.target.value); setErrors((p) => ({...p, address: ''})) }}
            error={errors.address}
            required
          />
        </div>
        <Input
          label="City"
          placeholder="Mumbai"
          value={formData.city}
          onChange={(e) => { update('city', e.target.value); setErrors((p) => ({...p, city: ''})) }}
          error={errors.city}
          required
        />
        <Select
          label="State"
          value={formData.state}
          onChange={(e) => { update('state', e.target.value); setErrors((p) => ({...p, state: ''})) }}
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
          placeholder="Select state"
          error={errors.state}
          required
        />
        <Input
          label="Pincode"
          placeholder="400001"
          value={formData.pincode}
          onChange={(e) => { update('pincode', e.target.value); setErrors((p) => ({...p, pincode: ''})) }}
          error={errors.pincode}
          required
        />
      </div>

      {/* Save address toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer mb-6">
        <input
          type="checkbox"
          checked={formData.saveAddress}
          onChange={(e) => update('saveAddress', e.target.checked)}
          className="w-4 h-4 accent-terracotta rounded"
        />
        <span className="font-sans text-sm text-charcoal">Save this address to my profile</span>
      </label>

      {/* Delivery type */}
      <div className="mb-6">
        <p className="font-sans text-sm font-medium text-charcoal mb-3">Delivery Type</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'standard', icon: Truck,  label: 'Standard Delivery', sub: '10–15 business days', badge: 'Free' },
            { id: 'express',  icon: Zap,    label: 'Express Delivery',  sub: '5–7 business days',  badge: '+₹500' },
          ].map(({ id, icon: Icon, label, sub, badge }) => (
            <label
              key={id}
              className={`
                flex items-start gap-4 p-4 rounded-md border-2 cursor-pointer transition-all
                ${formData.deliveryType === id ? 'border-terracotta bg-terracotta-light/20' : 'border-border hover:border-terracotta/40'}
              `}
            >
              <input
                type="radio"
                name="deliveryType"
                value={id}
                checked={formData.deliveryType === id}
                onChange={() => update('deliveryType', id)}
                className="mt-0.5 accent-terracotta"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon size={16} className="text-terracotta" />
                  <span className="font-sans text-sm font-medium text-espresso">{label}</span>
                  <Badge variant={id === 'express' ? 'warning' : 'success'}>{badge}</Badge>
                </div>
                <p className="font-sans text-xs text-muted">{sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Special instructions */}
      <Textarea
        label="Special Instructions"
        placeholder="Any special notes for our team (optional)…"
        value={formData.specialInstructions}
        onChange={(e) => update('specialInstructions', e.target.value)}
        maxLength={200}
        rows={3}
      />
    </div>
  )

  const renderStep6 = () => {
    const svc = SERVICES.find((s) => s.id === formData.service)
    return (
      <div>
        <h2 className="font-serif text-2xl text-espresso mb-2">Review & Pricing</h2>
        <p className="text-muted font-sans text-sm mb-6">Confirm your order details before placing.</p>

        {/* Summary card */}
        <Card className="mb-6 p-0 overflow-hidden">
          <div className="bg-cream px-5 py-3 border-b border-border">
            <h3 className="font-serif text-base text-espresso">Order Summary</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <SummaryRow label="Service" value={svc?.label || '—'} />
            <SummaryRow label="Inspiration Images" value={`${formData.inspirationImages.filter((i) => i.url).length} uploaded`} />
            <SummaryRow
              label="Measurements"
              value={`${Object.values(formData.measurements).filter((v) => v && v !== '').length} of ${MEASUREMENT_FIELDS.length} filled`}
            />
            <SummaryRow label="Fabric" value={formData.selectedFabric?.name || (formData.fabricType ? FABRIC_OPTIONS.find((f) => f.value === formData.fabricType)?.label : '—') || '—'} />
            <SummaryRow label="Colours" value={formData.colours.length ? formData.colours.join(', ') : '—'} />
            <SummaryRow
              label="Embellishments"
              value={formData.embellishments.length ? formData.embellishments.join(', ') : '—'}
            />
            <SummaryRow
              label="Delivery"
              value={formData.deliveryType === 'express' ? 'Express (5–7 days)' : 'Standard (10–15 days)'}
            />
            <SummaryRow
              label="Ship To"
              value={`${formData.fullName}, ${formData.city}, ${formData.state} – ${formData.pincode}`}
            />
          </div>
        </Card>

        {/* Pricing */}
        <Card className="mb-6 p-0 overflow-hidden">
          <div className="bg-cream px-5 py-3 border-b border-border">
            <h3 className="font-serif text-base text-espresso">Estimated Pricing</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex justify-between font-sans text-sm">
              <span className="text-charcoal">Base Stitching Fee</span>
              <span className="text-espresso font-medium">₹{basePrice.toLocaleString()}</span>
            </div>
            {expressFee > 0 && (
              <div className="flex justify-between font-sans text-sm">
                <span className="text-charcoal">Express Delivery Surcharge</span>
                <span className="text-espresso font-medium">+₹{expressFee}</span>
              </div>
            )}
            {promoResult && (
              <div className="flex justify-between font-sans text-sm text-success">
                <span>Promo ({promoResult.code})</span>
                <span>−₹{discountAmt.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-sans text-base font-semibold text-espresso">
              <span>Total Estimate</span>
              <span>₹{totalEst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-terracotta font-medium">
              <span>50% Advance (due now)</span>
              <span>₹{advanceAmt.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted font-sans bg-amber-50 border border-amber-200 rounded-sm p-2.5 mt-1">
              Final price confirmed by our team within 24 hours of order placement.
            </p>
          </div>
        </Card>

        {/* Promo code */}
        <div className="mb-6">
          <p className="font-sans text-sm font-medium text-charcoal mb-2">Promo Code</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter code (e.g. TAILORYY10)"
                value={promoInput}
                onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null) }}
                error={promoError}
              />
            </div>
            <Button variant="outline" size="md" onClick={applyPromo} className="shrink-0">
              <Tag size={15} /> Apply
            </Button>
          </div>
          {promoResult && (
            <p className="mt-1.5 text-sm text-success font-sans flex items-center gap-1.5">
              <CheckCircle size={14} /> {promoResult.discount}% discount applied
            </p>
          )}
        </div>

        {/* Place Order */}
        <Button
          size="lg"
          className="w-full"
          loading={orderCreating}
          onClick={placeOrder}
        >
          <ShoppingBag size={18} /> Place Order
        </Button>
        <p className="text-xs text-center text-muted font-sans mt-2">
          By placing an order you agree to our Terms & Conditions.
        </p>
      </div>
    )
  }

  const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || ''
  const isDemoMode = !rzpKey || rzpKey === 'rzp_test_demo'

  const renderStep7 = () => {
    if (paymentDone) {
      // Confirmation card
      return (
        <div className="text-center py-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-300 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-success" />
          </motion.div>

          <h2 className="font-serif text-3xl text-espresso mb-2">Order Confirmed!</h2>
          <p className="text-muted font-sans text-sm mb-6">Thank you for choosing Tailoryy. Our team will review your order shortly.</p>

          <div className="bg-cream rounded-md border border-border p-6 mb-6 max-w-sm mx-auto">
            <p className="font-sans text-xs text-muted uppercase tracking-wide mb-1">Order Number</p>
            <p className="font-serif text-3xl text-terracotta font-bold">
              #{createdOrder?.order_number || createdOrder?.id?.toString().slice(-6).toUpperCase() || 'TY0001'}
            </p>
            <p className="font-sans text-xs text-muted mt-2">
              50% advance of ₹{advanceAmt.toLocaleString()} paid
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(`/dashboard/orders/${createdOrder?.id}`)}
              variant="primary"
            >
              <Package size={16} /> Track Your Order
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.Tawk_API?.maximize?.()}
            >
              <MessageCircle size={16} /> Chat with Us
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <LayoutDashboard size={16} /> Go to Dashboard
            </Button>
          </div>
        </div>
      )
    }

    // Payment step
    return (
      <div>
        <h2 className="font-serif text-2xl text-espresso mb-2">Payment</h2>
        <p className="text-muted font-sans text-sm mb-6">Complete your advance payment to confirm the order.</p>

        {/* Order number */}
        <div className="bg-cream rounded-md border border-border p-5 mb-6 text-center">
          <p className="font-sans text-xs text-muted uppercase tracking-wide mb-1">Your Order Number</p>
          <p className="font-serif text-3xl text-terracotta font-bold">
            #{createdOrder?.order_number || createdOrder?.id?.toString().slice(-6).toUpperCase() || 'TY0001'}
          </p>
        </div>

        {/* Payment summary */}
        <Card className="mb-6 p-5">
          <div className="flex justify-between mb-2 font-sans text-sm text-charcoal">
            <span>Estimated Total</span>
            <span>₹{totalEst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-sans text-base font-semibold text-terracotta">
            <span>Advance Amount (50%)</span>
            <span>₹{advanceAmt.toLocaleString()}</span>
          </div>
          <p className="mt-3 text-xs text-muted font-sans">
            Remaining ₹{(totalEst - advanceAmt).toLocaleString()} payable on final confirmation.
          </p>
        </Card>

        {isDemoMode ? (
          <div className="text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 text-sm font-sans text-amber-700">
              Demo mode — no real payment will be charged.
            </div>
            <Button
              size="lg"
              className="w-full"
              loading={paymentLoading}
              onClick={initiatePayment}
            >
              Simulate Payment Success
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            loading={paymentLoading}
            onClick={initiatePayment}
          >
            Pay ₹{advanceAmt.toLocaleString()} via Razorpay
          </Button>
        )}

        <p className="text-xs text-center text-muted font-sans mt-3">
          Secured by Razorpay · UPI, Cards, Net Banking accepted
        </p>
      </div>
    )
  }

  const STEP_RENDERS = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
    renderStep7,
  ]

  const STEP_TITLES = [
    'Choose Service',
    'Inspiration',
    'Measurements',
    'Fabric & Colour',
    'Delivery',
    'Review & Pricing',
    'Payment',
  ]

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Helmet>
        <title>Place an Order — Tailoryy</title>
        <meta name="description" content="Create your custom order with Tailoryy's step-by-step fashion design wizard." />
      </Helmet>

      <div className="min-h-screen bg-ivory py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-espresso mb-1">Place Your Order</h1>
            <p className="font-sans text-sm text-muted">{STEP_TITLES[step - 1]}</p>
          </div>

          {/* Progress */}
          <ProgressBar current={step} total={TOTAL_STEPS} />
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Step content */}
          <div className="bg-white rounded-md shadow-sm border border-border overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="p-6 sm:p-8"
              >
                {STEP_RENDERS[step - 1]?.()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {!(step === 7 && paymentDone) && step !== 6 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={step === 1}
                className={step === 1 ? 'invisible' : ''}
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              {step < 6 && (
                <Button onClick={goNext}>
                  {step === 5 ? 'Review Order' : 'Continue'} <ChevronRight size={16} />
                </Button>
              )}
            </div>
          )}

          {/* Step 6 has its own CTA inside the render */}
          {step === 6 && (
            <div className="flex justify-start mt-6">
              <Button variant="outline" onClick={goPrev}>
                <ChevronLeft size={16} /> Previous
              </Button>
            </div>
          )}

          {/* Step 7: prev only if not paid */}
          {step === 7 && !paymentDone && (
            <div className="flex justify-start mt-6">
              <Button variant="outline" onClick={goPrev}>
                <ChevronLeft size={16} /> Back to Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Helper: summary row ──────────────────────────────────────────────────────

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 font-sans text-sm">
      <span className="text-muted shrink-0">{label}</span>
      <span className="text-espresso text-right">{value}</span>
    </div>
  )
}
