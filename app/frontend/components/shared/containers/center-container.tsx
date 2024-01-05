import { Center, CenterProps, Container } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface ICenterContainerProps extends CenterProps {
  children: ReactNode
}

export const CenterContainer = ({ children, ...rest }: ICenterContainerProps) => {
  return (
    <Center as={Container} maxW="container.md" flex={{ base: 0, sm: 1 }} px={0} {...rest}>
      {children}
    </Center>
  )
}
