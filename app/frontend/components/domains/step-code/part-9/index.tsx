import { Container, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { usePart9StepCode } from "../../../../hooks/resources/use-part-9-step-code"
import { usePermitApplication } from "../../../../hooks/resources/use-permit-application"
import { useMst } from "../../../../setup/root"
import { NotFoundScreen } from "../../../shared/base/not-found-screen"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { StepCodeChecklistForm } from "./checklist"
import { DrawingsWarning } from "./drawings-warning"
import { H2KImport } from "./import"
import { Info } from "./info"
import { Title } from "./title"

export const Part9StepCodeForm = observer(function Part9StepCodeForm() {
  const {
    stepCodeStore: { isOptionsLoaded, fetchPart9SelectOptions },
  } = useMst()
  const { currentStepCode } = usePart9StepCode()
  usePermitApplication()

  const { t } = useTranslation()

  const { permitApplicationId } = useParams()

  useEffect(() => {
    const fetch = async () => await fetchPart9SelectOptions()
    !isOptionsLoaded && fetch()
  }, [isOptionsLoaded])

  // Prevent viewing/editing archived step codes
  if (currentStepCode?.isDiscarded) return <NotFoundScreen />

  return (
    <>
      {isOptionsLoaded && (
        <Container maxW="container.lg">
          <FloatingHelpDrawer top="36" />
          <Container my={10} maxW="780px" px={0}>
            {!currentStepCode ? (
              <VStack spacing={8} align="start" w="full" pb={20}>
                <Title />
                <Info />
                {permitApplicationId && <DrawingsWarning />}
                <H2KImport />
              </VStack>
            ) : (
              <StepCodeChecklistForm />
            )}
          </Container>
        </Container>
      )}
    </>
  )
})
