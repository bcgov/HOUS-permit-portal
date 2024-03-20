import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import { Envelope } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"

export const EmailConfirmedScreen = function EmailConfirmedScreen() {
  return (
    <Container color="text.primary">
      <VStack py={32}>
        <Envelope size="56px" color="var(--chakra-colors-semantic-info)" />
        <Heading as="h2" fontSize="3xl">
          {t("jurisdiction.submissionEmailConfirmed.heading")}
        </Heading>
        <Text>{t("jurisdiction.submissionEmailConfirmed.description")}</Text>
      </VStack>
    </Container>
  )
}
