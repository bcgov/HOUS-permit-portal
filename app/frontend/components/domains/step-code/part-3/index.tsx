import { Center, Flex, FormLabel, Show } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { useNavigate, useParams } from "react-router-dom"
import { usePart3StepCode } from "../../../../hooks/resources/use-part-3-step-code"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { StepCodeNavBar } from "../nav-bar"
import { Part3NavLinks } from "../nav-bar/part-3-nav-links"
import { FormSection } from "./form-section"
import { Sidebar } from "./sidebar"
import { defaultSectionCompletionStatus } from "./sidebar/nav-sections"

export const Part3StepCodeForm = observer(function Part3StepCodeForm() {
  const { permitApplicationId, section } = useParams()
  const {
    stepCodeStore: { createPart3StepCode },
    permitApplicationStore: { getPermitApplicationById },
  } = useMst()
  const { stepCode } = usePart3StepCode()
  const navigate = useNavigate()
  const isEarlyAccess = !permitApplicationId

  const permitApplication = !isEarlyAccess && getPermitApplicationById(permitApplicationId)

  usePermitApplication()

  // create the step code if needed
  useEffect(() => {
    if (!!stepCode) return // step code already exists
    if (!isEarlyAccess && !permitApplication?.isFullyLoaded) return // wait for permit application to load

    if (!stepCode) {
      createPart3StepCode({
        permitApplicationId, // nil for early access
        checklistAttributes: { sectionCompletionStatus: defaultSectionCompletionStatus },
      })
    }
  }, [permitApplication?.isFullyLoaded, stepCode])

  // handle redirect if no section is specified
  useEffect(() => {
    if (!stepCode) return // wait for step code to load or be created
    if (section) return // only redirect if no section is specified in params

    if (stepCode.checklist) {
      const navLink = stepCode.checklist.currentNavLink
      navigate(navLink?.location || "start")
    } else {
      navigate("start")
    }
  }, [stepCode])

  return (
    <RemoveScroll>
      <Flex
        direction="column"
        h="100vh"
        w="100vw"
        pos="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="modal"
        bg="white"
      >
        <StepCodeNavBar title={t("stepCode.part3.title")} NavLinks={<Part3NavLinks />} />
        <Suspense
          fallback={
            <Center p={50}>
              <SharedSpinner />
            </Center>
          }
        >
          {stepCode && (
            <Flex flex={1} w="full" id="stepCodeScroll" overflow="auto">
              <Show above="lg">
                <Flex
                  w={"sidebar.width"}
                  boxShadow="md"
                  borderRightWidth={1}
                  borderColor="greys.grey02"
                  overflow="auto"
                >
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
                pt={20}
                pb={10}
              >
                <FloatingHelpDrawer top="24" zIndex={1} />
                <Flex direction="column" flex={1} maxW="780px" px={6} py={3}>
                  <FormSection />
                </Flex>
              </Flex>
            </Flex>
          )}
        </Suspense>
      </Flex>
    </RemoveScroll>
  )
})

// base styles for step code form
FormLabel.defaultProps = { fontWeight: "bold" }
