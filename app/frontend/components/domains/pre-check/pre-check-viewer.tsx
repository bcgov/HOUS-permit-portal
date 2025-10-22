import { Box, Center, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { usePreCheck } from "../../../hooks/resources/use-pre-check"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"
import { PreCheckNavBar } from "./pre-check-nav-bar"

export const PreCheckViewer = observer(function PreCheckViewer() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()

  if (!currentPreCheck) {
    return <LoadingScreen />
  }

  if (!currentPreCheck.viewerUrl) {
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
          <PreCheckNavBar />
          <Center flex={1}>
            <Text color="text.secondary">
              {t("preCheck.viewer.noUrl", "The interactive viewer is not yet available for this pre-check.")}
            </Text>
          </Center>
        </Flex>
      </RemoveScroll>
    )
  }

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
        <PreCheckNavBar />
        <Box flex={1} w="full" h="full" position="relative">
          <iframe
            src={currentPreCheck.viewerUrl}
            title={t("preCheck.viewer.title", "Interactive Results Viewer")}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="fullscreen"
          />
          <FloatingHelpDrawer top="60px" />
        </Box>
      </Flex>
    </RemoveScroll>
  )
})
