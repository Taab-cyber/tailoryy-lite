// utils/constants.js — App-wide constants and lookup tables

export const SERVICE_LABELS = {
  custom_stitch: 'Custom Stitch',
  upcycle:       'Upcycle It',
  own_fabric:    'Bring Your Fabric',
}

export const ORDER_STATUS_LABELS = {
  pending:       'Pending',
  confirmed:     'Confirmed',
  cutting:       'Cutting',
  stitching:     'Stitching',
  quality_check: 'Quality Check',
  shipped:       'Shipped',
  delivered:     'Delivered',
  cancelled:     'Cancelled',
}

export const ORDER_STATUS_VARIANTS = {
  pending:       'neutral',
  confirmed:     'brand',
  cutting:       'warning',
  stitching:     'warning',
  quality_check: 'info',
  shipped:       'info',
  delivered:     'success',
  cancelled:     'error',
}

export const FABRIC_TYPES = [
  { value: 'silk',      label: 'Silk' },
  { value: 'cotton',    label: 'Cotton' },
  { value: 'georgette', label: 'Georgette' },
  { value: 'linen',     label: 'Linen' },
  { value: 'velvet',    label: 'Velvet' },
  { value: 'chiffon',   label: 'Chiffon' },
  { value: 'net',       label: 'Net' },
  { value: 'other',     label: 'Other' },
]

export const PORTFOLIO_CATEGORIES = [
  { value: 'lehenga',     label: 'Lehenga' },
  { value: 'saree',       label: 'Saree' },
  { value: 'kurta',       label: 'Kurta' },
  { value: 'indo_western',label: 'Indo-Western' },
  { value: 'upcycled',    label: 'Upcycled' },
  { value: 'western',     label: 'Western' },
]

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
]

export const FASHION_COLOURS = [
  { name: 'Ivory',       hex: '#FAF7F2' }, { name: 'Cream',      hex: '#F5EFE6' },
  { name: 'Blush',       hex: '#FFCBA4' }, { name: 'Rose',       hex: '#E8899A' },
  { name: 'Red',         hex: '#C0392B' }, { name: 'Burgundy',   hex: '#800020' },
  { name: 'Coral',       hex: '#FF6B6B' }, { name: 'Orange',     hex: '#E67E22' },
  { name: 'Amber',       hex: '#F39C12' }, { name: 'Gold',       hex: '#D4A847' },
  { name: 'Yellow',      hex: '#F1C40F' }, { name: 'Sage',       hex: '#8FAF70' },
  { name: 'Mint',        hex: '#A8E6CF' }, { name: 'Green',      hex: '#27AE60' },
  { name: 'Forest',      hex: '#1E6B3C' }, { name: 'Teal',       hex: '#1ABC9C' },
  { name: 'Sky',         hex: '#87CEEB' }, { name: 'Blue',       hex: '#3498DB' },
  { name: 'Navy',        hex: '#1A2A5E' }, { name: 'Indigo',     hex: '#4B0082' },
  { name: 'Violet',      hex: '#7F00FF' }, { name: 'Purple',     hex: '#9B59B6' },
  { name: 'Mauve',       hex: '#B589B8' }, { name: 'Lilac',      hex: '#C8A2C8' },
  { name: 'Pink',        hex: '#FFB6C1' }, { name: 'Hot Pink',   hex: '#FF69B4' },
  { name: 'Magenta',     hex: '#FF00FF' }, { name: 'Brown',      hex: '#795548' },
  { name: 'Tan',         hex: '#D2B48C' }, { name: 'Camel',      hex: '#C19A6B' },
  { name: 'Charcoal',    hex: '#4A3728' }, { name: 'Black',      hex: '#1A1A1A' },
  { name: 'White',       hex: '#FFFFFF' }, { name: 'Silver',     hex: '#C0C0C0' },
  { name: 'Champagne',   hex: '#F7E7CE' }, { name: 'Rust',       hex: '#B7410E' },
  { name: 'Terracotta',  hex: '#C4704A' }, { name: 'Peach',      hex: '#FFCBA4' },
  { name: 'Dusty Rose',  hex: '#C4A0A0' }, { name: 'Slate',      hex: '#708090' },
]
