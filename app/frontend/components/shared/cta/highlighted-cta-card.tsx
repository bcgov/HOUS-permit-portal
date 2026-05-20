import { Flex, FlexProps, Heading, Text } from "@chakra-ui/react"
import React, { ReactNode } from "react"

import { HighlightedLayout } from "../base/highlighted-layout"

export interface IHighlightedCtaCardProps extends FlexProps {
  title: string
  description: ReactNode
  action: ReactNode
}

export const HighlightedCtaCard = ({ title, description, action, ...rest }: IHighlightedCtaCardProps) => {
  return (
    <HighlightedLayout px={6} py={4} gap={2} h="full" {...rest}>
      <Heading as="h5" fontSize="xl" fontWeight="bold" mb={0}>
        {title}
      </Heading>
      <Text fontSize="md">{description}</Text>
      <Flex mt="auto" pt={2}>
        {action}
      </Flex>
    </HighlightedLayout>
  )
}
