'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'

function MainApp() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [demographic, setDemographic] = useState({
    ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: ''
  })
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const { user, logout } = useAuth()

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi there! I’m your Bill Finder assistant. How can I help?' }
  ])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      // Build query parameters from demographics
      const params = new URLSearchParams()
      
      if (demographic.ageGroup) params.append('age_groups', demographic.ageGroup)
      if (demographic.incomeBracket) params.append('income_brackets', demographic.incomeBracket)
      if (demographic.raceEthnicity) params.append('race_or_ethnicity', demographic.raceEthnicity)
      if (demographic.location) params.append('location', demographic.location)
      if (demographic.gender) params.append('gender', demographic.gender)
      
      const url = `http://localhost:3001/api/data${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result.data)
      setError(null)
    } catch (err) { setError('Failed to connect to backend.') }
    finally { setLoading(false) }
  }

  const submitDemographic = async (e) => {
    e.preventDefault()
    
    // Only include non-empty demographic values
    const payload = {}
    if (demographic.ageGroup) payload.AgeGroup = demographic.ageGroup
    if (demographic.incomeBracket) payload.IncomeBracket = demographic.incomeBracket
    if (demographic.raceEthnicity) payload.RaceOrEthnicity = demographic.raceEthnicity
    if (demographic.location) payload.Location = demographic.location
    if (demographic.gender) payload.Gender = demographic.gender
    
    try {
      // Submit demographics
      await fetch('http://localhost:3001/api/demographics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      
      // Immediately refresh data with current demographic state
      setLoading(true)
      console.log('Refreshing data with demographics:', demographic)
      
      // Build query parameters from current demographics
      const params = new URLSearchParams()
      if (demographic.ageGroup) params.append('age_groups', demographic.ageGroup)
      if (demographic.incomeBracket) params.append('income_brackets', demographic.incomeBracket)
      if (demographic.raceEthnicity) params.append('race_or_ethnicity', demographic.raceEthnicity)
      if (demographic.location) params.append('location', demographic.location)
      if (demographic.gender) params.append('gender', demographic.gender)
      
      const url = `http://localhost:3001/api/data${params.toString() ? '?' + params.toString() : ''}`
      console.log('Fetching from URL:', url)
      
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      
      console.log('Received data:', result)
      setData(result.data)
      setError(null)
      
      alert('Filters applied! Data refreshed.')
    } catch (err) { 
      console.error('Error submitting demographic:', err)
      alert('Error submitting demographic: ' + err.message) 
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMessage = { sender: 'user', text: chatInput.trim() }
    setChatMessages(prev => [...prev, userMessage])

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "I'm here to help! (Chatbot responses coming soon...)" }])
    }, 600)

    setChatInput('')
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Bill Finder</h1>
          <div className="user-info">
            <span>Welcome, {user?.email}</span>
            <button onClick={handleSignOut} className="signout-button">Sign Out</button>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        {/* Left Side Button */}
        <button className={`side-button left-side-button ${leftOpen ? 'hidden' : ''}`} onClick={() => setLeftOpen(!leftOpen)}>
          Filters
        </button>

        {/* Left Accordion Panel */}
        <div className={`accordion-panel left-accordion ${leftOpen ? 'open' : 'closed'}`}>
          <div className="accordion-content">
            <div className="accordion-header">
              <h2>Filters</h2>
              <button className="close-btn" onClick={() => setLeftOpen(false)}>×</button>
            </div>
            <form onSubmit={submitDemographic} className="form">
              <select value={demographic.ageGroup} onChange={e => setDemographic({ ...demographic, ageGroup: e.target.value })}>
                <option value="">Age Group (Optional)</option>
                <option>0-18</option><option>19-25</option><option>25-40</option><option>41-65</option><option>65+</option>
              </select>
              <select value={demographic.incomeBracket} onChange={e => setDemographic({ ...demographic, incomeBracket: e.target.value })}>
                <option value="">Income Bracket (Optional)</option>
                <option>$0-11,600</option><option>$11,601-47,150</option><option>$47,151-100,525</option><option>$100,526+</option>
              </select>
              <select value={demographic.raceEthnicity} onChange={e => setDemographic({ ...demographic, raceEthnicity: e.target.value })}>
                <option value="">Race or Ethnicity (Optional)</option><option>White</option><option>Black</option><option>Asian</option><option>Other</option>
              </select>
              <select value={demographic.location} onChange={e => setDemographic({ ...demographic, location: e.target.value })}>
                <option value="">Location (Optional)</option><option>Urban</option><option>Rural</option><option>National</option>
              </select>
              <select value={demographic.gender} onChange={e => setDemographic({ ...demographic, gender: e.target.value })}>
                <option value="">Gender (Optional)</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="form-button">Apply Filters</button>
                <button type="button" className="form-button" onClick={() => {
                  setDemographic({
                    ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: ''
                  })
                  setLoading(true)
                  fetchData()
                }} style={{ background: '#666' }}>Clear Filters</button>
              </div>
            </form>
          </div>
        </div>

        {/* Middle Feed */}
        <main className="middle-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Bill Feed</h2>
            {Object.values(demographic).some(value => value && value.trim()) && (
              <div className="filters-active">
                Filters Active
              </div>
            )}
          </div>
          {loading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}
          <div className="data-grid">
            {data.map(item => (
              <div key={item.id} className="data-card">
                <h3>{item.title}</h3>
                <div className="bill-date">
                  <strong>Latest Action Date:</strong> {item.update_date && item.update_date !== 'N/A' ? 
                    (() => {
                      try {
                        const date = new Date(item.update_date);
                        return isNaN(date.getTime()) ? item.update_date : date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (e) {
                        return item.update_date;
                      }
                    })() : 'N/A'}
                </div>
                <p>{item.description}</p>
                <button onClick={() => alert('Show modal')} className="form-button">Details</button>
              </div>
            ))}
          </div>
        </main>

        {/* Right Side Button */}
        <button className={`side-button right-side-button ${rightOpen ? 'hidden' : ''}`} onClick={() => setRightOpen(!rightOpen)}>
          Assistant
        </button>

        {/* Right Accordion Panel */}
        <div className={`accordion-panel right-accordion ${rightOpen ? 'open' : 'closed'}`}>
          <div className="accordion-content">
            <div className="accordion-header">
              <h2>Bill Finder Assistant</h2>
              <button className="close-btn" onClick={() => setRightOpen(false)}>×</button>
            </div>
            <div className="chatbot-section">
              <div className="chatbot-title">Ask any question</div>
              <div className="chatbot-box">
                <div className="messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.sender}`}>
                      <div className="bubble">{msg.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="chat-input-area">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="chat-send-button">Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        
        .app-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #1a1a1a;
        }
        
        .app-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        
        .app-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info span {
          font-weight: 500;
          color: #666;
        }
        
        .signout-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .signout-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .main-content {
          display: flex;
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          padding: 2rem;
          position: relative;
        }
        
        /* Side Buttons */
        .side-button {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          background: white;
          color: #1a1a1a;
          border: 2px solid rgba(102, 126, 234, 0.2);
          padding: 1rem 0.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          z-index: 1000;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .side-button:hover {
          background: #f8fafc;
          border-color: #667eea;
          transform: translateY(-50%) scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        .side-button.hidden {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-50%) scale(0.8);
          pointer-events: none;
        }
        
        .left-side-button {
          left: 1rem;
        }
        
        .right-side-button {
          right: 1rem;
        }
        
        /* Accordion Panels */
        .accordion-panel {
          position: fixed;
          top: 0;
          height: 100vh;
          width: 350px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 999;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }
        
        .left-accordion {
          left: 0;
          transform: translateX(-100%);
          border-right: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .left-accordion.open {
          transform: translateX(0);
        }
        
        .right-accordion {
          right: 0;
          transform: translateX(100%);
          border-left: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .right-accordion.open {
          transform: translateX(0);
        }
        
        .accordion-content {
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(102, 126, 234, 0.1);
        }
        
        .accordion-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #1a1a1a;
        }
        
        .close-btn {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background: #e5e7eb;
          color: #374151;
        }
        
        .middle-panel {
          flex: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem;
          overflow-y: auto;
          margin: 0 1rem;
        }
        
        
        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .form select {
          padding: 0.75rem 1rem;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          color: #1a1a1a;
          transition: all 0.2s ease;
        }
        
        .form select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .form-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .form-button[style*="background: #666"] {
          background: #6b7280 !important;
        }
        
        .form-button[style*="background: #666"]:hover {
          background: #4b5563 !important;
        }
        
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .data-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        
        .data-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .data-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: #1a1a1a;
          line-height: 1.4;
        }
        
        .bill-date {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.5rem 0;
          padding: 0.5rem 0.75rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 6px;
          border-left: 3px solid #667eea;
        }
        
        .data-card p {
          color: #4b5563;
          line-height: 1.6;
          margin: 0.75rem 0;
        }
        
        .data-card button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          margin-top: 0.75rem;
        }
        
        .data-card button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .loading, .error {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        
        .error {
          color: #ef4444;
        }
        
        .filters-active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #667eea;
          font-weight: 500;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }
        
        /* Chatbot */
        .chatbot-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1a1a1a;
          text-align: center;
        }
        
        .chatbot-box {
          display: flex;
          flex-direction: column;
          height: 400px;
          background: white;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
        }
        
        .message.user {
          align-self: flex-end;
        }
        
        .message.bot {
          align-self: flex-start;
        }
        
        .bubble {
          padding: 0.75rem 1rem;
          border-radius: 16px;
          max-width: 80%;
          line-height: 1.4;
          font-size: 0.9rem;
        }
        
        .message.user .bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .message.bot .bubble {
          background: #f3f4f6;
          color: #374151;
          border-bottom-left-radius: 4px;
        }
        
        .chat-input-area {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .chat-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .chat-send-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .chat-send-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }
          
          .side-button {
            padding: 0.75rem 0.4rem;
            min-height: 100px;
            font-size: 0.8rem;
          }
          
          .left-side-button {
            left: 0.5rem;
          }
          
          .right-side-button {
            right: 0.5rem;
          }
          
          .accordion-panel {
            width: 100%;
            max-width: 320px;
          }
          
          .middle-panel {
            margin: 0 0.5rem;
            padding: 1rem;
          }
          
          .data-grid {
            grid-template-columns: 1fr;
          }
          
          .accordion-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <MainApp />
    </ProtectedRoute>
  )
}
