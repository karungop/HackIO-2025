'use client'

import { useState, useEffect, useCallback } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/layout/Header'
import LeftSidePanel from '../components/layout/LeftSidePanel'
import RightSidePanel from '../components/layout/RightSidePanel'
import BillCard from '../components/BillCard'
import BillModal from '../components/BillModal'
import PopupNotification from '../components/PopupNotification'

function MainApp() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [demographic, setDemographic] = useState({
    ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: ''
  })
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const [rightPanelExtendedWidth, setRightPanelExtendedWidth] = useState(350) // Extended width beyond default
  const [isDragging, setIsDragging] = useState(false)
  const { user, logout } = useAuth()
  
  // Popup notification states
  const [popupNotification, setPopupNotification] = useState(null)
  
  // Modal states
  const [selectedBill, setSelectedBill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFullAnalysis, setShowFullAnalysis] = useState(false)

  // Chatbot states
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi there! I’m your Bill Finder assistant. How can I help?' }
  ])
  const [chatInput, setChatInput] = useState('')

  // Add context button state for each bill card
  const [contextButtonStates, setContextButtonStates] = useState({})
  
  // Get list of added context cards
  const getAddedContextCards = () => {
    return data.filter(item => contextButtonStates[item.id])
  }

  // Get the currently selected context (since only one can be selected at a time)
  const getSelectedContext = () => {
    const selectedCard = data.find(item => contextButtonStates[item.id])
    return selectedCard || null
  }

  useEffect(() => { fetchData() }, [])

  // Function to show popup notification
  const showPopupNotification = (type, message) => {
    setPopupNotification({ type, message })
    setTimeout(() => {
      // Add fade-out animation before removing
      const popupElement = document.querySelector('.popup-notification')
      if (popupElement) {
        popupElement.style.animation = 'fadeOutSlideDown 0.3s ease-in forwards'
        setTimeout(() => {
          setPopupNotification(null)
        }, 300)
      } else {
        setPopupNotification(null)
      }
    }, 3000)
  }

  const getTopicIconPath = (iconFile) => {
  // iconFile will be like "BallotIcon.png" or "healthcareIcon.webp"
  // Images are in your public folder at /Images/ (capital I)
  return `/Images/${iconFile}`
}

  // Function to manually close popup with animation
  const closePopupNotification = () => {
    const popupElement = document.querySelector('.popup-notification')
    if (popupElement) {
      popupElement.style.animation = 'fadeOutSlideDown 0.3s ease-in forwards'
      setTimeout(() => {
        setPopupNotification(null)
      }, 300)
    } else {
      setPopupNotification(null)
    }
  }

  // Function to open bill details modal
  const openBillModal = (bill) => {
    setSelectedBill(bill)
    setIsModalOpen(true)
  }

  // Function to close bill details modal
  const closeBillModal = () => {
    setIsModalOpen(false)
    setSelectedBill(null)
    setShowFullAnalysis(false)
  }

  // Parse demographics data
  const parseDemographics = (demographicsData) => {
    if (!demographicsData) return null
    
    try {
      let parsed
      if (typeof demographicsData === 'string') {
        parsed = JSON.parse(demographicsData)
      } else {
        parsed = demographicsData
      }
      return parsed
    } catch (e) {
      return null
    }
  }

  // Render demographic tags
  const renderDemographicTags = (demographicsData) => {
    const demographics = parseDemographics(demographicsData)
    if (!demographics) return null

    const categories = [
      { key: 'age_groups', label: 'Age' },
      { key: 'income_brackets', label: 'Income' },
      { key: 'race_or_ethnicity', label: 'Race/Ethnicity' },
      { key: 'location', label: 'Location' },
      { key: 'gender', label: 'Gender' }
    ]

    return categories.map(category => {
      const values = demographics[category.key]
      if (!values || !Array.isArray(values) || values.length === 0) return null
      
      return values.map((value, idx) => (
        <span key={`${category.key}-${idx}`} className="demographic-tag" data-category={category.key}>
          <span className="tag-category">{category.label}:</span> {value}
        </span>
      ))
    }).filter(Boolean)
  }

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
      showPopupNotification('success', 'Data updated successfully')
    } catch (err) { 
      showPopupNotification('error', 'Failed to connect to backend')
    }
    finally { setLoading(false) }
  }

  const handleDemographicSubmit = async (e) => {
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
      
      showPopupNotification('success', 'Filters applied! Data refreshed.')
    } catch (err) { 
      console.error('Error submitting demographic:', err)
      showPopupNotification('error', 'Error submitting demographic: ' + err.message)
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

  const handleChatSubmit = async (e) => {
  e.preventDefault()
  if (!chatInput.trim()) return
  
  const userMessage = { sender: 'user', text: chatInput.trim() }
  setChatMessages(prev => [...prev, userMessage])
  const currentInput = chatInput.trim()
  setChatInput('')

  try {
    // Get the context cards that have been added
    const contextCards = getAddedContextCards()
    
    // Call the REST API endpoint
    const response = await fetch('http://localhost:3001/api/chatbot/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentInput,
        context: {
          user: user?.email,
          demographics: demographic,
          contextCards: contextCards // Add the context cards here
        }
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.response }])
    } else {
      throw new Error(data.error || 'Failed to get response')
    }
  } catch (error) {
    console.error('Chat error:', error)
    setChatMessages(prev => [...prev, { 
      sender: 'bot', 
      text: 'Sorry, I encountered an error. Please try again.' 
    }])
  }
}

  const handleAddContextClick = (billId) => {
    setContextButtonStates(prev => {
      const isCurrentlySelected = prev[billId]
      
      if (isCurrentlySelected) {
        // If clicking on already selected item, deselect it
        return {
          ...prev,
          [billId]: false
        }
      } else {
        // If clicking on unselected item, select it and deselect all others
        const newState = {}
        // First, set all to false
        Object.keys(prev).forEach(id => {
          newState[id] = false
        })
        // Then set the clicked one to true
        newState[billId] = true
        return newState
      }
    })
  }

  // Mouse handlers for extending right panel
  const handleClearFilters = async () => {
    setDemographic({
      ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: ''
    })
    setLoading(true)
    
    try {
      const res = await fetch('http://localhost:3001/api/data')
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result.data)
      setError(null)
      showPopupNotification('success', 'Filters cleared! Data refreshed.')
    } catch (err) {
      showPopupNotification('error', 'Error clearing filters: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // Add useCallback for mouse handlers
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    
    // Calculate how much to extend to the left
    const newWidth = window.innerWidth - e.clientX
    const minWidth = 350 // Original width
    const maxWidth = Math.min(800, window.innerWidth * 0.8) // Max extension
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setRightPanelExtendedWidth(newWidth)
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
<<<<<<< HEAD
  }, [])
