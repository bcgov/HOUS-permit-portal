import { Box, Heading, Text } from "@chakra-ui/react"
import React from "react"

export const SectionHeading = ({ title, description }: { title: string; description?: string }) => (
  <Box mb={6}>
    <Heading as="h1" size="xl" mb={3}>
      {title}
    </Heading>
    {description && <Text>{description}</Text>}
  </Box>
)
