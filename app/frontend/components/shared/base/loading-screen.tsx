import { Center, Container, Flex } from "@chakra-ui/react"
import React from "react"
import { IHomeScreenProps } from "../../domains/home"
import { SharedSpinner } from "./shared-spinner"

export const LoadingScreen = ({ ...rest }: IHomeScreenProps) => {
  return (
    <Container as={Flex} direction="column" maxW="container.lg" flexGrow={1}>
      <Center w="full" flex={1}>
        <SharedSpinner h={24} w={24} />
      </Center>
    </Container>
  )
}
