'use client'

export default function RightSidePanel({ 
  rightOpen, 
  rightPanelExtendedWidth,
  onClose,
  onMouseDown,
  chatMessages,
  chatInput,
  onChatInputChange,
  onChatSubmit,
  selectedContext
}) {
  return (
    <div 
      className={`accordion-panel right-accordion ${rightOpen ? 'open' : 'closed'}`}
      style={{ width: rightPanelExtendedWidth }}
    >
      <div className="drag-handle" onMouseDown={onMouseDown}></div>
      <div className="accordion-content">
        <div className="accordion-header">
          <h2>Bill Finder Assistant</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="chatbot-section">
          <div className="chatbot-title">Ask any question</div>
          <div className="messages">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={onChatSubmit} className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={chatInput}
              onChange={onChatInputChange}
            />
            <button type="submit" className="chat-send-button">Send</button>
          </form>
          
          <div className="context-status-container">
            <div className="context-status-text">
              {selectedContext ? (
                <span className="context-title">{selectedContext.title}</span>
              ) : (
                <span className="no-context">No Context</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .accordion-panel {
          position: fixed;
          top: 0;
          height: 100vh;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 999;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
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