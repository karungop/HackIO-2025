'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function UserQuestionnaire({ onComplete, onSkip }) {
  const [demographics, setDemographics] = useState({
    ageGroup: '',
    incomeBracket: '',
    raceEthnicity: '',
    location: '',
    gender: ''
  })
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Submit demographics to backend
      const response = await fetch('http://localhost:3001/api/demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.uid,
          email: user?.email,
          demographics: demographics
        })
      })
      
      if (response.ok) {
        onComplete(demographics)
      } else {
        throw new Error('Failed to save demographics')
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      // Still complete the questionnaire even if backend fails
      onComplete(demographics)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <div className="questionnaire-header">
          <h1>Welcome to Bill Finder!</h1>
          <p>Help us personalize your experience by answering a few quick questions.</p>
        </div>

        <form onSubmit={handleSubmit} className="questionnaire-form">
          <div className="form-section">
            <h3>Demographic Information</h3>
            <p className="section-description">This helps us show you the most relevant bills.</p>
            
            <div className="form-group">
              <label htmlFor="ageGroup">Age Group (Optional)</label>
              <select 
                id="ageGroup"
                value={demographics.ageGroup} 
                onChange={e => setDemographics({ ...demographics, ageGroup: e.target.value })}
              >
                <option value="">Select age group</option>
                <option value="0-18">0-18</option>
                <option value="19-25">19-25</option>
                <option value="25-40">25-40</option>
                <option value="41-65">41-65</option>
                <option value="65+">65+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="incomeBracket">Income Bracket (Optional)</label>
              <select 
                id="incomeBracket"
                value={demographics.incomeBracket} 
                onChange={e => setDemographics({ ...demographics, incomeBracket: e.target.value })}
              >
                <option value="">Select income bracket</option>
                <option value="$0-11,600">$0-11,600</option>
                <option value="$11,601-47,150">$11,601-47,150</option>
                <option value="$47,151-100,525">$47,151-100,525</option>
                <option value="$100,526+">$100,526+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="raceEthnicity">Race or Ethnicity (Optional)</label>
              <select 
                id="raceEthnicity"
                value={demographics.raceEthnicity} 
                onChange={e => setDemographics({ ...demographics, raceEthnicity: e.target.value })}
              >
                <option value="">Select race/ethnicity</option>
                <option value="White">White</option>
                <option value="Black">Black</option>
                <option value="Asian">Asian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <select 
                id="location"
                value={demographics.location} 
                onChange={e => setDemographics({ ...demographics, location: e.target.value })}
              >
                <option value="">Select location</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
                <option value="National">National</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender (Optional)</label>
              <select 
                id="gender"
                value={demographics.gender} 
                onChange={e => setDemographics({ ...demographics, gender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleSkip} className="skip-button">
              Skip for now
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .questionnaire-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }
        
        .questionnaire-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 3rem;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .questionnaire-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .questionnaire-header h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 1rem 0;
        }
        
        .questionnaire-header p {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }
        
        .form-section {
          margin-bottom: 2rem;
        }
        
        .form-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }
        
        .section-description {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0 0 1.5rem 0;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .form-group label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        
        .form-group select {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid rgba(229, 231, 235, 0.8);
          border-radius: 12px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.8);
          color: #1a1a1a;
          transition: all 0.3s ease;
        }
        
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          margin-top: 2rem;
        }
        
        .skip-button {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .skip-button:hover {
          background: #e5e7eb;
          color: #374151;
        }
        
        .submit-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          margin-left: 1rem;
        }
        
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }
        
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .questionnaire-container {
            padding: 1rem;
          }
          
          .questionnaire-card {
            padding: 2rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .submit-button {
            margin-left: 0;
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  )
}