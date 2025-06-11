import { Container, Flex, Heading } from "@chakra-ui/react"
import React from "react"
import { HomeScreenBox } from "../home-screen-box"

export function TechnicalSupportHomeSection({ heading, boxes, containerProps = {}, flexProps = {} }) {
  return (
    <Container maxW="container.md" py={16} as="main" {...containerProps}>
      <Flex direction="column" align="center" w="full" {...flexProps}>
        <Heading as="h1" mb={8}>
          {heading}
        </Heading>
        <Flex direction="column" align="center" w="full" gap={6}>
          {boxes.map((box, idx) => (
            <HomeScreenBox key={idx} {...box} />
          ))}
        </Flex>
      </Flex>
    </Container>
  )
}
