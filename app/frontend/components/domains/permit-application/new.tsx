import { Container, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"

interface IPermitApplicationNewScreenProps {}

export const PermitApplicationNewScreen = observer(({}: IPermitApplicationNewScreenProps) => {
  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <Container maxW="container.lg">
        Todo - need to check the address, compute the jurisdiction, input permit type and work type After this is
        selected, create is called and you go to the application id in progress with the form
      </Container>
    </Flex>
  )
})
