'use client'

export default function BillModal({ 
  isOpen, 
  bill, 
  onClose, 
  showFullAnalysis, 
  onToggleAnalysis 
}) {
  if (!isOpen || !bill) return null;

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{bill.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="bill-info-section">
            <h3>Bill Information</h3>
            <div className="bill-detail-item">
              <strong>Bill Number:</strong> {bill.bill_number}
            </div>
            <div className="bill-detail-item">
              <strong>Latest Action Date:</strong> {formatDate(bill.update_date)}
            </div>
            <div className="bill-detail-item">
              <strong>Description:</strong>
              <p className="bill-description">{bill.description}</p>
            </div>
          </div>
          
          <div className="population-analysis-section">
            <h3>Population Impact Analysis</h3>
            <div className="population-content">
              {bill.population_affect_summary ? (
                <div className="formatted-text">
                  {(() => {
                    const fullText = bill.population_affect_summary;
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
                              onClick={onToggleAnalysis}
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

      <style jsx>{`
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
          from { opacity: 0; }
          to { opacity: 1; }
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
      `}</style>
    </div>
  )
}