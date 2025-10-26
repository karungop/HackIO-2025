'use client'

export default function LeftSidePanel({ 
  leftOpen, 
  onClose, 
  demographic, 
  setDemographic, 
  onSubmit, 
  onClearFilters
}) {
  return (
    <div className={`accordion-panel left-accordion ${leftOpen ? 'open' : 'closed'}`}>
      <div className="accordion-content">
        <div className="accordion-header">
          <h2>Filters</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit} className="form">
          <select 
            value={demographic.ageGroup} 
            onChange={e => setDemographic({ ...demographic, ageGroup: e.target.value })}
          >
            <option value="">Age Group (Optional)</option>
            <option>0-18</option>
            <option>19-25</option>
            <option>25-40</option>
            <option>41-65</option>
            <option>65+</option>
          </select>
          
          <select 
            value={demographic.incomeBracket} 
            onChange={e => setDemographic({ ...demographic, incomeBracket: e.target.value })}
          >
            <option value="">Income Bracket (Optional)</option>
            <option>$0-11,600</option>
            <option>$11,601-47,150</option>
            <option>$47,151-100,525</option>
            <option>$100,526+</option>
          </select>
          
          <select 
            value={demographic.raceEthnicity} 
            onChange={e => setDemographic({ ...demographic, raceEthnicity: e.target.value })}
          >
            <option value="">Race or Ethnicity (Optional)</option>
            <option>White</option>
            <option>Black</option>
            <option>Asian</option>
            <option>Other</option>
          </select>
          
          <select 
            value={demographic.location} 
            onChange={e => setDemographic({ ...demographic, location: e.target.value })}
          >
            <option value="">Location (Optional)</option>
            <option>Urban</option>
            <option>Rural</option>
            <option>National</option>
          </select>
          
          <select 
            value={demographic.gender} 
            onChange={e => setDemographic({ ...demographic, gender: e.target.value })}
          >
            <option value="">Gender (Optional)</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="form-button">Apply Filters</button>
            <button 
              type="button" 
              className="form-button" 
              onClick={onClearFilters} 
              style={{ background: '#666' }}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
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

        @media (max-width: 768px) {
          .accordion-panel {
            width: 100%;
            max-width: 320px;
          }

          .accordion-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}