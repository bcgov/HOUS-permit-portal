import { Container, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../../../hooks/resources/use-permit-classifications-load"
import { useMst } from "../../../../../../setup/root"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Form } from "./form"
import { i18nPrefix } from "./i18n-prefix"

export const EnergyStepRequirementsScreen = observer(function EnergyStepRequirementsScreen() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes },
  } = useMst()

  const { isLoaded: isClassificationsLoaded } = usePermitClassificationsLoad()

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen />
  ) : (
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
            <Text fontWeight="bold">
              {t(`${i18nPrefix}.setMinimum`)} <br />{" "}
              <Link href={t("stepCode.helpLink")} isExternal fontWeight="normal">
                {t("stepCode.helpLinkText")}
                <ArrowSquareOut />
              </Link>
            </Text>

            {currentJurisdiction && isLoaded && isClassificationsLoaded && <Form jurisdiction={currentJurisdiction} />}
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
