import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { configurePermitInformationParam } from "../../../../utils/permit-application-info-path"
import { ToggleArchivedButton } from "../../../shared/buttons/toggle-archived-button"
import { RouterLink } from "../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { RequirementTemplateGrid } from "../../../shared/requirement-template/requirement-template-grid"
import { ExplainerModal } from "../explainer-modal"
import { RequirementTemplateActions } from "../requirement-template-actions"

function withoutConfigureParam(prev: URLSearchParams) {
  const next = new URLSearchParams(prev)
  next.delete(configurePermitInformationParam)
  return next
}

export const RequirementTemplatesScreen = observer(function RequirementTemplate() {
  const { requirementTemplateStore } = useMst()
  const [searchParams, setSearchParams] = useSearchParams()
  const configureTemplateId = searchParams.get(configurePermitInformationParam)
  const configureTemplate = configureTemplateId
    ? requirementTemplateStore.getRequirementTemplateById(configureTemplateId)
    : undefined

  useEffect(() => {
    if (!configureTemplateId || requirementTemplateStore.getRequirementTemplateById(configureTemplateId)) return
    let cancelled = false
    requirementTemplateStore.fetchRequirementTemplate(configureTemplateId).then(
      (template) => {
        if (cancelled || template) return
        setSearchParams(withoutConfigureParam, { replace: true })
      },
      () => {
        if (!cancelled) setSearchParams(withoutConfigureParam, { replace: true })
      }
    )
    return () => {
      cancelled = true
    }
  }, [configureTemplateId, requirementTemplateStore, setSearchParams])

  const closeConfigure = () => setSearchParams(withoutConfigureParam, { replace: true })

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
            <Text color={"text.secondary"} mt={1}>
              <Trans
                i18nKey="requirementTemplate.index.categoryDescription"
                components={{
                  permitCategoriesLink: (
                    <RouterLink
                      to="/configuration-management/template-categories"
                      color="text.link"
                      textDecoration="underline"
                    />
                  ),
                }}
              />
            </Text>
          </Box>
          <RouterLinkButton to="new" variant={"primary"} minWidth="fit-content">
            {t("requirementTemplate.index.createButton")}
          </RouterLinkButton>
        </Flex>

        <RequirementTemplateGrid renderActions={(rt) => <RequirementTemplateActions requirementTemplate={rt} />} />

        {configureTemplate && (
          <ExplainerModal requirementTemplate={configureTemplate} isOpen onClose={closeConfigure} />
        )}

        <ToggleArchivedButton searchModel={requirementTemplateStore} mt={3} />
      </VStack>
    </Container>
  )
})
