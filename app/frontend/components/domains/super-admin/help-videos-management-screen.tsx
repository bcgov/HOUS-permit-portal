import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const HelpVideosManagementScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" py={12} as="main">
      <VStack align="stretch" spacing={4}>
        <Heading as="h1">{t("helpVideos.management.title")}</Heading>
        <Text color="text.secondary">{t("helpVideos.management.description")}</Text>
      </VStack>
    </Container>
  )
}
