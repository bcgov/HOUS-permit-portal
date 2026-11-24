import { Container, ContainerProps, Flex, FlexProps, Heading } from "@chakra-ui/react"
import React from "react"
import { HomeScreenBox } from "../home-screen-box"

interface IProps {
  heading: string
  boxes: React.ComponentProps<typeof HomeScreenBox>[]
  containerProps?: Partial<ContainerProps>
  flexProps?: Partial<FlexProps>
  children?: React.ReactNode
}

export function TechnicalSupportHomeSection({ heading, boxes, containerProps = {}, flexProps = {}, children }: IProps) {
  return (
    <Container maxW="container.md" py={16} as="main" {...containerProps}>
      <Flex direction="column" align="center" w="full" {...flexProps}>
        <Heading as="h1" mb={8}>
          {heading}
        </Heading>
        {children}
        <Flex direction="column" align="center" w="full" gap={6}>
          {boxes.map((box, idx) => (
            <HomeScreenBox key={idx} {...box} />
          ))}
        </Flex>
      </Flex>
    </Container>
  )
}
