import { Box, Center, Container, VStack } from "@chakra-ui/react"
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
import { StepCodeNavBar } from "./nav-bar"
import { Part9NavLinks } from "./nav-bar/part-9-nav-links"
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
        <StepCodeNavBar title={t("stepCode.title")} NavLinks={<Part9NavLinks />} />
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
