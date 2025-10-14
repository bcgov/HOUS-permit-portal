import { Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
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
            <RouterLinkButton to="/pre-checks/new" variant="primary">
              {t("preCheck.startNew", "Start New Pre-Check")}
            </RouterLinkButton>
          </Flex>
          <PreChecksGrid />
        </VStack>
      </Container>
    </Flex>
  )
})
