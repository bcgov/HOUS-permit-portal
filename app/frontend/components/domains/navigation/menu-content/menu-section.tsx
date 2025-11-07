import { Heading, VStack } from "@chakra-ui/react"
import React from "react"

export interface IMenuSectionProps {
  title?: string
  children: React.ReactNode
}

export const MenuSection = ({ title, children }: IMenuSectionProps) => {
  return (
    <VStack align="flex-start" spacing={0} w="full">
      {title && (
        <Heading as="h3" size="lg" fontWeight="bold" color="text.primary" mb={2}>
          {title}
        </Heading>
      )}
      {children}
    </VStack>
  )
}
