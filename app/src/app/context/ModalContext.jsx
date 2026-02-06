"use client"
import { createContext, useContext, useState, useCallback } from "react"
import Modal from "@/app/components/Modal"

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error("useModal must be used within ModalProvider")
  }
  return context
}

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "OK",
    showCancel: false,
    onConfirm: null,
  })

  const showModal = useCallback((config) => {
    setModalState({
      isOpen: true,
      title: config.title || "",
      message: config.message || "",
      type: config.type || "info",
      confirmText: config.confirmText || "OK",
      showCancel: config.showCancel || false,
      onConfirm: config.onConfirm || null,
    })
  }, [])

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Convenience methods
  const showError = useCallback((message, title = "Error") => {
    showModal({ type: "error", title, message })
  }, [showModal])

  const showSuccess = useCallback((message, title = "Success") => {
    showModal({ type: "success", title, message })
  }, [showModal])

  const showWarning = useCallback((message, title = "Warning") => {
    showModal({ type: "warning", title, message })
  }, [showModal])

  const showInfo = useCallback((message, title = "Information") => {
    showModal({ type: "info", title, message })
  }, [showModal])

  const showConfirm = useCallback((message, onConfirm, title = "Confirm") => {
    showModal({ 
      type: "warning", 
      title, 
      message, 
      showCancel: true,
      confirmText: "Confirm",
      onConfirm 
    })
  }, [showModal])

  return (
    <ModalContext.Provider 
      value={{ 
        showModal, 
        hideModal, 
        showError, 
        showSuccess, 
        showWarning, 
        showInfo,
        showConfirm 
      }}
    >
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        showCancel={modalState.showCancel}
        onConfirm={modalState.onConfirm}
      />
    </ModalContext.Provider>
  )
}
