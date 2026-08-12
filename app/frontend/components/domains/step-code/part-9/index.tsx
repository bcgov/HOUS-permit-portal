import { Center, Flex, FormLabel, Hide, Show, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { NotFoundScreen } from "../../../shared/base/not-found-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { ProjectInformation } from "../project-information"
import { DrawingsWarning } from "./drawings-warning"
import { FormSection } from "./form-section"
import { Info } from "./info"
import { Sidebar } from "./sidebar"
import { defaultSectionCompletionStatus } from "./sidebar/nav-sections"
import { SideBarDrawer } from "./sidebar/side-bar-drawer"
import { Title } from "./title"

export const Part9StepCodeForm = observer(function Part9StepCodeForm() {
  const {
    stepCodeStore: { createPart9StepCode, isOptionsLoaded, fetchPart9SelectOptions },
  } = useMst()
  const { currentStepCode } = usePart9StepCode()
  const { currentPermitApplication } = usePermitApplication()
  const { permitApplicationId, section, stepCodeId } = useParams()
  const isStandaloneStepCode = !permitApplicationId
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => await fetchPart9SelectOptions()
    !isOptionsLoaded && fetch()
  }, [isOptionsLoaded])

  useEffect(() => {
    if (stepCodeId) return
    if (!!currentStepCode) return
    if (!isStandaloneStepCode && !currentPermitApplication?.isFullyLoaded) return
    ;(async () => {
      const result = await createPart9StepCode({
        permitApplicationId,
        preConstructionChecklistAttributes: { sectionCompletionStatus: defaultSectionCompletionStatus },
      })
      if (!result?.ok) {
        setCreateError(Array.isArray(result?.error) ? result.error.join(", ") : String(result?.error || ""))
      }
    })()
  }, [currentPermitApplication?.isFullyLoaded, currentStepCode])

  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  // Prevent viewing/editing archived Step Codes
  if (currentStepCode?.isDiscarded) return <NotFoundScreen />

  return (
    <Flex direction="column" h="calc(100vh - var(--app-navbar-height))" w="full" bg="white">
      <Suspense
        fallback={
          <Center p={50}>
            <SharedSpinner />
          </Center>
        }
      >
        {createError && !currentStepCode ? (
          <Center flex={1} p={6}>
            <VStack spacing={8} align="start" maxW="780px" w="full">
              <Title />
              <Info />
              {permitApplicationId && <DrawingsWarning />}
              <CustomMessageBox
                status={EFlashMessageStatus.error}
                title="Part 9 Step Code could not be started"
                description={createError}
              />
            </VStack>
          </Center>
        ) : isOptionsLoaded && currentStepCode && !section ? (
          <Flex flex={1} overflow="auto" id="stepCodeScroll" px={6} py={10}>
            <Flex direction="column" flex={1} maxW="780px" mx="auto" w="full">
              <FloatingHelpDrawer />
              <ProjectInformation
                currentStepCode={currentStepCode}
                defaultSectionCompletionStatus={defaultSectionCompletionStatus}
                stepCodeKind="part9"
              />
            </Flex>
          </Flex>
        ) : isOptionsLoaded && currentStepCode && section ? (
          <Flex flex={1} w="full" overflow="hidden" position="relative">
            <Show above="lg">
              <Flex w={"sidebar.width"} boxShadow="md" borderRightWidth={1} borderColor="greys.grey02" overflow="auto">
                <Sidebar />
              </Flex>
            </Show>
            <Flex
              direction="column"
              flex={1}
              pos="sticky"
              overflow="auto"
              top={0}
              pl={{ base: 0, xl: 20 }}
              pt={10}
              pb={10}
              id="stepCodeScroll"
            >
              <Hide above="lg">
                <SideBarDrawer triggerProps={{ ml: 6, size: "md" }} />
              </Hide>

              <FloatingHelpDrawer />
              <Flex direction="column" flex={1} maxW="780px" px={6} py={3}>
                <FormSection />
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Center p={50}>
            <SharedSpinner />
          </Center>
        )}
      </Suspense>
    </Flex>
  )
})

FormLabel.defaultProps = { fontWeight: "bold" }
