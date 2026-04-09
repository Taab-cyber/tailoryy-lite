// Card.jsx — Base card with hover variant support
import React from 'react'

export default function Card({ children, className = '', hover = false, onClick, as: Tag = 'div' }) {
  return (
    <Tag
      onClick={onClick}
      className={`
        card-base
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </Tag>
  )
}
