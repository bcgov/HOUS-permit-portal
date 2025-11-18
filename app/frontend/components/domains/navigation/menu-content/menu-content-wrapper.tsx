import { VStack } from "@chakra-ui/react"
import React from "react"

interface IMenuContentWrapperProps {
  children: React.ReactNode
}

export const MenuContentWrapper: React.FC<IMenuContentWrapperProps> = ({ children }) => {
  return (
    <VStack align="flex-start" spacing={4} w="full">
      {children}
    </VStack>
  )
}
