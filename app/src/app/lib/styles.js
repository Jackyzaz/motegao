export const COLORS = {
  primary: "#76ABAE",
  background: "#222831",
  surface: "#31363F",
  text: "#EEEEEE",
  textDim: "#888",
  success: "#50fa7b",
  error: "#ff5555",
  warning: "#ffb86c",
  info: "#76ABAE",
}

export const INPUT_STYLES = {
  base: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    background: COLORS.background,
    border: `1px solid ${COLORS.surface}`,
    color: COLORS.primary,
    outline: "none",
    textAlign: "center",
    fontFamily: "monospace",
    borderRadius: "4px",
  },
}

export const BUTTON_STYLES = {
  primary: {
    padding: "12px 20px",
    background: COLORS.primary,
    color: COLORS.background,
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  secondary: {
    padding: "10px 20px",
    backgroundColor: COLORS.background,
    color: COLORS.text,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  danger: {
    padding: "10px 20px",
    backgroundColor: COLORS.error,
    color: COLORS.background,
    border: "none",
    borderRadius: "4px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s",
  },
}

export const CONTAINER_STYLES = {
  modal: {
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
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: "30px",
    borderRadius: "8px",
    border: `2px solid ${COLORS.primary}`,
    minWidth: "400px",
    maxWidth: "500px",
  },
}
