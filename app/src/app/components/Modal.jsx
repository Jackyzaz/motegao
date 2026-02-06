"use client"

export default function Modal({ isOpen, onClose, title, message, type = "info", confirmText = "OK", showCancel = false, onConfirm }) {
  if (!isOpen) return null

  const getTypeColor = () => {
    switch (type) {
      case "error":
        return "#ff5555"
      case "success":
        return "#50fa7b"
      case "warning":
        return "#ffb86c"
      default:
        return "#76ABAE"
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleCancel = () => {
    onClose()
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
          border: `2px solid ${getTypeColor()}`,
          minWidth: "400px",
          maxWidth: "500px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && (
          <h3 style={{ 
            color: getTypeColor(), 
            marginBottom: "15px", 
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            {type === "error" && "❌ "}
            {type === "success" && "✅ "}
            {type === "warning" && "⚠️ "}
            {type === "info" && "ℹ️ "}
            {title}
          </h3>
        )}

        {/* Message */}
        <p style={{ 
          color: "#EEEEEE", 
          marginBottom: "25px",
          lineHeight: "1.5"
        }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          justifyContent: "flex-end" 
        }}>
          {showCancel && (
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
          )}
          <button
            onClick={handleConfirm}
            style={{
              padding: "10px 20px",
              backgroundColor: getTypeColor(),
              color: type === "success" || type === "warning" ? "#222831" : "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
