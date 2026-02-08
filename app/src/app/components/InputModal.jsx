"use client"

export default function InputModal({ isOpen, onClose, title, message, confirmText = "OK", onConfirm, inputValue, onInputChange, placeholder = "Enter value..." }) {
  if (!isOpen) return null

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(inputValue)
    }
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue && inputValue.trim()) {
      handleConfirm()
    }
  }

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: "#31363F",
          padding: "30px",
          borderRadius: "8px",
          border: "2px solid #76ABAE",
          minWidth: "450px",
          maxWidth: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 style={{ 
            color: "#76ABAE", 
            marginBottom: "15px", 
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            {title}
          </h3>
        )}

        {message && (
          <p style={{ 
            color: "#EEEEEE", 
            marginBottom: "15px",
            lineHeight: "1.5"
          }}>
            {message}
          </p>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#222831",
            color: "#EEEEEE",
            border: "1px solid #76ABAE",
            borderRadius: "4px",
            fontSize: "14px",
            marginBottom: "25px",
            outline: "none",
            fontFamily: "inherit"
          }}
        />

        <div style={{
          display: "flex", 
          gap: "10px", 
          justifyContent: "flex-end" 
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#222831",
              color: "#EEEEEE",
              border: "1px solid #76ABAE",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!inputValue || !inputValue.trim()}
            style={{
              padding: "10px 20px",
              backgroundColor: inputValue && inputValue.trim() ? "#76ABAE" : "#444",
              color: "#222831",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: inputValue && inputValue.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              opacity: inputValue && inputValue.trim() ? 1 : 0.5
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
