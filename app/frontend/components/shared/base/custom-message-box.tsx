import { Box, Flex, Heading, Text, ToastProps } from "@chakra-ui/react"
import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react"
import React from "react"

interface ICustomMessageBoxProps extends ToastProps {
  children?: React.ReactNode
}
const iconMap = {
  success: <CheckCircle size={24} aria-label={"success icon"} />,
  warning: <Warning size={24} aria-label={"warning icon"} />,
  error: <WarningCircle size={24} aria-label={"error icon"} />,
  info: <Info size={24} aria-label={"info icon"} />,
}

export const CustomMessageBox = ({ title, description, status, children }: ICustomMessageBoxProps) => {
  return (
    <Flex
      direction="column"
      gap={2}
      bg={`semantic.${status}Light`}
      border="1px solid"
      borderRadius="lg"
      borderColor={`semantic.${status}`}
      p={4}
    >
      <Flex align="flex-start" gap={2}>
        <Box color={`semantic.${status}`}>{iconMap[status]}</Box>
        <Flex direction="column" gap={2}>
          {title && (
            <Heading as="h3" fontSize="md">
              {title}
            </Heading>
          )}
          {description && <Text>{description}</Text>}
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
