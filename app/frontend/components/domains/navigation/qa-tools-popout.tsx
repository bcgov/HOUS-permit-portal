import { Box, Button, Collapse, Flex, FormControl, FormLabel, Heading, Select, Text, VStack } from "@chakra-ui/react"
import { Wrench } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { matchPath, useLocation, useNavigate } from "react-router-dom"
import { IPart9StepCode } from "../../../models/part-9-step-code"
import { useMst, useServerAPI } from "../../../setup/root"
import { EFlashMessageStatus, EStepCodeChecklistStage, EStepCodeType } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { isUUID } from "../../../utils/utility-functions"
import { navLinks as part3NavLinks } from "../step-code/part-3/sidebar/nav-sections"
import { navLinks as part9NavLinks } from "../step-code/part-9/sidebar/nav-sections"

const part3ReportSection = part3NavLinks.at(-1)?.location ?? "report"
const part9ReportSection = part9NavLinks.at(-1)?.location ?? "report"

export const QaToolsPopout = observer(() => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const api = useServerAPI()
  const { permitApplicationStore, stepCodeStore, sessionStore, siteConfigurationStore, uiStore } = useMst()
  const { currentPermitApplication } = permitApplicationStore

  const [isOpen, setIsOpen] = useState(false)
  const [jurisdictionOptions, setJurisdictionOptions] = useState<IOption[]>([])
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState("")
  const [isLoadingJurisdictions, setIsLoadingJurisdictions] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isAutofillingPermit, setIsAutofillingPermit] = useState(false)
  const [isAutofillingPart3, setIsAutofillingPart3] = useState(false)
  const [isAutofillingPart9, setIsAutofillingPart9] = useState(false)

  const permitApplicationEditMatch = matchPath(
    { path: "/permit-applications/:permitApplicationId/edit", end: true },
    location.pathname
  )
  const part3PermitMatch = matchPath(
    { path: "/permit-applications/:permitApplicationId/edit/part-3-step-code/*" },
    location.pathname
  )
  const part3StandaloneMatch =
    matchPath({ path: "/part-3-step-code/:stepCodeId/*" }, location.pathname) ||
    matchPath({ path: "/part-3-step-code/:stepCodeId", end: true }, location.pathname)
  const part9PermitMatch = matchPath(
    { path: "/permit-applications/:permitApplicationId/edit/part-9-step-code/*" },
    location.pathname
  )
  const part9StandaloneMatch =
    matchPath({ path: "/part-9-step-code/:stepCodeId/*" }, location.pathname) ||
    matchPath({ path: "/part-9-step-code/:stepCodeId", end: true }, location.pathname)

  const permitApplicationId =
    permitApplicationEditMatch?.params.permitApplicationId ||
    part3PermitMatch?.params.permitApplicationId ||
    part9PermitMatch?.params.permitApplicationId
  const isPermitApplicationEditOnly = Boolean(permitApplicationEditMatch)
  const isPart3StepCodePath = Boolean(
    part3PermitMatch ||
      part3StandaloneMatch ||
      matchPath({ path: "/part-3-step-code/*" }, location.pathname) ||
      matchPath({ path: "/part-3-step-code", end: true }, location.pathname)
  )
  const isPart9StepCodePath = Boolean(
    part9PermitMatch ||
      part9StandaloneMatch ||
      matchPath({ path: "/part-9-step-code/*" }, location.pathname) ||
      matchPath({ path: "/part-9-step-code", end: true }, location.pathname)
  )
  const part3StepCodeIdFromUrl = part3StandaloneMatch?.params.stepCodeId
  const part3StepCodeIdFromPermit =
    currentPermitApplication?.stepCode?.type === EStepCodeType.part3StepCode
      ? currentPermitApplication?.stepCode?.id
      : undefined
  const part3StepCodeId = isUUID(part3StepCodeIdFromUrl) ? part3StepCodeIdFromUrl : part3StepCodeIdFromPermit
  const part9StepCodeIdFromUrl = part9StandaloneMatch?.params.stepCodeId
  const part9StepCodeIdFromPermit =
    currentPermitApplication?.stepCode?.type === EStepCodeType.part9StepCode
      ? currentPermitApplication?.stepCode?.id
      : undefined
  const part9StepCodeId = isUUID(part9StepCodeIdFromUrl) ? part9StepCodeIdFromUrl : part9StepCodeIdFromPermit

  const stageFromUrl =
    matchPath(
      { path: "/permit-applications/:permitApplicationId/edit/part-3-step-code/stages/:stage/*" },
      location.pathname
    )?.params.stage ||
    matchPath({ path: "/part-3-step-code/:stepCodeId/stages/:stage/*" }, location.pathname)?.params.stage ||
    matchPath(
      { path: "/permit-applications/:permitApplicationId/edit/part-9-step-code/stages/:stage/*" },
      location.pathname
    )?.params.stage ||
    matchPath({ path: "/part-9-step-code/:stepCodeId/stages/:stage/*" }, location.pathname)?.params.stage

  const activeStage =
    (Object.values(EStepCodeChecklistStage).includes(stageFromUrl as EStepCodeChecklistStage)
      ? (stageFromUrl as EStepCodeChecklistStage)
      : undefined) ||
    stepCodeStore.currentStepCode?.currentStage ||
    EStepCodeChecklistStage.preConstruction

  const isProjectsPath = location.pathname === "/projects"
  const isEligible = Boolean(
    import.meta.env.VITE_QA_MODE === "true" && siteConfigurationStore.qaToolsEnabled && sessionStore.loggedIn
  )
  const hasActions = isProjectsPath || isPermitApplicationEditOnly || isPart3StepCodePath || isPart9StepCodePath

  useEffect(() => {
    if (!isEligible || !isProjectsPath || jurisdictionOptions.length > 0) return
    ;(async () => {
      setIsLoadingJurisdictions(true)
      try {
        const response = await api.fetchPermitProjectJurisdictionOptions()
        const options = response.data?.data ?? []
        setJurisdictionOptions(options)
        setSelectedJurisdictionId((current) => current || options[0]?.value || "")
      } finally {
        setIsLoadingJurisdictions(false)
      }
    })()
  }, [api, isEligible, isProjectsPath, jurisdictionOptions.length])

  const selectedJurisdictionLabel = useMemo(() => {
    return jurisdictionOptions.find((option) => option.value === selectedJurisdictionId)?.label
  }, [jurisdictionOptions, selectedJurisdictionId])

  const createFullPermitProject = async () => {
    if (!selectedJurisdictionId) return

    setIsCreatingProject(true)
    const response = await api
      .createQaFullPermitProject({
        jurisdictionId: selectedJurisdictionId,
        title: selectedJurisdictionLabel ? `QA Project - ${selectedJurisdictionLabel}` : undefined,
      })
      .finally(() => setIsCreatingProject(false))

    if (response.ok && response.data?.data?.id) {
      uiStore.flashMessage.show(EFlashMessageStatus.success, null, t("qaTools.createProjectSuccess"), 3000)
      navigate(`/projects/${response.data.data.id}`)
    }
  }

  const autofillPermitApplication = async () => {
    if (!permitApplicationId) return

    setIsAutofillingPermit(true)
    const response = await api
      .autofillQaPermitApplication(permitApplicationId)
      .finally(() => setIsAutofillingPermit(false))

    if (response.ok && response.data?.data) {
      permitApplicationStore.mergeUpdate(response.data.data, "permitApplicationMap")
      uiStore.flashMessage.show(EFlashMessageStatus.success, null, t("qaTools.autofillSuccess"), 3000)
    }
  }

  const autofillPart3StepCode = async () => {
    if (!part3StepCodeId) return

    setIsAutofillingPart3(true)
    const response = await api
      .autofillQaPart3StepCode(part3StepCodeId, { stage: activeStage })
      .finally(() => setIsAutofillingPart3(false))

    if (response.ok && response.data?.data) {
      const autofilledStepCode = response.data.data
      stepCodeStore.mergeUpdate(autofilledStepCode, "stepCodesMap")
      stepCodeStore.setCurrentStepCode(autofilledStepCode.id)
      uiStore.flashMessage.show(EFlashMessageStatus.success, null, t("qaTools.autofillPart3Success"), 3000)

      const summaryPath = autofilledStepCode.permitApplicationId
        ? `/permit-applications/${autofilledStepCode.permitApplicationId}/edit/part-3-step-code/stages/${activeStage}/${part3ReportSection}`
        : `/part-3-step-code/${autofilledStepCode.id}/stages/${activeStage}/${part3ReportSection}`
      navigate(summaryPath)
    }
  }

  const autofillPart9StepCode = async () => {
    if (!part9StepCodeId) return

    setIsAutofillingPart9(true)
    const response = await api
      .autofillQaPart9StepCode(part9StepCodeId, { stage: activeStage })
      .finally(() => setIsAutofillingPart9(false))

    if (response.ok && response.data?.data) {
      const autofilledStepCode = response.data.data
      stepCodeStore.mergeUpdate(autofilledStepCode, "stepCodesMap")
      stepCodeStore.setCurrentStepCode(autofilledStepCode.id)

      const stepCode = stepCodeStore.getStepCode(autofilledStepCode.id) as IPart9StepCode
      const checklist = stepCode?.currentChecklist
      if (checklist) {
        await checklist.load()
      }

      uiStore.flashMessage.show(EFlashMessageStatus.success, null, t("qaTools.autofillPart9Success"), 3000)

      const reportPath = autofilledStepCode.permitApplicationId
        ? `/permit-applications/${autofilledStepCode.permitApplicationId}/edit/part-9-step-code/stages/${activeStage}/${part9ReportSection}`
        : `/part-9-step-code/${autofilledStepCode.id}/stages/${activeStage}/${part9ReportSection}`
      navigate(reportPath)
    }
  }

  if (!isEligible || !hasActions) return null

  return (
    <Box position="fixed" right={0} top="50%" transform="translateY(-50%)" zIndex="tooltip">
      <Flex align="flex-start" direction="row-reverse">
        <Button
          borderLeftRadius={0}
          boxShadow="lg"
          leftIcon={<Wrench />}
          minH={24}
          onClick={() => setIsOpen((current) => !current)}
          size="sm"
          sx={{ writingMode: "vertical-rl" }}
          transform="translateX(0)"
          variant="primary"
        >
          {t("qaTools.trigger")}
        </Button>
        <Collapse in={isOpen} animateOpacity>
          <Box
            bg="white"
            border="1px solid"
            borderColor="border.light"
            borderRight="0"
            boxShadow="lg"
            mr={0}
            p={4}
            w="xs"
          >
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading as="h2" size="sm">
                  {t("qaTools.title")}
                </Heading>
                <Text fontSize="sm">{t("qaTools.description")}</Text>
              </Box>

              {isProjectsPath && (
                <VStack align="stretch" spacing={3}>
                  <FormControl>
                    <FormLabel>{t("qaTools.jurisdiction")}</FormLabel>
                    <Select
                      isDisabled={isLoadingJurisdictions || isCreatingProject}
                      onChange={(event) => setSelectedJurisdictionId(event.target.value)}
                      value={selectedJurisdictionId}
                    >
                      {jurisdictionOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    isDisabled={!selectedJurisdictionId}
                    isLoading={isCreatingProject || isLoadingJurisdictions}
                    onClick={createFullPermitProject}
                    variant="primary"
                  >
                    {t("qaTools.createProject")}
                  </Button>
                </VStack>
              )}

              {isPermitApplicationEditOnly && permitApplicationId && (
                <Button isLoading={isAutofillingPermit} onClick={autofillPermitApplication} variant="primary">
                  {t("qaTools.autofillApplication")}
                </Button>
              )}

              {isPart3StepCodePath && (
                <Button
                  isDisabled={!part3StepCodeId}
                  isLoading={isAutofillingPart3}
                  onClick={autofillPart3StepCode}
                  variant="primary"
                >
                  {t("qaTools.autofillPart3StepCode")}
                </Button>
              )}

              {isPart9StepCodePath && (
                <Button
                  isDisabled={!part9StepCodeId}
                  isLoading={isAutofillingPart9}
                  onClick={autofillPart9StepCode}
                  variant="primary"
                >
                  {t("qaTools.autofillPart9StepCode")}
                </Button>
              )}
            </VStack>
          </Box>
        </Collapse>
      </Flex>
    </Box>
  )
})
