import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react"
import { ArrowSquareOut, CaretLeft, CaretRight, Download, WarningCircle } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useParams, useSearchParams } from "react-router-dom"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IExplainer } from "../../../../../models/explainer"
import { IJurisdiction } from "../../../../../models/jurisdiction"
import { IExplainerPermit } from "../../../../../models/jurisdiction-explainer"
import { useMst } from "../../../../../setup/root"
import { permitApplicationInfoPath } from "../../../../../utils/permit-application-info-path"
import { isTipTapEmpty, isUUID } from "../../../../../utils/utility-functions"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { NotFoundScreen } from "../../../../shared/base/not-found-screen"
import { SafeTipTapDisplay } from "../../../../shared/editor/safe-tiptap-display"
import { RouterLink } from "../../../../shared/navigation/router-link"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { FindLocalRequirements } from "../../find-local-requirements"
import { FromYourLocalJurisdiction, LOCAL_COMMUNITY_SECTION_ID } from "../../from-your-local-jurisdiction"
import { LocalContextEditor } from "../../local-context-editor"

export const PermitApplicationInfoScreen = observer(function PermitApplicationInfoScreen({
  requirementTemplateId: requirementTemplateIdProp,
  lockedJurisdiction,
  editLocalContext = false,
  backTo,
}: {
  requirementTemplateId?: string
  lockedJurisdiction?: IJurisdiction
  editLocalContext?: boolean
  backTo?: string
} = {}) {
  const { t } = useTranslation()
  const { requirementTemplateId: requirementTemplateIdParam } = useParams()
  const requirementTemplateId = requirementTemplateIdProp ?? requirementTemplateIdParam
  const [searchParams, setSearchParams] = useSearchParams()
  const { jurisdictionStore, requirementTemplateStore } = useMst()
  const jurisdictionIdParam = lockedJurisdiction?.id ?? searchParams.get("jurisdictionId")

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [explainer, setExplainer] = useState<IExplainer | null>(null)
  const [permitName, setPermitName] = useState("")
  const [relatedPermits, setRelatedPermits] = useState<IExplainerPermit[]>([])
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<IJurisdiction | null>(null)
  const jurisdiction = lockedJurisdiction ?? selectedJurisdiction
  const [localContextHtml, setLocalContextHtml] = useState("")
  const [localUpdatedAt, setLocalUpdatedAt] = useState<string | null>(null)
  const [draftHtml, setDraftHtml] = useState("")
  const [savingLocalContext, setSavingLocalContext] = useState(false)

  useEffect(() => {
    if (!requirementTemplateId || !isUUID(requirementTemplateId)) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    requirementTemplateStore
      .fetchExplainer(requirementTemplateId)
      .then((result) => {
        if (cancelled) return
        if (!result?.explainer) {
          setNotFound(true)
          setLoading(false)
          return
        }
        setExplainer(result.explainer)
        setPermitName(result.permit?.nickname || "")
        setRelatedPermits(result.relatedPermits ?? [])
        setNotFound(false)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setNotFound(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [requirementTemplateId])

  useEffect(() => {
    if (lockedJurisdiction) return
    if (!jurisdictionIdParam || !isUUID(jurisdictionIdParam)) {
      setSelectedJurisdiction(null)
      return
    }
    let cancelled = false
    jurisdictionStore.fetchJurisdiction(jurisdictionIdParam).then(() => {
      if (!cancelled) setSelectedJurisdiction(jurisdictionStore.getJurisdictionById(jurisdictionIdParam) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [jurisdictionIdParam, lockedJurisdiction])

  useEffect(() => {
    if (!requirementTemplateId || !jurisdiction?.id) {
      setLocalContextHtml("")
      setDraftHtml("")
      setLocalUpdatedAt(null)
      return
    }
    let cancelled = false
    setLocalContextHtml("")
    setDraftHtml("")
    setLocalUpdatedAt(null)
    requirementTemplateStore.fetchJurisdictionExplainer(requirementTemplateId, jurisdiction.id).then((result) => {
      if (cancelled) return
      const html = result?.localContextHtml ?? ""
      setLocalContextHtml(html)
      setDraftHtml(html)
      setLocalUpdatedAt(result?.updatedAt ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [requirementTemplateId, jurisdiction?.id])

  const handleJurisdictionChange = (next: IJurisdiction | null) => {
    setSelectedJurisdiction(next)
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        if (next?.id) params.set("jurisdictionId", next.id)
        else params.delete("jurisdictionId")
        return params
      },
      { replace: true }
    )
  }

  useEffect(() => {
    if (!editLocalContext || loading || !explainer || !jurisdiction) return
    document.getElementById(LOCAL_COMMUNITY_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [editLocalContext, loading, explainer, jurisdiction?.id])

  const saveLocalContext = async () => {
    if (!requirementTemplateId || !jurisdiction?.id) return
    setSavingLocalContext(true)
    try {
      const result = await requirementTemplateStore.saveJurisdictionExplainer(
        requirementTemplateId,
        jurisdiction.id,
        draftHtml
      )
      if (!result) return
      setLocalContextHtml(result.localContextHtml)
      setDraftHtml(result.localContextHtml)
      setLocalUpdatedAt(result.updatedAt)
    } finally {
      setSavingLocalContext(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (notFound || !explainer) return <NotFoundScreen />

  const title = permitName || t("requirementTemplate.explainer.publicPage.fallbackTitle")
  const documents = explainer.documents.filter((document) => document.file)
  const steps = explainer.steps.filter((step) => step.title || step.description)
  const links = explainer.links.filter((link) => link.url)
  const showAbout = !isTipTapEmpty(explainer.introductionHtml)
  const showBeforeYouBegin = !isTipTapEmpty(explainer.beforeYouApplyHtml)
  const showWhatToExpect = steps.length > 0
  const showResources = documents.length > 0 || links.length > 0
  const showRelated = relatedPermits.length > 0

  return (
    <Box as="main" bg="greys.white" minH="calc(100vh - 200px)">
      <Container maxW="container.lg" px={{ base: 6, md: 8 }} pt={6} pb={4}>
        {backTo ? (
          <RouterLinkButton variant="link" to={backTo} leftIcon={<CaretLeft size={20} />} mb={4}>
            {t("ui.back")}
          </RouterLinkButton>
        ) : (
          <Breadcrumb separator="/" spacing={2} mb={4}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/" color="text.link">
                {t("site.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text fontWeight="bold">{title}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
        )}
        <Heading as="h1" fontSize="4xl" mb={4}>
          {title}
        </Heading>
        <Text fontSize="lg" color="text.secondary">
          {t("requirementTemplate.explainer.publicPage.intro", { name: title })}
        </Text>
      </Container>

      {!editLocalContext && (
        <FindLocalRequirements
          jurisdiction={jurisdiction}
          hasLocalContext={!isTipTapEmpty(localContextHtml)}
          onJurisdictionChange={handleJurisdictionChange}
        />
      )}

      <Container maxW="container.lg" px={{ base: 6, md: 8 }} py={8}>
        <Flex direction="column" gap={9}>
          {showAbout && (
            <Box as="section">
              <Heading as="h2" variant="yellowline" mt={0} fontSize="2xl" mb={4}>
                {t("requirementTemplate.explainer.publicPage.aboutThisPermit")}
              </Heading>
              <SafeTipTapDisplay htmlContent={explainer.introductionHtml} />
            </Box>
          )}

          {showBeforeYouBegin && (
            <Box as="section">
              <Heading as="h2" fontSize="xl" mb={4}>
                {t("requirementTemplate.explainer.publicPage.beforeYouBegin")}
              </Heading>
              <SafeTipTapDisplay htmlContent={explainer.beforeYouApplyHtml} />
            </Box>
          )}

          {showWhatToExpect && (
            <Box as="section">
              <Heading as="h2" fontSize="xl" mb={2}>
                {t("requirementTemplate.explainer.publicPage.whatToExpect")}
              </Heading>
              <Flex direction="column">
                {steps.map((step, index) => (
                  <Flex key={`${step.title}-${index}`} gap={4} py={4} align="flex-start">
                    <Text fontWeight="bold">{index + 1}.</Text>
                    <Box>
                      {step.title && <Text fontWeight="bold">{step.title}</Text>}
                      {step.description && (
                        <Text color="text.secondary" mt={step.title ? 1 : 0}>
                          {step.description}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </Box>
          )}

          {showResources && (
            <Box as="section">
              <Heading as="h2" fontSize="2xl" mb={2}>
                {t("requirementTemplate.explainer.publicPage.resources")}
              </Heading>
              <Text mb={4}>{t("requirementTemplate.explainer.publicPage.resourcesIntro")}</Text>
              <Flex direction="column" gap={4} maxW="lg">
                {documents.map((document) =>
                  document.downloadUrl ? (
                    <Link
                      key={document.id}
                      href={document.downloadUrl}
                      isExternal
                      rel="noopener noreferrer"
                      color="text.link"
                      textDecoration="underline"
                      display="inline-flex"
                      alignItems="center"
                      gap={2}
                      w="fit-content"
                    >
                      {document.file?.metadata?.filename}
                      <Download size={16} />
                    </Link>
                  ) : (
                    <Text
                      key={document.id}
                      color="greys.grey01"
                      fontSize="sm"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                    >
                      <WarningCircle size={16} />
                      {t("ui.fileUnavailable")}
                    </Text>
                  )
                )}
                {links.map((link) => (
                  <Link
                    key={`${link.url}-${link.title}`}
                    href={link.url}
                    isExternal
                    rel="noopener noreferrer"
                    color="text.link"
                    textDecoration="underline"
                    display="inline-flex"
                    alignItems="center"
                    gap={2}
                    w="fit-content"
                  >
                    {link.title}
                    <ArrowSquareOut size={16} />
                  </Link>
                ))}
              </Flex>
            </Box>
          )}

          {showRelated && (
            <Box as="section">
              <Heading as="h2" fontSize="2xl" mb={5}>
                {t("requirementTemplate.explainer.publicPage.relatedPermits")}
              </Heading>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }} gap={6}>
                {relatedPermits.map((permit) => (
                  <Flex
                    key={permit.id}
                    direction="column"
                    justify="space-between"
                    border="1px solid"
                    borderColor="border.light"
                    borderRadius="md"
                    p={6}
                    minH="180px"
                    bg="white"
                    gap={4}
                  >
                    <Box>
                      <Heading as="h3" fontSize="lg" mb={3}>
                        {permit.nickname}
                      </Heading>
                      {permit.description && (
                        <Text fontSize="sm" color="text.secondary">
                          {permit.description}
                        </Text>
                      )}
                    </Box>
                    <Link
                      href={permitApplicationInfoPath(permit.id, jurisdiction?.id)}
                      isExternal
                      color="text.link"
                      display="inline-flex"
                      alignItems="center"
                      gap="2px"
                      alignSelf="flex-end"
                    >
                      {t("requirementTemplate.explainer.publicPage.viewInformation")}
                      <CaretRight size={20} />
                    </Link>
                  </Flex>
                ))}
              </Grid>
            </Box>
          )}

          {editLocalContext && jurisdiction ? (
            <FromYourLocalJurisdiction
              html={localContextHtml}
              updatedAt={localUpdatedAt}
              jurisdictionName={jurisdiction.name}
            >
              <LocalContextEditor htmlValue={draftHtml} onChange={setDraftHtml} />
              <Button mt={4} variant="primary" onClick={saveLocalContext} isLoading={savingLocalContext}>
                {t("ui.onlySave")}
              </Button>
            </FromYourLocalJurisdiction>
          ) : (
            <FromYourLocalJurisdiction
              html={localContextHtml}
              updatedAt={localUpdatedAt}
              jurisdictionName={jurisdiction?.name || ""}
            />
          )}
        </Flex>
      </Container>
    </Box>
  )
})

export const JurisdictionPermitApplicationInfoEditScreen = observer(
  function JurisdictionPermitApplicationInfoEditScreen() {
    const { t } = useTranslation()
    const { userStore, sandboxStore } = useMst()
    const jurisdiction = userStore.currentUser?.jurisdiction
    const { isSandboxActive } = sandboxStore
    const { templateVersion, error: templateVersionError } = useTemplateVersion({
      customErrorMessage: t("errors.fetchBuildingPermit"),
    })

    if (!jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
    if (templateVersionError) return <ErrorScreen error={templateVersionError} />
    if (!templateVersion) return <LoadingScreen />
    if (!templateVersion.explainerPublished || isSandboxActive) {
      return <Navigate to={`/digital-building-permits/${templateVersion.id}/application-info`} replace />
    }

    return (
      <PermitApplicationInfoScreen
        requirementTemplateId={templateVersion.requirementTemplateId}
        lockedJurisdiction={jurisdiction}
        editLocalContext
        backTo={`/digital-building-permits/${templateVersion.id}/application-info`}
      />
    )
  }
)
