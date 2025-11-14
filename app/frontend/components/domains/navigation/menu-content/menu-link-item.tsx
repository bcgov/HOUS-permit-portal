import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"

export interface IMenuLinkItemProps {
  icon: React.ReactNode
  label: string
  to?: string
  onClick?: () => void
  description?: string
}

// Context for closing the menu drawer
const MenuCloseContext = React.createContext<(() => void) | undefined>(undefined)

export const MenuCloseProvider = MenuCloseContext.Provider

export const useMenuClose = () => useContext(MenuCloseContext)

export const MenuLinkItem = ({ icon, label, to, onClick, description }: IMenuLinkItemProps) => {
  const navigate = useNavigate()
  const onClose = useMenuClose()

  const handleClick = () => {
    if (to) {
      navigate(to)
      if (onClose) {
        onClose()
      }
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <Flex
      as={to || onClick ? "button" : "div"}
      onClick={to || onClick ? handleClick : undefined}
      align="flex-start"
      gap={3}
      p={1.5}
      borderRadius="md"
      _hover={to || onClick ? { bg: "hover.blue", cursor: "pointer" } : {}}
      w="full"
      textAlign="left"
    >
      <Box mt={0.5} color="text.primary">
        {icon}
      </Box>
      <VStack align="flex-start" spacing={0} flex={1}>
        <Text fontWeight="medium" color="text.primary">
          {label}
        </Text>
        {description && (
          <Text fontSize="sm" color="greys.grey01" mt={1}>
            {description}
          </Text>
        )}
      </VStack>
    </Flex>
  )
}
