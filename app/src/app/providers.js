"use client"
import { SessionProvider } from "next-auth/react"
import { ModalProvider } from "@/app/context/ModalContext"

export function Providers({ children }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ModalProvider>
        {children}
      </ModalProvider>
    </SessionProvider>
  )
}