'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'

function MainApp() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [demographic, setDemographic] = useState({
    ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: '', otherGroups: '', reasoning: ''
  })
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result.data)
      setError(null)
    } catch (err) { setError('Failed to connect to backend.') }
    finally { setLoading(false) }
  }

  const submitDemographic = async (e) => {
    e.preventDefault()
    const payload = {
      AgeGroup: demographic.ageGroup,
      IncomeBracket: demographic.incomeBracket,
      RaceOrEthnicity: demographic.raceEthnicity,
      Location: demographic.location,
      Gender: demographic.gender,
      OtherGroups: demographic.otherGroups.split(',').map(g => g.trim()).filter(Boolean),
      Reasoning: demographic.reasoning
    }
    try {
      await fetch('http://localhost:3001/api/demographics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      alert('Demographic submitted!')
    } catch (err) { alert('Error submitting demographic') }
  }

  const handleSignOut = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Bill Finder</h1>
          <div className="user-info">
            <span>Welcome, {user?.email}</span>
            <button onClick={handleSignOut} className="signout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        {/* Left Panel */}
        <aside className={`panel left-panel ${leftOpen ? 'open' : 'collapsed'}`}>
        <button className="toggle-btn" onClick={() => setLeftOpen(!leftOpen)}>
          {leftOpen ? '<' : '>'}
        </button>
        {leftOpen && (
          <div className="panel-content">
            <h2>Filters</h2>
            <form onSubmit={submitDemographic} className="form">
              <select value={demographic.ageGroup} onChange={e => setDemographic({ ...demographic, ageGroup: e.target.value })} required>
                <option value="">Age Group</option>
                <option>0-18</option><option>19-25</option><option>25-40</option><option>41-65</option><option>65+</option>
              </select>
              <select value={demographic.incomeBracket} onChange={e => setDemographic({ ...demographic, incomeBracket: e.target.value })} required>
                <option value="">Income Bracket</option>
                <option>$0-11,600</option><option>$11,601-47,150</option><option>$47,151-100,525</option><option>$100,526+</option>
              </select>
              <select value={demographic.raceEthnicity} onChange={e => setDemographic({ ...demographic, raceEthnicity: e.target.value })} required>
                <option value="">Race or Ethnicity</option><option>White</option><option>Black</option><option>Asian</option><option>Other</option>
              </select>
              <select value={demographic.location} onChange={e => setDemographic({ ...demographic, location: e.target.value })} required>
                <option value="">Location</option><option>Urban</option><option>Rural</option><option>National</option>
              </select>
              <select value={demographic.gender} onChange={e => setDemographic({ ...demographic, gender: e.target.value })} required>
                <option value="">Gender</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
              <input type="text" placeholder="Other Groups" value={demographic.otherGroups} onChange={e => setDemographic({ ...demographic, otherGroups: e.target.value })} />
              <textarea placeholder="Reasoning" value={demographic.reasoning} onChange={e => setDemographic({ ...demographic, reasoning: e.target.value })} />
              <button type="submit" className="form-button">Apply Filters</button>
            </form>
          </div>
        )}
      </aside>

      {/* Middle Feed */}
      <main className="panel middle-panel">
        <h2>Bill Feed</h2>
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className="data-grid">
          {data.map(item => (
            <div key={item.id} className="data-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button onClick={() => alert('Show modal')} className="form-button">Details</button>
            </div>
          ))}
        </div>
      </main>

      {/* Right Panel */}
      <aside className={`panel right-panel ${rightOpen ? 'open' : 'collapsed'}`}>
        <button className="toggle-btn" onClick={() => setRightOpen(!rightOpen)}>
          {rightOpen ? '>' : '<'}
        </button>
        {rightOpen && (
          <div className="panel-content">
            <h2>Chatbot</h2>
            <div className="chatbot-box">Chatbot interface here</div>
          </div>
        )}
      </aside>
      </div>

      <style jsx>{`
        .app-layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: sans-serif;
          overflow: hidden;
          background: linear-gradient(to bottom, #d6dbdc, #fff);
        }
        
        .app-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header-content h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info span {
          font-size: 0.9rem;
          opacity: 0.9;
        }
        
        .signout-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .signout-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .panel {
          background: #fff;
          border-right: 1px solid #eaeaea;
          transition: width 0.3s;
          overflow-y: auto;
          padding: 20px;
        }
        .left-panel { width: 300px; }
        .right-panel { width: 300px; border-left: 1px solid #eaeaea; }
        .middle-panel { flex: 1; padding: 20px; overflow-y: auto; background: #f9f9f9; }
        .collapsed { width: 30px !important; padding: 5px !important; }
        .toggle-btn {
          display: block;
          margin-bottom: 10px;
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .panel-content h2 { margin-bottom: 1rem; color: #333; }
        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }
        .data-card {
          background: #fff;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #eaeaea;
        }
        .data-card h3 { margin-bottom: 0.5rem; color: #333; font-size: 1.2rem; }
        .data-card p { color: #666; line-height: 1.5; margin-bottom: 1rem; }
        .form-button { background: #0070f3; color: #fff; border-radius: 5px; border: none; padding: 0.5rem 1rem; cursor: pointer; }
        .form-button:hover { background: #0051a2; }
        .chatbot-box { height: 90%; border: 1px solid #ccc; padding: 10px; border-radius: 6px; background: #f1f1f1; }
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
