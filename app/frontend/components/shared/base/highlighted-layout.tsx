import { Flex, FlexProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"

interface IHighlightedLayoutProps extends FlexProps {
  children: ReactNode
}

export const HighlightedLayout = ({ children, ...rest }: IHighlightedLayoutProps) => {
  return (
    <Flex
      direction="column"
      bg="theme.blueShadedDark"
      color="greys.white"
      borderRadius="sm"
      borderLeft="8px solid"
      borderColor="theme.yellow"
      {...rest}
    >
      {children}
    </Flex>
  )
}
