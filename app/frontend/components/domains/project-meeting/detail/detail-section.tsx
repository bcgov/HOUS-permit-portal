import { Box, Heading, HStack } from "@chakra-ui/react"
import React from "react"

export const DetailSection = ({
  title,
  action,
  children,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) => (
  <Box as="section" mb={8}>
    <HStack justify="flex-start" align="center" mb={4}>
      <Heading as="h2" size="lg" mb={0}>
        {title}
      </Heading>
      {action}
    </HStack>
    {children}
  </Box>
)
