'use client'

export default function BillCard({ 
  bill, 
  isContextActive, 
  onOpenModal, 
  onAddContext 
}) {
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`data-card ${isContextActive ? 'context-active' : ''}`}>
      <h3>{bill.title}</h3>
      <div className="bill-date">
        <strong>Latest Action Date:</strong> {formatDate(bill.update_date)}
      </div>
      <p>{bill.description}</p>
      <div className="card-actions">
        <button onClick={() => onOpenModal(bill)} className="details-button">
          Details
        </button>
        <button 
          onClick={() => onAddContext(bill.id)} 
          className={`add-context-button ${isContextActive ? 'clicked' : ''}`}
        >
          {isContextActive ? 'Added' : 'Add Context'}
        </button>
      </div>

      <style jsx>{`
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

        .card-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.75rem;
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

        .data-card.context-active {
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }
      `}</style>
    </div>
  )
}