import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useMst } from "../../../../../../setup/root"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { EnergyStepEditableBlock } from "./energy-step-editable-block"
import { i18nPrefix } from "./i18n-prefix"

export const EnergyStepRequirementsScreen = observer(function EnergyStepRequirementsScreen() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes },
  } = useMst()

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isLoaded && (
        <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
          <VStack spacing={8} align="start" w="full">
            <VStack spacing={0.5} align="start" w="full">
              <Heading mb={0} fontSize="3xl">
                {t(`${i18nPrefix}.title`)}
              </Heading>
              <Text fontSize="sm" color="text.secondary">
                {t(`${i18nPrefix}.description`)}
              </Text>
            </VStack>
            <EnergyStepEditableBlock />
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
