import { Box, Flex, Heading, Text, ToastProps } from "@chakra-ui/react"
import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react"
import React from "react"

interface ICustomMessageBoxProps extends ToastProps {
  children?: React.ReactNode
}

export const CustomMessageBox = ({ title, description, status, children }: ICustomMessageBoxProps) => {
  const iconMap = {
    success: <CheckCircle size={24} />,
    warning: <Warning size={24} />,
    error: <WarningCircle size={24} />,
    info: <Info size={24} />,
  }

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
        </Flex>
        {children}
      </Flex>
    </Flex>
  )
}
