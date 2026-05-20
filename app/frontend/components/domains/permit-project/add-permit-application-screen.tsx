import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { CaretLeft, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { ITemplateVersion } from "../../../models/template-version"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import ProjectInfoRow from "../../shared/project/project-info-row"

export const AddPermitApplicationToProjectScreen = observer(() => {
  const { t } = useTranslation()
  const { currentPermitProject, error } = usePermitProject()
  const navigate = useNavigate()
  const {
    templateVersions,
    error: templateError,
    isLoading,
  } = useTemplateVersions({
    customErrorMessage: t("errors.fetchBuildingPermits"),
  })

  const [selectedTemplateVersionIds, setSelectedTemplateVersionIds] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return templateVersions
    return templateVersions.filter((tv) => {
      const nickname = tv.denormalizedTemplateJson?.nickname?.toLowerCase() || ""
      const desc = tv.denormalizedTemplateJson?.description?.toLowerCase() || ""
      const tags = (tv.denormalizedTemplateJson?.tags || tv.tags || []).join(" ").toLowerCase()
      return nickname.includes(q) || desc.includes(q) || tags.includes(q)
    })
  }, [templateVersions, query])

  const toggleSelection = (templateVersionId: string) => {
    setSelectedTemplateVersionIds((prev) =>
      prev.includes(templateVersionId) ? prev.filter((id) => id !== templateVersionId) : [...prev, templateVersionId]
    )
  }

  const onSubmit = async () => {
    if (!currentPermitProject) return

    try {
      setIsSubmitting(true)
      const params = selectedTemplateVersionIds.map((templateVersionId) => ({
        templateVersionId,
        jurisdictionId: currentPermitProject.jurisdiction?.id,
      }))
      const response = await (currentPermitProject as any).bulkCreatePermitApplications(params)
      if (response?.ok) {
        currentPermitProject.resetIsFullyLoaded()
        navigate(`/projects/${currentPermitProject.id}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearSelection = () => {
    setSelectedTemplateVersionIds([])
  }

  if (error) return <ErrorScreen error={error} />
  if (templateError) return <ErrorScreen error={templateError} />

  return (
    <Container maxW="container.lg" py={10}>
      <Flex direction="column" gap={6}>
        <RouterLinkButton
          variant="link"
          to={`/projects/${currentPermitProject?.id}`}
          leftIcon={<CaretLeft size={24} />}
        >
          {t("permitProject.backToProject")}
        </RouterLinkButton>
        <Heading>{t("permitProject.addPermits.title")}</Heading>
      </Flex>

      {/* Before you begin */}

      <Flex as="section" direction="column" gap={4} mb={8}>
        <Box w={{ base: "full", md: "50%" }}>
          <Heading as="h2" variant="yellowline">
            {t("permitProject.addPermits.beforeYouBegin.heading")}
          </Heading>

          <Text>{t("permitProject.addPermits.beforeYouBegin.intro")}</Text>

          <UnorderedList ml="0" spacing={2}>
            <ListItem>{t("permitProject.addPermits.beforeYouBegin.bcBuildingCode")}</ListItem>
            <ListItem>{t("permitProject.addPermits.beforeYouBegin.localZoningBylaws")}</ListItem>
            <ListItem>{t("permitProject.addPermits.beforeYouBegin.ocp")}</ListItem>
            <ListItem>{t("permitProject.addPermits.beforeYouBegin.dpaRules")}</ListItem>
          </UnorderedList>

          <Text>
            {t("permitProject.addPermits.beforeYouBegin.moreInfo")}{" "}
            <RouterLinkButton variant="link" to="/jurisdictions">
              {t("permitProject.addPermits.beforeYouBegin.findYourLocalJurisdiction")}
            </RouterLinkButton>
          </Text>
        </Box>

        <Box w={{ base: "full", md: "50%" }}>
          <Heading as="h2" variant="yellowline">
            {(t as any)("permitProject.addPermits.about.heading")}
          </Heading>
          <Text mb={2}>{(t as any)("permitProject.addPermits.about.p1")}</Text>
          <Text>{(t as any)("permitProject.addPermits.about.p2")}</Text>
        </Box>

        <Box w={{ base: "full", md: "50%" }}>
          <Heading as="h2" variant="yellowline">
            {t("permitProject.addPermits.projectInformation.heading")}
          </Heading>

          <Flex direction="column" mt={4}>
            <ProjectInfoRow
              label={t("permitProject.addPermits.projectInformation.title")}
              value={currentPermitProject?.title}
              isBold
            />
            <ProjectInfoRow
              label={t("permitProject.addPermits.projectInformation.address")}
              value={currentPermitProject?.fullAddress}
            />
            <ProjectInfoRow
              label={t("permitProject.addPermits.projectInformation.pid")}
              subLabel={t("permitProject.overview.parcelIdentifier")}
              value={currentPermitProject?.pid}
            />
          </Flex>
        </Box>

        <Box>
          <Heading as="h2" variant="yellowline">
            {t("permitProject.addPermits.permits.heading")}
          </Heading>

          <CustomMessageBox
            status={EFlashMessageStatus.info}
            title={t("permitProject.addPermits.bcbcPartHeading")}
            description={t("permitProject.addPermits.bcbcPart")}
            mb={6}
          />

          {/* Search bar */}
          <InputGroup mb={6} maxW="full">
            <InputLeftElement pointerEvents="none">
              <MagnifyingGlass />
            </InputLeftElement>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ui.search")} bg="white" />
          </InputGroup>

          {/* Action controls above the template list */}
          <Flex w="full" gap={4} mb={4}>
            <Button variant="secondary" onClick={clearSelection} isDisabled={selectedTemplateVersionIds.length === 0}>
              {t("ui.clearSelection")}
            </Button>
            <AddPermitsFAB
              onClick={onSubmit}
              count={selectedTemplateVersionIds.length}
              disabled={isSubmitting || selectedTemplateVersionIds.length === 0 || isLoading}
              label={t("permitProject.addPermits.title")}
            />
          </Flex>

          {isLoading ? (
            <Text color="text.secondary">{t("ui.loading")}</Text>
          ) : (
            <Flex gap={6} wrap="wrap">
              {filteredTemplates.map((tv: ITemplateVersion) => {
                const checked = selectedTemplateVersionIds.includes(tv.id)
                return (
                  <Box
                    key={tv.id}
                    onClick={() => toggleSelection(tv.id)}
                    borderRadius="lg"
                    p={6}
                    border="1px solid"
                    borderColor={checked ? "theme.blueAlt" : "border.light"}
                    bg="white"
                    w={{ base: "100%", md: "48%" }}
                    transition="all 0.2s ease-in-out"
                    _hover={{ bg: "hover.blue" }}
                    cursor="pointer"
                  >
                    <Flex direction="column" justify="space-between" align="start" gap={4}>
                      <Box>
                        <Heading as="h3" fontSize="lg" mb={2}>
                          {tv.denormalizedTemplateJson?.nickname || tv.label}
                        </Heading>
                        <Text fontSize="sm" color="text.secondary">
                          {tv.denormalizedTemplateJson?.description}
                        </Text>
                      </Box>
                      <Flex
                        align="center"
                        gap={2}
                        border="1px solid"
                        borderColor={checked ? "theme.blueAlt" : "border.light"}
                        bg="white"
                        px={4}
                        py={2}
                        borderRadius="md"
                        alignSelf="flex-end"
                      >
                        <Checkbox isChecked={checked} onChange={() => toggleSelection(tv.id)} pointerEvents="none" />
                        <Text fontWeight="medium">{t("permitProject.addPermits.addToProject")}</Text>
                      </Flex>
                    </Flex>
                  </Box>
                )
              })}
            </Flex>
          )}

          {/* Action controls below the template list */}
          <Flex w="full" gap={4} mt={2}>
            <Button variant="secondary" onClick={clearSelection} isDisabled={selectedTemplateVersionIds.length === 0}>
              {t("ui.clearSelection")}
            </Button>
            <AddPermitsFAB
              onClick={onSubmit}
              count={selectedTemplateVersionIds.length}
              disabled={isSubmitting || selectedTemplateVersionIds.length === 0 || isLoading}
              label={t("permitProject.addPermits.title")}
            />
          </Flex>
        </Box>
      </Flex>
    </Container>
  )
})

interface IAddPermitsFABProps {
  label: string
  count: number
  disabled?: boolean
  onClick: () => void
}

const AddPermitsFAB = ({ label, count, disabled, onClick }: IAddPermitsFABProps) => {
  return (
    <Button
      onClick={onClick}
      isDisabled={disabled}
      bg="theme.blue"
      color="white"
      _hover={{ bg: "theme.blueAlt" }}
      _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
      borderRadius="md"
      px={6}
      h={10}
      display="inline-flex"
      alignItems="center"
      gap={3}
    >
      <Text>{label}</Text>
      <Flex as="span" align="center" justify="center" w={8} h={8} borderRadius="full" bg="rgba(255,255,255,0.25)">
        <Text fontWeight="bold">{count}</Text>
      </Flex>
    </Button>
  )
}
