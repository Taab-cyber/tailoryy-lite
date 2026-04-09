// ErrorBoundary.jsx — Catches render errors and shows fallback UI
import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Tailoryy] Render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="font-sans text-5xl font-light text-terracotta-light mb-4">500</p>
            <h1 className="font-serif text-2xl text-espresso mb-3">Something went wrong</h1>
            <p className="text-muted font-sans mb-8 leading-relaxed">
              We're sorry — an unexpected error occurred. Our team has been notified.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-ghost"
              >
                Try Again
              </button>
              <Link to="/" className="btn-primary">Go Home</Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
