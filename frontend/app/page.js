'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newItem, setNewItem] = useState({ title: '', description: '' })

  // Demographic form state
  const [demographic, setDemographic] = useState({
    ageGroup: '',
    incomeBracket: '',
    raceEthnicity: '',
    location: '',
    gender: '',
    otherGroups: '',
    reasoning: ''
  })
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/data')
      if (!response.ok) throw new Error('Failed to fetch data')
      const result = await response.json()
      setData(result.data)
      setError(null)
    } catch (err) {
      setError('Failed to connect to backend. Make sure Flask server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!newItem.title.trim()) return

    try {
      const response = await fetch('http://localhost:8000/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (response.ok) {
        setNewItem({ title: '', description: '' })
        fetchData()
      }
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/data/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) fetchData()
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  // Handle demographic form submission
  const submitDemographic = async (e) => {
    e.preventDefault()
    setResponseMessage('')

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
      const response = await fetch('http://localhost:8000/api/demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setResponseMessage('Demographic data submitted successfully!')
        setDemographic({
          ageGroup: '',
          incomeBracket: '',
          raceEthnicity: '',
          location: '',
          gender: '',
          otherGroups: '',
          reasoning: ''
        })
      } else {
        setResponseMessage('Failed to submit demographic data.')
      }
    } catch (err) {
      setResponseMessage('Error connecting to backend.')
    }
  }

  return (
    <main className="main">
      <div className="container">
        <h1 className="title">Next.js + Flask Full Stack App</h1>
        <p className="description">Frontend connected to Flask backend API</p>

        {/* Add new item form */}
        <div className="form-container">
          <h2>Add New Item</h2>
          <form onSubmit={addItem} className="form">
            <input
              type="text"
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="form-input"
            />
            <button type="submit" className="form-button">Add Item</button>
          </form>
        </div>

        {/* Demographic selection form */}
        <div className="form-container" style={{ marginTop: '40px' }}>
          <h2>Demographic Selection</h2>
          <form onSubmit={submitDemographic} className="form">
            <select
              value={demographic.ageGroup}
              onChange={(e) => setDemographic({ ...demographic, ageGroup: e.target.value })}
              required
            >
              <option value="">Age Group</option>
              <option>Children</option>
              <option>Youth</option>
              <option>Adults</option>
              <option>Seniors</option>
              <option>Veterans</option>
              <option>All</option>
            </select>

            <select
              value={demographic.incomeBracket}
              onChange={(e) => setDemographic({ ...demographic, incomeBracket: e.target.value })}
              required
            >
              <option value="">Income Bracket</option>
              <option>Low-income</option>
              <option>Middle-income</option>
              <option>High-income</option>
              <option>All</option>
            </select>

            <select
              value={demographic.raceEthnicity}
              onChange={(e) => setDemographic({ ...demographic, raceEthnicity: e.target.value })}
              required
            >
              <option value="">Race or Ethnicity</option>
              <option>Minorities</option>
              <option>Indigenous</option>
              <option>All</option>
              <option>None specified</option>
            </select>

            <select
              value={demographic.location}
              onChange={(e) => setDemographic({ ...demographic, location: e.target.value })}
              required
            >
              <option value="">Location</option>
              <option>Urban</option>
              <option>Rural</option>
              <option>National</option>
              <option>Specific states or regions</option>
            </select>

            <select
              value={demographic.gender}
              onChange={(e) => setDemographic({ ...demographic, gender: e.target.value })}
              required
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              placeholder="Other Groups (comma-separated)"
              value={demographic.otherGroups}
              onChange={(e) => setDemographic({ ...demographic, otherGroups: e.target.value })}
            />

            <textarea
              placeholder="Reasoning"
              value={demographic.reasoning}
              onChange={(e) => setDemographic({ ...demographic, reasoning: e.target.value })}
            />

            <button type="submit" className="form-button">Submit Demographic</button>
          </form>
          {responseMessage && <p style={{ marginTop: '10px' }}>{responseMessage}</p>}
        </div>

        {/* Data display */}
        <div className="data-section">
          <h2>Backend Data</h2>
          {loading && <p className="loading">Loading data from backend...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <div className="data-grid">
              {data.map((item) => (
                <div key={item.id} className="data-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
