import { Center, Flex, FormLabel, Hide, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../hooks/resources/use-part-3-step-code"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { NotFoundScreen } from "../../../shared/base/not-found-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { ProjectInformation } from "../project-information"
import { FormSection } from "./form-section"
import { Sidebar } from "./sidebar"
import { defaultSectionCompletionStatus } from "./sidebar/nav-sections"
import { SideBarDrawer } from "./sidebar/side-bar-drawer"

export const Part3StepCodeForm = observer(function Part3StepCodeForm() {
  const { permitApplicationId, section, stepCodeId } = useParams()
  const {
    stepCodeStore: { createPart3StepCode },
  } = useMst()
  const { currentStepCode } = usePart3StepCode()
  const isStandaloneStepCode = !permitApplicationId

  const { currentPermitApplication } = usePermitApplication()

  useEffect(() => {
    if (stepCodeId) return // Step Code was already created in the previous screen
    if (!!currentStepCode) return // Step Code already exists
    if (!isStandaloneStepCode && !currentPermitApplication?.isFullyLoaded) return // wait for permit application to load

    if (!currentStepCode) {
      // HUB-5145: Permit-linked Part 3 entry auto-creates the StepCode report
      // family and its pre-construction checklist. Later, expose staged
      // checklist creation/selection through StepCode.currentStage.
      createPart3StepCode({
        permitApplicationId, // nil when the Step Code is not attached to a permit application
        preConstructionChecklistAttributes: { sectionCompletionStatus: defaultSectionCompletionStatus },
      })
    }
  }, [currentPermitApplication?.isFullyLoaded, currentStepCode])

  // ensure scroll resets on section change at the container level
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
        {currentStepCode && !section && (
          <Flex flex={1} overflow="auto" id="stepCodeScroll" px={6} py={10}>
            <Flex direction="column" flex={1} maxW="780px" mx="auto" w="full">
              <FloatingHelpDrawer />
              <ProjectInformation
                currentStepCode={currentStepCode}
                defaultSectionCompletionStatus={defaultSectionCompletionStatus}
                stepCodeKind="part3"
              />
            </Flex>
          </Flex>
        )}
        {currentStepCode && section && (
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
        )}
      </Suspense>
    </Flex>
  )
})

// base styles for Step Code form
FormLabel.defaultProps = { fontWeight: "bold" }
