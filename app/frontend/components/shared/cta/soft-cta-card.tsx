import { Box, BoxProps, Flex, Heading, Text } from "@chakra-ui/react"
import React, { ReactNode } from "react"

export interface ISoftCtaCardProps extends BoxProps {
  title: string
  description: ReactNode
  action: ReactNode
}

export const SoftCtaCard = ({ title, description, action, ...rest }: ISoftCtaCardProps) => {
  return (
    <Box
      borderRadius="lg"
      bg="theme.blueLight"
      color="text.primary"
      px={6}
      py={4}
      display="flex"
      flexDirection="column"
      gap={2}
      h="full"
      {...rest}
    >
      <Heading as="h5" fontSize="xl" fontWeight="bold" mb={0} color="text.primary">
        {title}
      </Heading>
      <Text fontSize="md" color="text.primary">
        {description}
      </Text>
      <Flex mt="auto" pt={2}>
        {action}
      </Flex>
    </Box>
  )
}
