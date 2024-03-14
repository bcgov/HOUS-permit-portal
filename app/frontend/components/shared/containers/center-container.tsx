import { Center, CenterProps, Container, Flex } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ICenterContainerProps extends CenterProps {
  children: ReactNode
}

export const CenterContainer = ({ children, ...rest }: ICenterContainerProps) => {
  return (
    <Flex direction="column" w="full" bg="greys.grey03" flex={1} {...rest}>
      <Center as={Container} maxW="container.md" flex={{ base: 0, sm: 1 }} my="5%" px={0} {...rest}>
        {children}
      </Center>
    </Flex>
  )
}
