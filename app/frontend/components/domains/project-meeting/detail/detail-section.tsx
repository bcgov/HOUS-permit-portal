import { Box, Heading } from "@chakra-ui/react"
import React from "react"

export const DetailSection = ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
  <Box as="section" mb={8}>
    <Heading as="h2" size="lg" mb={4}>
      {title}
    </Heading>
    {children}
  </Box>
)
