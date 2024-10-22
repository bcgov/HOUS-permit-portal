import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { ToggleArchivedButton } from "../../../../shared/buttons/show-archived-button"
import { RequirementBlocksTable } from "../../../requirements-library/requirement-blocks-table"
import { RequirementsBlockModal } from "../../../requirements-library/requirements-block-modal"

export const EarlyAccessRequirementsLibraryScreen = observer(function RequirementsLibrary() {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("earlyAccessRequirementsLibrary.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("earlyAccessRequirementsLibrary.index.description")}
            </Text>
          </Box>
          <RequirementsBlockModal forEarlyAccess />
        </Flex>

        <RequirementBlocksTable alignItems={"flex-start"} w={"full"} forEarlyAccess />
        <ToggleArchivedButton searchModel={requirementBlockStore} mt={3} />
      </VStack>
    </Container>
  )
})
