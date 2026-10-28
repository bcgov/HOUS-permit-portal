import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight, Download, WarningCircle } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams, useSearchParams } from "react-router-dom"
import { IExplainer } from "../../../../../models/explainer"
import { IJurisdiction } from "../../../../../models/jurisdiction"
import { IExplainerPermit } from "../../../../../models/jurisdiction-explainer"
import { useMst } from "../../../../../setup/root"
import { permitApplicationInfoPath } from "../../../../../utils/permit-application-info-path"
import { isTipTapEmpty, isUUID } from "../../../../../utils/utility-functions"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { NotFoundScreen } from "../../../../shared/base/not-found-screen"
import { SafeTipTapDisplay } from "../../../../shared/editor/safe-tiptap-display"
import { RouterLink } from "../../../../shared/navigation/router-link"
import { FindLocalRequirements } from "../../find-local-requirements"
import { FromYourLocalJurisdiction } from "../../from-your-local-jurisdiction"

export const PermitApplicationInfoScreen = observer(function PermitApplicationInfoScreen() {
  const { t } = useTranslation()
  const { requirementTemplateId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { jurisdictionStore, requirementTemplateStore } = useMst()
  const jurisdictionIdParam = searchParams.get("jurisdictionId")

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [explainer, setExplainer] = useState<IExplainer | null>(null)
  const [permitName, setPermitName] = useState("")
  const [relatedPermits, setRelatedPermits] = useState<IExplainerPermit[]>([])
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction | null>(null)
  const [localContextHtml, setLocalContextHtml] = useState("")
  const [localUpdatedAt, setLocalUpdatedAt] = useState<string | null>(null)

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
    if (!jurisdictionIdParam || !isUUID(jurisdictionIdParam)) {
      setJurisdiction(null)
      return
    }
    let cancelled = false
    jurisdictionStore.fetchJurisdiction(jurisdictionIdParam).then(() => {
      if (!cancelled) setJurisdiction(jurisdictionStore.getJurisdictionById(jurisdictionIdParam) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [jurisdictionIdParam])

  useEffect(() => {
    if (!requirementTemplateId || !jurisdiction?.id) {
      setLocalContextHtml("")
      setLocalUpdatedAt(null)
      return
    }
    let cancelled = false
    setLocalContextHtml("")
    setLocalUpdatedAt(null)
    requirementTemplateStore.fetchJurisdictionExplainer(requirementTemplateId, jurisdiction.id).then((result) => {
      if (cancelled) return
      setLocalContextHtml(result?.localContextHtml ?? "")
      setLocalUpdatedAt(result?.updatedAt ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [requirementTemplateId, jurisdiction?.id])

  const handleJurisdictionChange = (next: IJurisdiction | null) => {
    setJurisdiction(next)
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
        <Heading as="h1" fontSize="4xl" mb={4}>
          {title}
        </Heading>
        <Text fontSize="lg" color="text.secondary">
          {t("requirementTemplate.explainer.publicPage.intro", { name: title })}
        </Text>
      </Container>

      <FindLocalRequirements
        jurisdiction={jurisdiction}
        hasLocalContext={!isTipTapEmpty(localContextHtml)}
        onJurisdictionChange={handleJurisdictionChange}
      />

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

          <FromYourLocalJurisdiction
            html={localContextHtml}
            updatedAt={localUpdatedAt}
            jurisdictionName={jurisdiction?.name || ""}
          />
        </Flex>
      </Container>
    </Box>
  )
})
