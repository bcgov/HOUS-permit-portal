import { Center, Flex, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { useNavigate, useParams } from "react-router-dom"
import { useOverheatingCode } from "../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../setup/root"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { FormSection } from "./form-section"
import { Sidebar } from "./sidebar"

export const OverheatingCodeForm = observer(function OverheatingCodeForm() {
  const { section, overheatingCodeId } = useParams()
  const navigate = useNavigate()
  const {
    overheatingCodeStore: { createOverheatingCode },
    siteConfigurationStore,
    sandboxStore,
    userStore,
  } = useMst()
  const { displaySitewideMessage } = siteConfigurationStore
  const hasSandboxBanner = userStore.currentUser?.isReviewStaff && sandboxStore.isSandboxActive
  const { currentOverheatingCode } = useOverheatingCode()

  // Create overheating code if this is /new route
  useEffect(() => {
    if (overheatingCodeId) return
    if (currentOverheatingCode) return

    createOverheatingCode({}).then((response) => {
      if (response.ok && response.data) {
        navigate(`/overheating-codes/${response.data.id}/edit/introduction`, { replace: true })
      }
    })
  }, [overheatingCodeId, currentOverheatingCode])

  // Handle redirect if no section is specified
  useEffect(() => {
    if (!section && currentOverheatingCode) {
      navigate(`/overheating-codes/${currentOverheatingCode.id}/edit/introduction`, { replace: true })
    }
  }, [section, currentOverheatingCode])

  // Ensure scroll resets on section change
  useEffect(() => {
    const scroller = document.getElementById("overheatingCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  return (
    <RemoveScroll>
      <Flex
        direction="column"
        h={
          hasSandboxBanner ? "calc(100vh - var(--app-navbar-height) - 24px)" : "calc(100vh - var(--app-navbar-height))"
        }
        w="100vw"
        pos="fixed"
        top={hasSandboxBanner ? "calc(var(--app-navbar-height) + 24px)" : "var(--app-navbar-height)"}
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
              id="overheatingCodeScroll"
            >
              <Flex direction="column" flex={1} px={6} py={3}>
                {currentOverheatingCode ? <FormSection /> : <LoadingScreen />}
              </Flex>
            </Flex>
          </Flex>
        </Suspense>
      </Flex>
    </RemoveScroll>
  )
})
