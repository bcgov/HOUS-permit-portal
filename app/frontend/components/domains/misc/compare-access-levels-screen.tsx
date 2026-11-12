import { Container, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const CompareAccessLevelsScreen = () => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("permitProject.people.compareAccessLevels")}
      </Heading>
      {/* TODO HUB-5778 compare access levels content */}
      <Text fontSize="lg">{t("permitProject.people.compareAccessLevelsTodo")}</Text>
    </Container>
  )
}
