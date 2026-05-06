import { Container, ContainerProps, Flex, FlexProps } from "@chakra-ui/react"
import React from "react"
import { colors } from "../../../styles/theme/foundations/colors"

export const DEFAULT_HERO_BACKGROUND_IMAGE = "/images/header-background.jpeg"

export interface IHeroBannerProps extends FlexProps {
  backgroundImageSrc?: string
  containerProps?: ContainerProps
}

function toBgImageValue(src: string): string {
  if (src.startsWith("url(")) return src
  return `url('${src}')`
}

export const HeroBanner = ({
  children,
  backgroundImageSrc = DEFAULT_HERO_BACKGROUND_IMAGE,
  containerProps,
  ...rest
}: IHeroBannerProps) => {
  const bgImage = backgroundImageSrc !== "" ? toBgImageValue(backgroundImageSrc) : undefined
  const overlay = `linear-gradient(${colors.theme.blueShadedLight}, ${colors.theme.blueShadedLight})`

  return (
    <Flex
      w="full"
      direction="column"
      backgroundImage={bgImage ? `${overlay}, ${bgImage}` : overlay}
      backgroundPosition="center 60%"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backgroundColor="theme.blue"
      {...rest}
    >
      <Flex direction="column" justify="center" w="full" h="full" flex="1" minH={0}>
        <Container maxW="container.lg" w="full" mx="auto" {...containerProps}>
          {children}
        </Container>
      </Flex>
    </Flex>
  )
}
