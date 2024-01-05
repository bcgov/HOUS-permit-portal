import { CenterProps, Container, Flex } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface IFullWhiteContainerProps extends CenterProps {
  children: ReactNode
}

export const FullWhiteContainer = ({ children, ...rest }: IFullWhiteContainerProps) => {
  return (
    <Flex direction="column" w="full" bg="greys.white" {...rest}>
      <Container maxW="container.lg" py={16} px={8}>
        {children}
      </Container>
    </Flex>
  )
}
