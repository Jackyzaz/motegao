"use client"
import { createContext, useContext, useState, useCallback } from "react"
import toast, { Toaster } from "react-hot-toast"
import InputModal from "@/app/components/InputModal"

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within ModalProvider")
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [inputModalState, setInputModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "OK",
    inputValue: "",
    placeholder: "Enter value...",
    onConfirm: null,
  })

  const showInputModal = useCallback((config) => {
    setInputModalState({
      isOpen: true,
      title: config.title || "",
      message: config.message || "",
      confirmText: config.confirmText || "OK",
      inputValue: config.initialValue || "",
      placeholder: config.placeholder || "Enter value...",
      onConfirm: config.onConfirm || null,
    })
  }, [])

  const hideInputModal = useCallback(() => {
    setInputModalState(prev => ({ ...prev, isOpen: false, inputValue: "" }))
  }, [])

  const updateInputValue = useCallback((value) => {
    setInputModalState(prev => ({ ...prev, inputValue: value }))
  }, [])

  const showError = useCallback((message, title = "Error") => {
    toast.error(title ? `${title}: ${message}` : message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#31363F",
        color: "#EEEEEE",
        border: "1px solid #ff5555",
      },
      iconTheme: {
        primary: "#ff5555",
        secondary: "#31363F",
      },
    })
  }, [])

  const showSuccess = useCallback((message, title = "Success") => {
    toast.success(title ? `${title}: ${message}` : message, {
      duration: 3000,
      position: "top-right",
      style: {
        background: "#31363F",
        color: "#EEEEEE",
        border: "1px solid #50fa7b",
      },
      iconTheme: {
        primary: "#50fa7b",
        secondary: "#31363F",
      },
    })
  }, [])

  const showWarning = useCallback((message, title = "Warning") => {
    toast(title ? `${title}: ${message}` : message, {
      duration: 4000,
      position: "top-right",
      icon: "⚠️",
      style: {
        background: "#31363F",
        color: "#EEEEEE",
        border: "1px solid #ffb86c",
      },
    })
  }, [])

  const showInfo = useCallback((message, title = "Information") => {
    toast(title ? `${title}: ${message}` : message, {
      duration: 3000,
      position: "top-right",
      icon: "ℹ️",
      style: {
        background: "#31363F",
        color: "#EEEEEE",
        border: "1px solid #76ABAE",
      },
    })
  }, [])

  const showConfirm = useCallback((message, onConfirm, title = "Confirm") => {
    const toastId = toast(
      (t) => (
        <div>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            {title}
          </div>
          <div style={{ marginBottom: "12px" }}>{message}</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                toast.dismiss(t.id)
              }}
              style={{
                padding: "6px 12px",
                background: "#222831",
                color: "#EEEEEE",
                border: "1px solid #76ABAE",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                if (onConfirm) onConfirm()
              }}
              style={{
                padding: "6px 12px",
                background: "#ffb86c",
                color: "#222831",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "12px",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-right",
        style: {
          background: "#31363F",
          color: "#EEEEEE",
          border: "1px solid #ffb86c",
          maxWidth: "400px",
        },
      }
    )
  }, [])

  return (
    <ModalContext.Provider 
      value={{ 
        showError, 
        showSuccess, 
        showWarning, 
        showInfo,
        showConfirm,
        showInputModal,
        hideInputModal
      }}
    >
      <Toaster />
      {children}
      
      <InputModal
        isOpen={inputModalState.isOpen}
        onClose={hideInputModal}
        title={inputModalState.title}
        message={inputModalState.message}
        confirmText={inputModalState.confirmText}
        inputValue={inputModalState.inputValue}
        onInputChange={updateInputValue}
        placeholder={inputModalState.placeholder}
        onConfirm={inputModalState.onConfirm}
      />
    </ModalContext.Provider>
  )
}
