import { Container, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PreChecksGrid } from "./pre-checks-grid"

export const PreCheckTabPanelContent = observer(() => {
  const { t } = useTranslation()
  const { preCheckStore } = useMst()

  useSearch(preCheckStore, [])
  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1">{t("preCheck.index.title", "Pre-Construction Checklists")}</Heading>
            <RouterLinkButton to="/pre-checks/new" variant="primary" leftIcon={<Plus />}>
              {t("preCheck.startNew", "Start New Pre-Check")}
            </RouterLinkButton>
          </Flex>
          <Text fontSize="md" color="text.secondary" mb={4}>
            {t(
              "preCheck.index.intro",
              "Your results from the BC Building Code pre-checking service are stored here. You can use this service to pre-check your drawings for compliance with select areas of the BC Building Code before you submit a permit application."
            )}
          </Text>
          <Text fontSize="md" color="text.secondary" mb={4}>
            <Trans
              t={t}
              i18nKey="preCheck.index.betaNotice"
              components={{
                1: <Link href="project-readiness-tools/pre-check" color="link" textDecoration="underline" />,
              }}
            />
          </Text>
          <Text>
            {t("preCheck.index.expiry", "Pre-checks reports are available for 150 days after they are created.")}
          </Text>
          <PreChecksGrid mt={8} />
        </VStack>
      </Container>
    </Flex>
  )
})
