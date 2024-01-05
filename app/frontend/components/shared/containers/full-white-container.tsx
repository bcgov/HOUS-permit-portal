import { CenterProps, Container, Flex } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface IFullWhiteContainerProps extends CenterProps {
  children: ReactNode
}

export const FullWhiteContainer = ({ children, ...rest }: IFullWhiteContainerProps) => {
  return (
    <Flex direction="column" w="full" bg="greys.white" flex={1} {...rest}>
      <Container as={Flex} direction="column" maxW="container.lg" py={16} px={8} flex={1}>
        {children}
      </Container>
    </Flex>
  )
}
