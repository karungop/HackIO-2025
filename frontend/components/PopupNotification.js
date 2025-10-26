'use client'

export default function PopupNotification({ type, message, onClose }) {
  return (
    <div className={`popup-notification ${type}`}>
      <div className="popup-content">
        <span className="popup-message">{message}</span>
        <button className="popup-close" onClick={onClose}>×</button>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  )
}