import { Box, Button, Collapse, Flex, FormControl, FormLabel, Heading, Select, Text, VStack } from "@chakra-ui/react"
import { Wrench } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { matchPath, useLocation, useNavigate } from "react-router-dom"
import { useMst, useServerAPI } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"

export const QaToolsPopout = observer(() => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const api = useServerAPI()
  const { permitApplicationStore, sandboxStore, sessionStore, uiStore, userStore } = useMst()

  const { currentUser } = userStore
  const [isOpen, setIsOpen] = useState(false)
  const [jurisdictionOptions, setJurisdictionOptions] = useState<IOption[]>([])
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState("")
  const [isLoadingJurisdictions, setIsLoadingJurisdictions] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isAutofilling, setIsAutofilling] = useState(false)

  const permitApplicationEditMatch = matchPath("/permit-applications/:permitApplicationId/edit", location.pathname)
  const permitApplicationId = permitApplicationEditMatch?.params.permitApplicationId
  const isProjectsPath = location.pathname === "/projects"
  const isEligible = Boolean(
    import.meta.env.VITE_QA_MODE === "true" &&
      sessionStore.loggedIn &&
      currentUser &&
      (currentUser.isSubmitter || currentUser.isReviewStaff)
  )
  const hasActions = isProjectsPath || !!permitApplicationId
  const currentActionRequiresSandbox = Boolean(
    currentUser?.isReviewStaff && !sandboxStore.currentSandboxId && hasActions
  )

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

    setIsAutofilling(true)
    const response = await api.autofillQaPermitApplication(permitApplicationId).finally(() => setIsAutofilling(false))

    if (response.ok && response.data?.data) {
      permitApplicationStore.mergeUpdate(response.data.data, "permitApplicationMap")
      uiStore.flashMessage.show(EFlashMessageStatus.success, null, t("qaTools.autofillSuccess"), 3000)
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

              {currentActionRequiresSandbox && (
                <Text color="semantic.error" fontSize="sm">
                  {t("qaTools.sandboxRequired")}
                </Text>
              )}

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
                    isDisabled={!selectedJurisdictionId || currentActionRequiresSandbox}
                    isLoading={isCreatingProject || isLoadingJurisdictions}
                    onClick={createFullPermitProject}
                    variant="primary"
                  >
                    {t("qaTools.createProject")}
                  </Button>
                </VStack>
              )}

              {permitApplicationId && (
                <Button
                  isDisabled={currentActionRequiresSandbox}
                  isLoading={isAutofilling}
                  onClick={autofillPermitApplication}
                  variant="primary"
                >
                  {t("qaTools.autofillApplication")}
                </Button>
              )}
            </VStack>
          </Box>
        </Collapse>
      </Flex>
    </Box>
  )
})
