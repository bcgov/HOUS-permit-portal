import { Center, Flex, FormLabel, Hide, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../hooks/resources/use-part-3-step-code"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { NotFoundScreen } from "../../../shared/base/not-found-screen"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
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
  const navigate = useNavigate()
  const isEarlyAccess = !permitApplicationId

  const { currentPermitApplication } = usePermitApplication()

  // create the step code if needed
  useEffect(() => {
    if (stepCodeId) return // step code was already created in the previous screen
    if (!!currentStepCode) return // step code already exists
    if (!isEarlyAccess && !currentPermitApplication?.isFullyLoaded) return // wait for permit application to load

    if (!currentStepCode) {
      createPart3StepCode({
        permitApplicationId, // nil for early access
        checklistAttributes: { sectionCompletionStatus: defaultSectionCompletionStatus },
      })
    }
  }, [currentPermitApplication?.isFullyLoaded, currentStepCode])

  // handle redirect if no section is specified
  useEffect(() => {
    if (!currentStepCode) return // wait for step code to load or be created
    if (section) return // only redirect if no section is specified in params

    if (currentStepCode.checklist) {
      const navLink = currentStepCode.checklist.currentNavLink
      navigate(navLink?.location || "start")
    } else {
      navigate("start")
    }
  }, [currentStepCode])

  // ensure scroll resets on section change at the container level
  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  // Prevent viewing/editing archived step codes
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
        {currentStepCode && (
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

// base styles for step code form
FormLabel.defaultProps = { fontWeight: "bold" }
