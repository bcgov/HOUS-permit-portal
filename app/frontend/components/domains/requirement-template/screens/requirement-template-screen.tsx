import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { ToggleArchivedButton } from "../../../shared/buttons/show-archived-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { RequirementTemplateGrid } from "../../../shared/requirement-template/requirement-template-grid"
import { TemplateVersionsSidebar } from "../template-versions-sidebar"

export const RequirementTemplatesScreen = observer(function RequirementTemplate() {
  const { requirementTemplateStore } = useMst()

  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"}>
              {t("requirementTemplate.index.title")}
            </Heading>
            <Text color={"text.secondary"} mt={1}>
              {t("requirementTemplate.index.description")}
            </Text>
          </Box>
          <RouterLinkButton to="new" variant={"primary"} minWidth="fit-content">
            {t("requirementTemplate.index.createButton")}
          </RouterLinkButton>
        </Flex>

        <RequirementTemplateGrid renderActions={(rt) => <TemplateVersionsSidebar requirementTemplate={rt} />} />

        <ToggleArchivedButton searchModel={requirementTemplateStore} mt={3} />
      </VStack>
    </Container>
  )
})
