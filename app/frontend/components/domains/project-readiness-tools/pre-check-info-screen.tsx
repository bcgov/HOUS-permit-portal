import { Container, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const PreCheckInfoScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" color="text.primary">
        {t("preCheck.infoPage.title", "BC Building Code Pre-Checking Service")}
      </Heading>
      <Text pt="4" fontSize="lg" color="text.primary">
        {t("preCheck.infoPage.description", "Information about the BC Building Code pre-checking service.")}
      </Text>

      {/* TODO: Add content about the pre-checking service */}
    </Container>
  )
}
