// Profile.jsx — Customer profile edit page
import React, { useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Camera,
  Ruler,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'

// ─── measurement fields ───────────────────────────────────────────────────────

const MEASUREMENT_FIELDS = [
  { key: 'bust',     label: 'Bust',     unit: 'cm' },
  { key: 'waist',    label: 'Waist',    unit: 'cm' },
  { key: 'hip',      label: 'Hip',      unit: 'cm' },
  { key: 'shoulder', label: 'Shoulder', unit: 'cm' },
  { key: 'sleeve',   label: 'Sleeve',   unit: 'cm' },
  { key: 'length',   label: 'Length',   unit: 'cm' },
  { key: 'height',   label: 'Height',   unit: 'cm' },
]

// ─── section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card-base p-6 ${className}`}
    >
      <h2 className="font-serif text-xl text-espresso mb-5 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-terracotta" />}
        {title}
      </h2>
      {children}
    </motion.section>
  )
}

// ─── avatar upload ────────────────────────────────────────────────────────────

function AvatarUpload({ user, onUpload }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Local preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)
      const { data } = await api.post('/uploads/image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl = data.url || data.image_url || data.secure_url
      await api.put('/auth/me/', { avatar: imageUrl })
      onUpload(imageUrl)
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-block">
        <Avatar
          src={previewUrl || user?.avatar}
          name={user?.full_name}
          size="xl"
          className="ring-4 ring-border"
        />
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-espresso/40 flex items-center justify-center">
            <Spinner size="sm" color="white" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center shadow-card hover:bg-terracotta-dark transition-colors"
          aria-label="Upload profile photo"
        >
          <Camera size={14} />
        </button>
      </div>
      <p className="text-xs text-muted font-sans">JPG, PNG — max 5 MB</p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  )
}

// ─── profile form ─────────────────────────────────────────────────────────────

function ProfileForm({ user }) {
  const { updateUser } = useAuthStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      phone:     user?.phone     || '',
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.put('/auth/me/', data).then((r) => r.data),
    onSuccess: (data) => {
      updateUser(data)
      toast.success('Profile saved!')
    },
    onError: (err) => toast.error(err.message || 'Could not save profile'),
  })

  return (
    <form onSubmit={handleSubmit(mutate)} className="space-y-4">
      <Input
        label="Full Name"
        required
        placeholder="Your full name"
        error={errors.full_name?.message}
        {...register('full_name', { required: 'Full name is required' })}
      />
      <Input
        label="Email"
        type="email"
        value={user?.email || ''}
        readOnly
        disabled
        helper="Email cannot be changed"
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="+91 98765 43210"
        error={errors.phone?.message}
        {...register('phone', {
          pattern: {
            value: /^[+\d\s\-()]{7,20}$/,
            message: 'Enter a valid phone number',
          },
        })}
      />
      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          loading={isPending}
          disabled={!isDirty}
          size="md"
          className="gap-2"
        >
          <Save size={15} /> Save Changes
        </Button>
      </div>
    </form>
  )
}

// ─── measurements form ────────────────────────────────────────────────────────

function MeasurementsForm({ user }) {
  const { updateUser } = useAuthStore()
  const existing = user?.measurements || {}

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: Object.fromEntries(
      MEASUREMENT_FIELDS.map((f) => [f.key, existing[f.key] ?? ''])
    ),
  })

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: (data) =>
      api.put('/auth/me/', { measurements: data }).then((r) => r.data),
    onSuccess: (data) => {
      updateUser(data)
      toast.success('Measurements saved!')
    },
    onError: (err) => toast.error(err.message || 'Could not save measurements'),
  })

  const { mutate: clear, isPending: clearing } = useMutation({
    mutationFn: () =>
      api.put('/auth/me/', {
        measurements: Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, null])),
      }).then((r) => r.data),
    onSuccess: (data) => {
      updateUser(data)
      reset(Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, ''])))
      toast.success('Measurements cleared')
    },
    onError: (err) => toast.error(err.message || 'Could not clear measurements'),
  })

  return (
    <form onSubmit={handleSubmit(save)} className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MEASUREMENT_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-sans font-medium text-charcoal mb-1">
              {f.label}
              <span className="text-muted ml-1">({f.unit})</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="300"
              placeholder="—"
              className="input-base w-full text-sm"
              {...register(f.key, { valueAsNumber: true })}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-muted font-sans">
        Measurements are auto-filled when placing orders. All values in centimetres.
      </p>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" loading={saving} disabled={!isDirty} size="sm" className="gap-1.5">
          <Save size={14} /> Save Measurements
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={clearing}
          onClick={() => clear()}
        >
          Clear All
        </Button>
      </div>
    </form>
  )
}

