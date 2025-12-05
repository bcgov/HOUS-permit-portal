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
import { CaretLeft, Info, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { IActivity, IPermitType } from "../../../models/permit-classification"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPermitClassificationCode } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import ProjectInfoRow from "../../shared/project/project-info-row"
import { Can } from "../../shared/user/can"
import { NewPermitApplicationSandboxSelect } from "../permit-application/new-permit-application-sandbox-select"

export const AddPermitApplicationToProjectScreen = observer(() => {
  const { t } = useTranslation()
  const { currentPermitProject, error } = usePermitProject()
  const navigate = useNavigate()
  const { permitClassificationStore } = useMst()

  const [permitType, setPermitType] = useState<IPermitType | null>(null)
  const [activityOptions, setActivityOptions] = useState<IOption<IActivity>[]>([])
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [query, setQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isFirstNation = currentPermitProject?.jurisdiction?.firstNation

  // Load default permit type (low_residential) and then its activities
  useEffect(() => {
    ;(async () => {
      if (!currentPermitProject) return

      // Default hidden selections
      const permitTypeOptions = await permitClassificationStore.fetchPermitTypeOptions(true, isFirstNation, null, null)
      const lowRes = permitTypeOptions.find((o) => o.value.code === EPermitClassificationCode.lowResidential)?.value
      if (lowRes) {
        setPermitType(lowRes)
        const activityOptions = await permitClassificationStore.fetchActivityOptions(true, isFirstNation, lowRes.id)
        setActivityOptions(activityOptions)
      }
    })()
  }, [permitClassificationStore, currentPermitProject?.id])

  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activityOptions
    return activityOptions.filter((opt) => {
      const name = opt.value.name?.toLowerCase() || ""
      const desc = opt.value.descriptionHtml?.toLowerCase() || ""
      return name.includes(q) || desc.includes(q)
    })
  }, [activityOptions, query])

  const groupedActivities = useMemo(() => {
    const groups = R.groupBy<IOption<IActivity>>((opt) => opt.value.category || "", filteredActivities)
    const order = Object.keys(groups)
    return order.map((k) => {
      const options = groups[k]
      const label = options[0]?.value?.categoryLabel || ""
      return { key: k, label, options }
    })
  }, [filteredActivities])

  const toggleSelection = (activityId: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(activityId) ? prev.filter((id) => id !== activityId) : [...prev, activityId]
    )
  }

  const onSubmit = async () => {
    if (!permitType || !currentPermitProject) return

    try {
      setIsSubmitting(true)
      const params = selectedActivityIds.map((activityId) => ({
        activityId,
        permitTypeId: permitType.id,
        firstNations: isFirstNation,
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
    setSelectedActivityIds([])
  }

  if (error) return <ErrorScreen error={error} />

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

        {currentPermitProject?.jurisdiction?.sandboxOptions && (
          <Can action="jurisdiction:create">
            <Box w={{ base: "full", md: "50%" }}>
              <Flex
                gap={4}
                borderRadius="lg"
                border="1px solid"
                borderColor="semantic.special"
                background="semantic.specialLight"
                p={6}
              >
                <Info />
                <Flex direction="column">
                  <Heading>{t("sandbox.switch.superAdminAvailable")}</Heading>
                  <Text mb={4}>{t("sandbox.switch.testingPurposes")}</Text>

                  <NewPermitApplicationSandboxSelect options={currentPermitProject.jurisdiction?.sandboxOptions} />
                </Flex>
              </Flex>
            </Box>
          </Can>
        )}

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

          {/* Action controls above the activity list */}
          <Flex w="full" gap={4} mb={4}>
            <Button variant="secondary" onClick={clearSelection} isDisabled={selectedActivityIds.length === 0}>
              {t("ui.clearSelection")}
            </Button>
            <AddPermitsFAB
              onClick={onSubmit}
              count={selectedActivityIds.length}
              disabled={isSubmitting || selectedActivityIds.length === 0 || !permitType}
              label={t("permitProject.addPermits.title")}
            />
          </Flex>

          {groupedActivities.map((group) => (
            <Box key={group.key} mb={10}>
              <Heading as="h3" fontSize="lg" mb={4}>
                {group.label}
              </Heading>
              <Flex gap={6} wrap="wrap">
                {group.options.map((opt) => {
                  const checked = selectedActivityIds.includes(opt.value.id)
                  return (
                    <Box
                      key={opt.value.id}
                      onClick={() => toggleSelection(opt.value.id)}
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
                            {opt.value.name}
                          </Heading>
                          <SafeTipTapDisplay htmlContent={opt.value.descriptionHtml} />
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
                          <Checkbox
                            isChecked={checked}
                            onChange={() => toggleSelection(opt.value.id)}
                            pointerEvents="none"
                          />
                          <Text fontWeight="medium">{t("permitProject.addPermits.addToProject")}</Text>
                        </Flex>
                      </Flex>
                    </Box>
                  )
                })}
              </Flex>
            </Box>
          ))}

          {/* Action controls below the activity list */}
          <Flex w="full" gap={4} mt={2}>
            <Button variant="secondary" onClick={clearSelection} isDisabled={selectedActivityIds.length === 0}>
              {t("ui.clearSelection")}
            </Button>
            <AddPermitsFAB
              onClick={onSubmit}
              count={selectedActivityIds.length}
              disabled={isSubmitting || selectedActivityIds.length === 0 || !permitType}
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
