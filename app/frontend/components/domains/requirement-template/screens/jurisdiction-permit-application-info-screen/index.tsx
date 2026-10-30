import { Box, Container, Flex, Heading, HStack, List, ListItem, Text } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { useMst } from "../../../../../setup/root"
import { permitApplicationInfoPath } from "../../../../../utils/permit-application-info-path"
import { isTipTapEmpty } from "../../../../../utils/utility-functions"
import { CalloutBanner } from "../../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"

const LOCAL_CONTEXT_ITEM_KEYS = ["bylaws", "documents", "links", "fees", "steps"] as const

export const JurisdictionPermitApplicationInfoScreen = observer(function JurisdictionPermitApplicationInfoScreen() {
  const { t } = useTranslation()
  const { userStore, requirementTemplateStore, sandboxStore } = useMst()
  const jurisdiction = userStore.currentUser?.jurisdiction
  const { isSandboxActive } = sandboxStore
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const [localContextHtml, setLocalContextHtml] = useState("")
  const [loadingLocalContext, setLoadingLocalContext] = useState(true)

  useEffect(() => {
    if (!templateVersion || !jurisdiction) return
    if (!templateVersion.explainerPublished || isSandboxActive) {
      setLocalContextHtml("")
      setLoadingLocalContext(false)
      return
    }
    let cancelled = false
    setLoadingLocalContext(true)
    requirementTemplateStore
      .fetchJurisdictionExplainer(templateVersion.requirementTemplateId, jurisdiction.id)
      .then((saved) => {
        if (cancelled) return
        setLocalContextHtml(saved?.localContextHtml ?? "")
        setLoadingLocalContext(false)
      })
      .catch(() => {
        if (!cancelled) setLoadingLocalContext(false)
      })
    return () => {
      cancelled = true
    }
  }, [templateVersion, jurisdiction?.id, isSandboxActive])

  if (!jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (templateVersionError) return <ErrorScreen error={templateVersionError} />
  if (!templateVersion) return <LoadingScreen />

  const hasLocalContext = !isTipTapEmpty(localContextHtml)
  const editPath = `/digital-building-permits/${templateVersion.id}/application-info/edit`
  const publicPath = permitApplicationInfoPath(templateVersion.requirementTemplateId, jurisdiction.id)

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Flex direction="column" gap={6}>
        <Box>
          <RouterLinkButton variant="link" to="/digital-building-permits" leftIcon={<CaretLeft size={20} />} mb={6}>
            {t("ui.back")}
          </RouterLinkButton>
          <Heading as="h1" size="2xl" mb={2}>
            {t("digitalBuildingPermits.applicationInfo.title")}
          </Heading>
          <Text>{t("requirementTemplate.explainer.localContextHint")}</Text>
        </Box>

        {loadingLocalContext ? (
          <LoadingScreen />
        ) : isSandboxActive ? (
          <CalloutBanner type="info" title={t("sandbox.disabledFor")} my={0} />
        ) : templateVersion.explainerPublished ? (
          <>
            <CalloutBanner type="info" title={t("digitalBuildingPermits.applicationInfo.supportingNote")} my={0} />

            <Box>
              <Heading as="h2" fontSize="xl" mb={3}>
                {t("digitalBuildingPermits.applicationInfo.addLocalContextTitle")}
              </Heading>
              <Text mb={4}>{t("digitalBuildingPermits.applicationInfo.addLocalContextIntro")}</Text>
              <List spacing={2} mb={4} styleType="disc" pl={6}>
                {LOCAL_CONTEXT_ITEM_KEYS.map((key) => (
                  <ListItem key={key}>{t(`digitalBuildingPermits.applicationInfo.items.${key}`)}</ListItem>
                ))}
              </List>
              <HStack spacing={3}>
                <RouterLinkButton variant="primary" to={editPath}>
                  {hasLocalContext
                    ? t("digitalBuildingPermits.applicationInfo.editButton")
                    : t("digitalBuildingPermits.applicationInfo.addButton")}
                </RouterLinkButton>
                <RouterLinkButton variant="secondary" to={publicPath} target="_blank" rel="noopener noreferrer">
                  {t("digitalBuildingPermits.applicationInfo.viewPublicPage")}
                </RouterLinkButton>
              </HStack>
            </Box>
          </>
        ) : (
          <CalloutBanner type="info" title={t("digitalBuildingPermits.applicationInfo.unpublishedNote")} my={0} />
        )}
      </Flex>
    </Container>
  )
})
