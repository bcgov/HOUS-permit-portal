import { Box, Center, Flex, FlexProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { usePreCheck } from "../../../hooks/resources/use-pre-check"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"

interface IPreCheckDisclaimerBarProps extends FlexProps {
  serviceProvider: string
}

const PreCheckDisclaimerBar = ({ serviceProvider, ...flexProps }: IPreCheckDisclaimerBarProps) => {
  const { t } = useTranslation()

  return (
    <Flex w="full" bg="theme.blue" color="white" py={2} px={8} justify="center" align="center" {...flexProps}>
      <Text fontSize="sm" textAlign="center">
        {t("preCheck.viewer.disclaimer", { serviceProvider })}
      </Text>
    </Flex>
  )
}

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
          <PreCheckDisclaimerBar serviceProvider={currentPreCheck.providerName} mt={-1} />
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
        <PreCheckDisclaimerBar serviceProvider={currentPreCheck.providerName} />
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
          <FloatingHelpDrawer top="100px" />
        </Box>
      </Flex>
    </RemoveScroll>
  )
})
