import { Box, Center, Container, Flex, Image, Show, Spacer, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { usePermitApplication } from "../../../hooks/resources/use-permit-application"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../shared/floating-help-drawer"
import { StepCodeChecklistForm } from "./checklist"
import { DrawingsWarning } from "./drawings-warning"
import { H2KImport } from "./import"
import { Info } from "./info"
import { StepCodeNavLinks } from "./nav-links"
import { Title } from "./title"

export const StepCodeForm = observer(function NewStepCodeForm() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes, currentStepCode },
  } = useMst()

  const { currentPermitApplication } = usePermitApplication()

  const { t } = useTranslation()
  const navHeight = document.getElementById("mainNav").offsetHeight

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  return (
    <RemoveScroll>
      <Box
        id="stepCodeScroll"
        overflow="auto"
        pos="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex="modal"
        bg="white"
      >
        <Box
          as="nav"
          id="stepCodeNav"
          position="sticky"
          top={0}
          left="0"
          right="0"
          w="full"
          bg="greys.white"
          color="theme.blue"
          zIndex={10}
          borderBottomWidth={2}
          borderColor="border.light"
          shadow="elevations.elevation01"
        >
          <Container maxW="container.lg">
            <Flex align="center" gap={2}>
              <Image fit="cover" htmlHeight="64px" htmlWidth="166px" alt={t("site.linkHome")} src="/images/logo.svg" />
              <Show above="md">
                <Text fontSize="md" color="text.primary" fontWeight="bold">
                  {t("stepCode.title")}
                </Text>
                <Text fontSize="sm" textTransform="uppercase" color="theme.yellow" fontWeight="bold" mb={2} ml={1}>
                  {t("site.beta")}
                </Text>
              </Show>
              <Spacer />
              <StepCodeNavLinks />
            </Flex>
          </Container>
        </Box>
        <Suspense
          fallback={
            <Center p={50}>
              <SharedSpinner />
            </Center>
          }
        >
          {isLoaded && currentPermitApplication && (
            <Container maxW="container.lg">
              <FloatingHelpDrawer top="24" />
              <Container my={10} maxW="780px" px={0}>
                {!currentStepCode ? (
                  <VStack spacing={8} align="start" w="full" pb={20}>
                    <Title />
                    <Info />
                    <DrawingsWarning />
                    <H2KImport />
                  </VStack>
                ) : (
                  <StepCodeChecklistForm />
                )}
              </Container>
            </Container>
          )}
        </Suspense>
      </Box>
    </RemoveScroll>
  )
})
