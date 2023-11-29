import { Box, Container, Flex, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface ILandingScreenProps {}

export const LandingScreen = ({}: ILandingScreenProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction="column" w="full">
      <Flex
        align="center"
        h="364px"
        bgImage="https://placehold.co/1080x364"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Container maxW="container.xl">
          <Box p={8} w="468px" bg="theme.blue" color="greys.white">
            <Heading fontSize="2xl">{t("landing.title")}</Heading>
          </Box>
        </Container>
      </Flex>
    </Flex>
  )
}
