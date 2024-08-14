import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import { Envelope } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const EmailConfirmedScreen = function EmailConfirmedScreen() {
  return (
    <Container color="text.primary">
      <VStack py={32} gap={4}>
        <Envelope size="56px" color="var(--chakra-colors-semantic-info)" />
        <Heading as="h2" fontSize="3xl">
          {t("user.emailConfirmed.heading")}
        </Heading>
        <Text textAlign="center">{t("user.emailConfirmed.description")}</Text>
        <RouterLinkButton to="/">{t("ui.backHome")}</RouterLinkButton>
      </VStack>
    </Container>
  )
}
