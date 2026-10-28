import { Box, Button, Container, Flex, Heading, List, ListItem, Text, useDisclosure } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { useMst } from "../../../../../setup/root"
import { isTipTapEmpty } from "../../../../../utils/utility-functions"
import { CalloutBanner } from "../../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { ExplainerModal } from "../../explainer-modal"

const LOCAL_CONTEXT_ITEM_KEYS = ["bylaws", "documents", "links", "fees", "steps"] as const

export const JurisdictionPermitApplicationInfoScreen = observer(function JurisdictionPermitApplicationInfoScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const jurisdiction = userStore.currentUser?.jurisdiction
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const modal = useDisclosure()
  const [localContextHtml, setLocalContextHtml] = useState("")
  const [explainerPublished, setExplainerPublished] = useState(false)
  const [loadingLocalContext, setLoadingLocalContext] = useState(true)

  useEffect(() => {
    if (!templateVersion || !jurisdiction) return
    let cancelled = false
    setLoadingLocalContext(true)
    templateVersion
      .fetchExplainer()
      .then(async (result) => {
        if (cancelled) return
        const published = Boolean(result?.explainer?.publishedAt)
        setExplainerPublished(published)
        if (!published) {
          setLocalContextHtml("")
          setLoadingLocalContext(false)
          return
        }
        const saved = await templateVersion.fetchJurisdictionExplainer(jurisdiction.id)
        if (cancelled) return
        setLocalContextHtml(saved?.localContextHtml ?? "")
        setLoadingLocalContext(false)
      })
      .catch(() => {
        if (!cancelled) {
          setExplainerPublished(false)
          setLoadingLocalContext(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [templateVersion, jurisdiction?.id])

  if (!jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (templateVersionError) return <ErrorScreen error={templateVersionError} />
  if (!templateVersion) return <LoadingScreen />

  const hasLocalContext = !isTipTapEmpty(localContextHtml)

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
          <Text>{t("digitalBuildingPermits.applicationInfo.description")}</Text>
        </Box>

        {loadingLocalContext ? (
          <LoadingScreen />
        ) : explainerPublished ? (
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
              <Text mb={6}>{t("digitalBuildingPermits.applicationInfo.writeOwn")}</Text>
              <Button variant="primary" onClick={modal.onOpen}>
                {hasLocalContext
                  ? t("digitalBuildingPermits.applicationInfo.editButton")
                  : t("digitalBuildingPermits.applicationInfo.addButton")}
              </Button>
            </Box>
          </>
        ) : (
          <CalloutBanner type="info" title={t("digitalBuildingPermits.applicationInfo.unpublishedNote")} my={0} />
        )}
      </Flex>

      {explainerPublished && (
        <ExplainerModal
          templateVersion={templateVersion}
          jurisdictionId={jurisdiction.id}
          mode="reviewManager"
          isOpen={modal.isOpen}
          onClose={modal.onClose}
          onLocalContextSaved={setLocalContextHtml}
        />
      )}
    </Container>
  )
})
