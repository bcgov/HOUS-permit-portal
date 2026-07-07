import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const OverheatingCodeUnavailableScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.md" py={16}>
      <VStack align="flex-start" spacing={6}>
        <Box>
          <Heading as="h1">{t("overheatingCode.unavailable.title")}</Heading>
          <Text mt={4}>{t("overheatingCode.unavailable.description")}</Text>
          <Text mt={4}>{t("overheatingCode.unavailable.savedWork")}</Text>
        </Box>
        <RouterLinkButton to="/project-readiness-tools" variant="primary">
          {t("overheatingCode.unavailable.returnToTools")}
        </RouterLinkButton>
      </VStack>
    </Container>
  )
}
