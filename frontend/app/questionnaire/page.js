'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import UserQuestionnaire from '../../components/UserQuestionnaire'

export default function QuestionnairePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [user, loading, router])

  const handleQuestionnaireComplete = (demographics) => {
    setIsCompleted(true)
    
    // Redirect to main app after a brief delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  const handleSkip = () => {
    setIsCompleted(true)
    
    // Redirect to main app after a brief delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (isCompleted) {
    return (
      <div className="completion-container">
        <div className="completion-card">
          <div className="completion-icon">✓</div>
          <h2>Setup Complete!</h2>
          <p>Redirecting you to the main app...</p>
        </div>
      </div>
    )
  }

  return <UserQuestionnaire onComplete={handleQuestionnaireComplete} onSkip={handleSkip} />
}