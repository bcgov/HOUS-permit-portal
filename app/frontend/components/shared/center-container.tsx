import { Container, Flex } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { NAVBAR_HEIGHT } from "../domains/navigation/nav-bar"

interface ICenterContainerProps {
  children: ReactNode
}

export const CenterContainer = ({ children }: ICenterContainerProps) => {
  return (
    <Container maxW="container.md" h="full" p={0}>
      <Flex direction="column" height={`calc(100vh - ${NAVBAR_HEIGHT})`} justify={{ base: "flex-start", md: "center" }}>
        {children}
      </Flex>
    </Container>
  )
}
