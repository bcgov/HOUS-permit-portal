import { Badge, Box, Flex, Text, VStack } from "@chakra-ui/react"
import React, { useContext } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

export interface IMenuLinkItemProps {
  icon: React.ReactNode
  label: string
  to?: string
  onClick?: () => void
  description?: string
  badge?: number
}

// Context for closing the menu drawer
const MenuCloseContext = React.createContext<(() => void) | undefined>(undefined)

export const MenuCloseProvider = MenuCloseContext.Provider

export const useMenuClose = () => useContext(MenuCloseContext)

export const MenuLinkItem = ({ icon, label, to, onClick, description, badge }: IMenuLinkItemProps) => {
  const navigate = useNavigate()
  const onClose = useMenuClose()
  const { t } = useTranslation()

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
        <Flex align="center" gap={2}>
          <Text fontWeight="medium" color="text.primary">
            {label}
          </Text>
          {!!badge && badge > 0 && (
            <Badge colorScheme="green" borderRadius="full" px={2}>
              {badge} {t("ui.new")}
            </Badge>
          )}
        </Flex>
        {description && (
          <Text fontSize="sm" color="greys.grey01" mt={1}>
            {description}
          </Text>
        )}
      </VStack>
    </Flex>
  )
}
