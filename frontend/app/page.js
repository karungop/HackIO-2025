'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newItem, setNewItem] = useState({ title: '', description: '' })

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      })
      
      if (response.ok) {
        setNewItem({ title: '', description: '' })
        fetchData() // Refresh the data
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
      
      if (response.ok) {
        fetchData() // Refresh the data
      }
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  return (
    <main className="main">
      <div className="container">
        <h1 className="title">
          Next.js + Flask Full Stack App
        </h1>
        <p className="description">
          Frontend connected to Flask backend API
        </p>

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