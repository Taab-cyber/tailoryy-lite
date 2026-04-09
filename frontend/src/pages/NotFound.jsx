// NotFound.jsx — Elegant on-brand 404 page
import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Tailoryy</title>
      </Helmet>
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {/* Large decorative number */}
          <p
            className="font-serif font-semibold text-[10rem] leading-none text-terracotta-light select-none"
            aria-hidden
          >
            404
          </p>
          <h1 className="font-serif text-3xl text-espresso mt-2 mb-4">
            This page got lost in the stitches.
          </h1>
          <p className="font-sans text-muted leading-relaxed mb-8">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back to something beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <Link to="/portfolio" className="btn-ghost">
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
