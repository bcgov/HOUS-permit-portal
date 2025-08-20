import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import React from "react"

export function DocumentsTabPanelContent() {
  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1">Coming soon</Heading>
          <Text color="greys.grey01">We're working on this feature. Check back later.</Text>
        </VStack>
      </Container>
    </Flex>
  )
}
