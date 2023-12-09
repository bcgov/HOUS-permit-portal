import { Box, BoxProps, Container, Flex, Heading, Image } from "@chakra-ui/react"
import React from "react"

interface IBlueTitleBarProps extends BoxProps {
  title: string
  imageSrc?: string
}

export const BlueTitleBar = ({ title, imageSrc, ...rest }: IBlueTitleBarProps) => {
  return (
    <Box h="fit-content" bg="theme.blueGradient" {...rest}>
      <Container as={Flex} direction="column" justify="center" maxW="container.lg" h="full">
        <Box position="relative" h="180px" w="full">
          <Heading as="h1" color="greys.white" position="absolute" left={0} top="68px" fontSize="4xl">
            {title}
          </Heading>
          {imageSrc && (
            <Image
              position="absolute"
              right={0}
              src={imageSrc}
              alt="title decoration"
              h="full"
              objectFit="cover"
              mr={{ base: -4, md: 0 }}
            />
          )}
        </Box>
      </Container>
    </Box>
  )
}
