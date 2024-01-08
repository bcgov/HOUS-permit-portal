import { Container, Flex, FlexProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface IFullWhiteContainerProps extends FlexProps {
  children: ReactNode
  containerMaxW?: string
}

export const FullWhiteContainer = ({ children, containerMaxW, ...rest }: IFullWhiteContainerProps) => {
  return (
    <Flex direction="column" w="full" bg="greys.white" flex={1} {...rest}>
      <Container as={Flex} direction="column" maxW={containerMaxW || "container.lg"} p={8} flex={1}>
        {children}
      </Container>
    </Flex>
  )
}
