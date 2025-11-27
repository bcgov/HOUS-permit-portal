import React, { createContext, useContext, useState } from "react"
import { useMst } from "../setup/root"

interface PopoverContextProps {
  isOpen: boolean
  handleOpen: () => void
  handleClose: () => void
  numberJustRead: number
  showRead: boolean
  setShowRead: (boolean) => void
  // Menu state management
  isMenuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
}

const PopoverContext = createContext<PopoverContextProps | undefined>(undefined)

interface IPopoverProvider {
  children: React.ReactNode
}

export const PopoverProvider: React.FC<IPopoverProvider> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showRead, setShowRead] = useState<boolean>(false)
  const [numberJustRead, setNumberJustRead] = useState<number>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)

  const { notificationStore } = useMst()
  const { unreadNotificationsCount, markAllAsRead } = notificationStore

  const handleOpen = () => {
    // Close the menu when opening the notification popover
    setIsMenuOpen(false)
    onOpen()
    setNumberJustRead(unreadNotificationsCount)
    markAllAsRead()
  }

  const handleClose = () => {
    setShowRead(false)
    onClose()
  }

  // Menu state management
  const openMenu = () => setIsMenuOpen(true)
  const closeMenu = () => setIsMenuOpen(false)
  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  return (
    <PopoverContext.Provider
      value={{
        isOpen,
        handleOpen,
        handleClose,
        numberJustRead,
        showRead,
        setShowRead,
        isMenuOpen,
        openMenu,
        closeMenu,
        toggleMenu,
      }}
    >
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
