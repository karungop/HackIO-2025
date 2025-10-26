'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect to main app if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true)
      }, 5000) // 5 second timeout

      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [authLoading])

  // Show loading while checking authentication
  if (authLoading && !loadingTimeout) {
    return (
      <div className="signin-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        
        <style jsx>{`
          .signin-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          p {
            font-size: 1.1rem;
            margin: 0;
          }
        `}</style>
      </div>
    )
  }

  // Show timeout message if loading takes too long
  if (authLoading && loadingTimeout) {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <h1 className="signin-title">Authentication Timeout</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Authentication is taking longer than expected. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="signin-button"
            style={{ width: '100%' }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // Don't render signin form if user is authenticated
  if (user) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (!name.trim()) {
          throw new Error('Name is required for sign up')
        }
        await signUp(email, password, name)
        router.push('/questionnaire')
      } else {
        await signIn(email, password)
      }
      // Redirect will happen automatically via useEffect when user state updates
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="signin-title">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
        
        <form onSubmit={handleSubmit} className="signin-form">
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                placeholder="Enter your full name"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="signin-button"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <div className="signin-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="toggle-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .signin-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        
        .signin-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .signin-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 3rem 2.5rem;
          border-radius: 24px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .signin-title {
          text-align: center;
          margin-bottom: 2.5rem;
          color: #1a1a1a;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        
        .signin-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
          letter-spacing: 0.01em;
        }
        
        .form-group input {
          padding: 1rem 1.25rem;
          border: 2px solid rgba(229, 231, 235, 0.8);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          color: #1a1a1a;
          font-weight: 500;
        }
        
        .form-group input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 
            0 0 0 4px rgba(102, 126, 234, 0.1),
            0 4px 12px rgba(102, 126, 234, 0.15);
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
        }
        
        .form-group input:hover {
          border-color: rgba(102, 126, 234, 0.5);
          background: rgba(255, 255, 255, 0.9);
        }
        
        .error-message {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          color: #dc2626;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          font-size: 0.9rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          font-weight: 500;
        }
        
        .signin-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          letter-spacing: 0.01em;
        }
        
        .signin-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .signin-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 25px rgba(102, 126, 234, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        
        .signin-button:hover:not(:disabled)::before {
          left: 100%;
        }
        
        .signin-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .signin-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .signin-footer {
          text-align: center;
          margin-top: 2rem;
          color: #6b7280;
        }
        
        .signin-footer p {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }
        
        .toggle-button {
          background: none;
          border: none;
          color: #667eea;
          cursor: pointer;
          font-weight: 600;
          margin-left: 0.5rem;
          text-decoration: none;
          transition: all 0.2s ease;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }
        
        .toggle-button:hover {
          color: #764ba2;
          background: rgba(102, 126, 234, 0.1);
        }
        
        @media (max-width: 480px) {
          .signin-container {
            padding: 15px;
          }
          
          .signin-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          
          .signin-title {
            font-size: 1.75rem;
            margin-bottom: 2rem;
          }
          
          .signin-form {
            gap: 1.5rem;
          }
          
          .form-group input {
            padding: 0.875rem 1rem;
          }
        }
      `}</style>
    </div>
  )
}