=======
  }

  // Reset panel width when closed
  const handleRightPanelClose = () => {
    setRightOpen(false)
    setRightPanelExtendedWidth(350) // Reset to original width
    // Clear all context selections when closing panel
    setContextButtonStates({})
  }
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10

  // Reset panel width when opening (to ensure it starts at original size)
  const handleRightPanelToggle = useCallback(() => {
    if (!rightOpen) {
      // Opening - reset to original width
      setRightPanelExtendedWidth(350)
    }
    setRightOpen(!rightOpen)
  }, [rightOpen])

  // Add event listeners for drag functionality
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

<<<<<<< HEAD
=======
  useEffect(() => {
    const loadUserDemographics = async () => {
      if (user?.uid) {
        try {
          const response = await fetch(`http://localhost:3001/api/user-demographics/${user.uid}`)
          const data = await response.json()
          
          if (data.success && data.has_demographics) {
            setDemographic(data.demographics)
            // Automatically apply filters if demographics exist
            fetchData()
          }
        } catch (error) {
          console.error('Error loading user demographics:', error)
        }
      }
    }
    
    loadUserDemographics()
  }, [user])
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10

  return (
    <div className="app-layout">
      <Header user={user} onSignOut={handleSignOut} />
      
      <div className="main-content">
        <button 
          className={`side-button left-side-button ${leftOpen ? 'hidden' : ''}`} 
          onClick={() => setLeftOpen(!leftOpen)}
        >
          Filters
        </button>

<<<<<<< HEAD
        <LeftSidePanel
          leftOpen={leftOpen}
          onClose={() => setLeftOpen(false)}
          demographic={demographic}
          setDemographic={setDemographic}
          onSubmit={handleDemographicSubmit}
          onClearFilters={handleClearFilters}
        />
=======
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
                <option value="">Race or Ethnicity (Optional)</option>
                <option>Hispanic or Latino</option>
                <option>White (not Hispanic or Latino)</option>
                <option>Black or African American</option>
                <option>Asian</option>
                <option>American Indian or Alaska Native</option>
                <option>Native Hawaiian or Other Pacific Islander</option>
              </select>
              <select value={demographic.location} onChange={e => setDemographic({ ...demographic, location: e.target.value })}>
                <option value="">Location (Optional)</option>
                <option>Alabama</option><option>Alaska</option><option>Arizona</option><option>Arkansas</option><option>California</option>
                <option>Colorado</option><option>Connecticut</option><option>Delaware</option><option>Florida</option><option>Georgia</option>
                <option>Hawaii</option><option>Idaho</option><option>Illinois</option><option>Indiana</option><option>Iowa</option>
                <option>Kansas</option><option>Kentucky</option><option>Louisiana</option><option>Maine</option><option>Maryland</option>
                <option>Massachusetts</option><option>Michigan</option><option>Minnesota</option><option>Mississippi</option><option>Missouri</option>
                <option>Montana</option><option>Nebraska</option><option>Nevada</option><option>New Hampshire</option><option>New Jersey</option>
                <option>New Mexico</option><option>New York</option><option>North Carolina</option><option>North Dakota</option><option>Ohio</option>
                <option>Oklahoma</option><option>Oregon</option><option>Pennsylvania</option><option>Rhode Island</option><option>South Carolina</option>
                <option>South Dakota</option><option>Tennessee</option><option>Texas</option><option>Utah</option><option>Vermont</option>
                <option>Virginia</option><option>Washington</option><option>West Virginia</option><option>Wisconsin</option><option>Wyoming</option>
              </select>
              <select value={demographic.gender} onChange={e => setDemographic({ ...demographic, gender: e.target.value })}>
                <option value="">Gender (Optional)</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="form-button">Apply Filters</button>
                <button type="button" className="form-button" onClick={async () => {
                  setDemographic({
                    ageGroup: '', incomeBracket: '', raceEthnicity: '', location: '', gender: ''
                  })
                  setLoading(true)
                  
                  try {
                    // Fetch data with cleared demographics
                    const res = await fetch('http://localhost:3001/api/data')
                    if (!res.ok) throw new Error('Failed to fetch')
                    const result = await res.json()
                    setData(result.data)
                    setError(null)
                    showPopupNotification('success', 'Filters cleared! Data refreshed.')
                  } catch (err) {
                    showPopupNotification('error', 'Error clearing filters: ' + err.message)
                  } finally {
                    setLoading(false)
                  }
                }} style={{ background: '#666' }}>Clear Filters</button>
              </div>
            </form>
          </div>
        </div>
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10

        <main className="middle-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Bill Feed</h2>
            {Object.values(demographic).some(value => value && value.trim()) && (
              <div className="filters-active">Filters Active</div>
            )}
          </div>
          {loading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}
          <div className="data-grid">
            {data.map(item => (
<<<<<<< HEAD
              <BillCard
                key={item.id}
                bill={item}
                isContextActive={contextButtonStates[item.id]}
                onOpenModal={() => {
                  setSelectedBill(item)
                  setIsModalOpen(true)
                }}
                onAddContext={handleAddContextClick}
              />
=======
              <div key={item.id} className={`data-card ${contextButtonStates[item.id] ? 'context-active' : ''}`}>
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
                <div className="card-actions">
                  <button onClick={() => openBillModal(item)} className="details-button">Details</button>
                  <button 
                    onClick={() => {
                      handleAddContextClick(item.id)
                      if (!rightOpen) {
                        handleRightPanelToggle()
                      }
                    }}
                    className={`add-context-button ${contextButtonStates[item.id] ? 'clicked' : ''}`}
                  >
                    {contextButtonStates[item.id] ? 'Chat' : 'Open Chat'}
                  </button>
                </div>
              </div>
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10
            ))}
          </div>
        </main>

<<<<<<< HEAD
        <button 
          className={`side-button right-side-button ${rightOpen ? 'hidden' : ''}`} 
          onClick={() => {
            if (!rightOpen) {
              setRightPanelExtendedWidth(350)
            }
            setRightOpen(!rightOpen)
          }}
        >
          Assistant
        </button>
=======
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10

        <RightSidePanel
          rightOpen={rightOpen}
          rightPanelExtendedWidth={rightPanelExtendedWidth}
          onClose={handleRightPanelToggle}
          onMouseDown={handleMouseDown}
          chatMessages={chatMessages}
          chatInput={chatInput}
          onChatInputChange={(e) => setChatInput(e.target.value)}
          onChatSubmit={handleChatSubmit}
          selectedContext={getSelectedContext()}
        />
      </div>

      {popupNotification && (
        <PopupNotification
          type={popupNotification.type}
          message={popupNotification.message}
          onClose={closePopupNotification}
        />
      )}

      {isModalOpen && selectedBill && (
<<<<<<< HEAD
        <BillModal
          isOpen={isModalOpen}
          bill={selectedBill}
          showFullAnalysis={showFullAnalysis}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBill(null)
            setShowFullAnalysis(false)
          }}
          onToggleAnalysis={() => setShowFullAnalysis(!showFullAnalysis)}
        />
=======
        <div className="modal-overlay" onClick={closeBillModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedBill.title}</h2>
              <button className="modal-close" onClick={closeBillModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="bill-info-section">
                <h3>Bill Information</h3>
                <div className="bill-detail-item">
                  <strong>Bill Number:</strong> {selectedBill.bill_number}
                </div>
                <div className="bill-detail-item">
                  <strong>Latest Action Date:</strong> {selectedBill.update_date && selectedBill.update_date !== 'N/A' ? 
                    (() => {
                      try {
                        const date = new Date(selectedBill.update_date);
                        return isNaN(date.getTime()) ? selectedBill.update_date : date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                      } catch (e) {
                        return selectedBill.update_date;
                      }
                    })() : 'N/A'}
                </div>
                <div className="bill-detail-item">
                  <strong>Description:</strong>
                  <p className="bill-description">{selectedBill.description}</p>
                </div>
                {selectedBill['xml link'] && (
                  <div className="bill-detail-item">
                    <strong>Full Bill Text:</strong>
                    <div className="xml-link-container">
                      <a 
                        href={selectedBill['xml link']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="xml-link"
                      >
                        View Full Bill Text (XML)
                      </a>
                    </div>
                  </div>
                )}
                {selectedBill.categorized_populations && (
                  <div className="bill-detail-item">
                    <strong>Demographic Categories:</strong>
                    <div className="demographic-tags-container">
                      {renderDemographicTags(selectedBill.categorized_populations)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="population-analysis-section">
                <h3>Population Impact Analysis</h3>
                <div className="population-content">
                  {selectedBill.population_affect_summary ? (
                    <div className="formatted-text">
                      {(() => {
                        const fullText = selectedBill.population_affect_summary;
                        const shouldShowToggle = fullText.length > 200;
                        
                        return (
                          <>
                            <div className={`analysis-text-container ${showFullAnalysis ? 'expanded' : 'collapsed'}`}>
                              <p className="analysis-paragraph">
                                {fullText.replace(/\*/g, '')}
                              </p>
                            </div>
                            {shouldShowToggle && (
                              <div className="show-more-container">
                                <span 
                                  className="show-more-text"
                                  onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                                >
                                  {showFullAnalysis ? 'Show Less' : 'Show More'}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="no-analysis">No population impact analysis available for this bill.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
>>>>>>> 6b22d1b9be4a6706758b586a8b06269739a23a10
      )}


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
          position: fixed;
          z-index: 1001;
        }
        
        .right-accordion.open {
          transform: translateX(0);
        }
        
        /* Drag Handle */
        .drag-handle {
          position: absolute;
          left: -5px;
          top: 0;
          width: 10px;
          height: 100%;
          cursor: col-resize;
          z-index: 1000;
          background: transparent;
          transition: background-color 0.2s ease;
        }
        
        .drag-handle:hover {
          background: rgba(102, 126, 234, 0.2);
        }
        
        .drag-handle:active {
          background: rgba(102, 126, 234, 0.4);
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
          display: flex;
          flex-direction: column;
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
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          align-items: center;
          justify-content: space-between;
        }
        
        .details-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        
        .details-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .data-card.context-active {
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
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
        .context-status-container {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
        }
        
        .context-status-text {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(243, 244, 246, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 231, 235, 0.5);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: center;
          min-width: 120px;
        }
        
        .context-title {
          color: #6b7280;
          font-style: italic;
        }
        
        .no-context {
          color: #9ca3af;
          font-style: italic;
        }
        
        .chatbot-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #1a1a1a;
          text-align: center;
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          height: 300px;
          width: 100%;
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
          width: 100%;
        }
        
        .chat-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          background: white;
          color: #000000;
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
        
        /* Popup Notification Styles */
        .popup-notification {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 2000;
          animation: fadeInSlideUp 0.4s ease-out;
        }
        
        .popup-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 300px;
          max-width: 400px;
        }
        
        .popup-notification.success .popup-content {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.7) 0%, rgba(16, 185, 129, 0.7) 100%);
          color: white;
        }
        
        .popup-notification.error .popup-content {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
          color: white;
        }
        
        .popup-message {
          flex: 1;
          font-weight: 500;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .popup-close {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .popup-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        @keyframes fadeInSlideUp {
          0% {
            opacity: 0;
            transform: translateY(100%) scale(0.9);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-10%) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeOutSlideDown {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(100%) scale(0.9);
          }
        }
        
        @media (max-width: 768px) {
          .popup-notification {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
          }
          
          .popup-content {
            min-width: auto;
            max-width: none;
          }
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }
        
        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.3;
          flex: 1;
          padding-right: 1rem;
        }
        
        .modal-close {
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .modal-close:hover {
          background: #e5e7eb;
          color: #374151;
          transform: scale(1.1);
        }
        
        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          max-height: calc(90vh - 120px);
        }
        
        .bill-info-section,
        .population-analysis-section {
          margin-bottom: 2rem;
        }
        
        .bill-info-section h3,
        .population-analysis-section h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #667eea;
        }
        
        .bill-detail-item {
          margin-bottom: 1rem;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        
        .bill-detail-item strong {
          color: #374151;
          font-weight: 600;
          display: block;
          margin-bottom: 0.25rem;
        }
        
        .bill-description {
          margin: 0.5rem 0 0 0;
          color: #4b5563;
          line-height: 1.6;
        }
        
        .population-content {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .formatted-text {
          line-height: 1.7;
        }
          .topic-icon-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.data-card:hover .topic-icon-container {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.topic-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.data-card h3 {
  margin: 0 60px 0.75rem 0; /* Add right margin to prevent overlap with icon */
}

        
        .analysis-text-container {
          transition: max-height 0.5s ease-in-out;
          overflow: hidden;
          position: relative;
        }
        
        .analysis-text-container.collapsed {
          max-height: 5.4em;
        }
        
        .analysis-text-container.expanded {
          max-height: 1000px;
        }
        
        .analysis-paragraph {
          margin: 0 0 1rem 0;
          color: #374151;
          font-size: 1rem;
          text-align: left;
          line-height: 1.8;
          white-space: pre-wrap;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .analysis-paragraph:last-child {
          margin-bottom: 0;
        }
        
        .no-analysis {
          color: #6b7280;
          font-style: italic;
          text-align: center;
          padding: 2rem;
          margin: 0;
        }
        
        .show-more-container {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }
        
        .show-more-text {
          color: #6b7280;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          user-select: none;
        }
        
        .show-more-text:hover {
          color: #4b5563;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 1rem;
          }
          
          .modal-content {
            max-height: 95vh;
          }
          
          .modal-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
          }
          
          .modal-title {
            font-size: 1.25rem;
          }
          
          .modal-body {
            padding: 1.5rem;
            max-height: calc(95vh - 100px);
          }
          
          .bill-info-section h3,
          .population-analysis-section h3 {
            font-size: 1.1rem;
          }
          
          .population-content {
            padding: 1rem;
          }
          
          .analysis-paragraph {
            font-size: 0.95rem;
          }
        }
        
        /* Add Context Button */
        .add-context-button {
          background: none;
          color: #666;
          border: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        
        .add-context-button:hover {
          color: #4b5563;
        }
        
        .add-context-button.clicked {
          color: #667eea;
        }
        
        .add-context-button.clicked:hover {
          color: #5a67d8;
        }
        
        /* Demographic Tags */
        .demographic-tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        
        .demographic-tag {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          color: #667eea;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid rgba(102, 126, 234, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .tag-category {
          font-weight: 600;
          opacity: 0.8;
        }
        
        /* New styles for XML link */
        .xml-link-container {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .xml-link {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .xml-link:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
