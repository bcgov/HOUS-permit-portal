import { Center, Flex, FormLabel, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { useNavigate, useParams } from "react-router-dom"
import { usePreCheck } from "../../../hooks/resources/use-pre-check"
import { useMst } from "../../../setup/root"
import { EPreCheckServicePartner, EPreCheckStatus } from "../../../types/enums"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { FormSection } from "./form-section"
import { Sidebar } from "./sidebar"

export const PreCheckForm = observer(function PreCheckForm() {
  const { section, preCheckId, permitApplicationId } = useParams()
  const navigate = useNavigate()
  const {
    preCheckStore: { createPreCheck },
    siteConfigurationStore,
  } = useMst()
  const { displaySitewideMessage } = siteConfigurationStore
  const { currentPreCheck } = usePreCheck()

  // Create pre-check if this is /new route
  useEffect(() => {
    if (permitApplicationId) return // Handled by usePreCheck
    if (preCheckId) return // Already has an ID, the hook will fetch it
    if (currentPreCheck) return // Already created

    // Create new pre-check with default service partner
    createPreCheck({
      servicePartner: EPreCheckServicePartner.archistar,
    }).then((response) => {
      if (response.ok && response.data) {
        // Redirect to edit route with the new ID
        navigate(`/pre-checks/${response.data.id}/edit/service-partner`, { replace: true })
      }
    })
  }, [preCheckId, currentPreCheck, permitApplicationId])

  // handle redirect if no section is specified
  useEffect(() => {
    if (!section && currentPreCheck) {
      navigate(
        `/pre-checks/${currentPreCheck.id}/edit/${currentPreCheck.status === EPreCheckStatus.complete ? "results-summary" : "service-partner"}`,
        { replace: true }
      )
    }
  }, [section, currentPreCheck])

  // ensure scroll resets on section change at the container level
  useEffect(() => {
    const scroller = document.getElementById("preCheckScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  return (
    <RemoveScroll>
      <Flex
        direction="column"
        h="calc(100vh - var(--app-navbar-height))"
        w="100vw"
        pos="fixed"
        top="var(--app-navbar-height)"
        left="0"
        right="0"
        bottom="0"
        zIndex={0}
        bg="white"
      >
        <Suspense
          fallback={
            <Center p={50}>
              <SharedSpinner />
            </Center>
          }
        >
          <Flex flex={1} w="full" overflow="auto" position="relative">
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
              px={{ base: 0, xl: 20 }}
              py={displaySitewideMessage ? 24 : 10}
              id="preCheckScroll"
            >
              <Flex direction="column" flex={1} px={6} py={3}>
                {currentPreCheck ? <FormSection /> : <LoadingScreen />}
              </Flex>
            </Flex>
          </Flex>
        </Suspense>
      </Flex>
    </RemoveScroll>
  )
})

// base styles for pre-check form
FormLabel.defaultProps = { fontWeight: "bold" }
