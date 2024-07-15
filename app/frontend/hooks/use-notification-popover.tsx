import React, { createContext, useContext, useState } from "react"
import { useMst } from "../setup/root"

interface PopoverContextProps {
  isOpen: boolean
  handleOpen: () => void
  handleClose: () => void
  numberJustRead: number
  showRead: boolean
  setShowRead: (boolean) => void
}

const PopoverContext = createContext<PopoverContextProps | undefined>(undefined)

interface IPopoverProvider {
  children: React.ReactNode
}

export const PopoverProvider: React.FC<IPopoverProvider> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showRead, setShowRead] = useState<boolean>(false)
  const [numberJustRead, setNumberJustRead] = useState<number>()

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  const { notificationStore } = useMst()
  const { unreadNotificationsCount, markAllAsRead } = notificationStore

  const handleOpen = () => {
    onOpen()
    setNumberJustRead(unreadNotificationsCount)
    markAllAsRead()
  }

  const handleClose = () => {
    setShowRead(false)
    onClose()
  }

  return (
    <PopoverContext.Provider value={{ isOpen, handleOpen, handleClose, numberJustRead, showRead, setShowRead }}>
      {children}
    </PopoverContext.Provider>
  )
}

export const useNotificationPopover = () => {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider")
  }
  return context
}
