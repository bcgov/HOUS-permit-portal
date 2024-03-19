import { Box, Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { Archive } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RequirementBlocksTable } from "./requirement-blocks-table"
import { RequirementsBlockModal } from "./requirements-block-modal"

export const RequirementsLibraryScreen = observer(function RequirementsLibrary() {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("requirementsLibrary.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("requirementsLibrary.index.description")}
            </Text>
          </Box>
          <RequirementsBlockModal />
        </Flex>

        <RequirementBlocksTable alignItems={"flex-start"} w={"full"} />

        <Button leftIcon={<Archive size={16} />} variant={"secondary"} mt={3}>
          {t("ui.seeArchivedButton")}
        </Button>
      </VStack>
    </Container>
  )
})