// ─── change password ──────────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/auth/change-password/', data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      reset()
    },
    onError: (err) => toast.error(err.message || 'Could not change password'),
  })

  const newPassword = watch('new_password')

  const ToggleIcon = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal transition-colors"
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <form onSubmit={handleSubmit(mutate)} className="space-y-4">
      <div className="relative">
        <Input
          label="Current Password"
          type={showCurrent ? 'text' : 'password'}
          required
          error={errors.current_password?.message}
          {...register('current_password', { required: 'Required' })}
        />
        <ToggleIcon show={showCurrent} onToggle={() => setShowCurrent((p) => !p)} />
      </div>

      <div className="relative">
        <Input
          label="New Password"
          type={showNew ? 'text' : 'password'}
          required
          error={errors.new_password?.message}
          {...register('new_password', {
            required: 'Required',
            minLength: { value: 8, message: 'At least 8 characters' },
          })}
        />
        <ToggleIcon show={showNew} onToggle={() => setShowNew((p) => !p)} />
      </div>

      <div className="relative">
        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          required
          error={errors.confirm_password?.message}
          {...register('confirm_password', {
            required: 'Required',
            validate: (v) => v === newPassword || 'Passwords do not match',
          })}
        />
        <ToggleIcon show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
      </div>

      <Button type="submit" loading={isPending} size="md" className="gap-2">
        <Lock size={14} /> Change Password
      </Button>
    </form>
  )
}

// ─── danger zone ──────────────────────────────────────────────────────────────

function DangerZone() {
  const [open, setOpen]   = useState(false)
  const [confirm, setConfirm] = useState('')
  const { logout } = useAuthStore()

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.delete('/auth/me/'),
    onSuccess: () => {
      toast.success('Account deleted. Goodbye!')
      logout()
    },
    onError: (err) => toast.error(err.message || 'Could not delete account'),
  })

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-sm border border-red-200 bg-red-50">
        <div>
          <p className="font-sans font-medium text-error text-sm">Delete Account</p>
          <p className="text-xs text-muted font-sans mt-0.5">
            This action is permanent and cannot be undone.
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5 flex-shrink-0"
        >
          <Trash2 size={13} /> Delete
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={() => { setOpen(false); setConfirm('') }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-sm border border-red-200">
            <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
            <p className="text-sm font-sans text-charcoal">
              All your orders, measurements, and messages will be permanently deleted.
              This cannot be undone.
            </p>
          </div>
          <div>
            <label className="text-sm font-sans font-medium text-charcoal block mb-1.5">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-base w-full"
              placeholder="DELETE"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isPending}
              disabled={confirm !== 'DELETE'}
              onClick={() => mutate()}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const isEmailUser = !user?.auth_provider || user.auth_provider === 'email'

  const handleAvatarUpload = (url) => {
    updateUser({ avatar: url })
  }

  return (
    <>
      <Helmet>
        <title>My Profile — Tailoryy</title>
      </Helmet>

      <div className="section-padding">
        <div className="container-max max-w-3xl">

          <div className="mb-8">
            <h1 className="font-serif text-3xl text-espresso">My Profile</h1>
            <p className="text-muted font-sans text-sm mt-1">
              Manage your personal information and preferences.
            </p>
          </div>

          <div className="space-y-6">

            {/* Avatar */}
            <Section title="Profile Photo">
              <AvatarUpload user={user} onUpload={handleAvatarUpload} />
            </Section>

            {/* Personal info */}
            <Section title="Personal Information">
              <ProfileForm user={user} />
            </Section>

            {/* Measurements */}
            <Section title="Saved Measurements" icon={Ruler}>
              <MeasurementsForm user={user} />
            </Section>

            {/* Password (email users only) */}
            {isEmailUser && (
              <Section title="Change Password" icon={Lock}>
                <ChangePasswordForm />
              </Section>
            )}

            {/* Danger zone */}
            <Section title="Danger Zone" className="border border-red-200">
              <DangerZone />
            </Section>

          </div>
        </div>
      </div>
    </>
  )
}
