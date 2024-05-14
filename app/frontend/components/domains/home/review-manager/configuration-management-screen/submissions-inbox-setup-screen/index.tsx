import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../../../hooks/resources/use-permit-classifications-load"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Form } from "./form"
import { i18nPrefix } from "./i18n-prefix"

export const SubmissionsInboxSetupScreen = observer(function SubmissionsInboxSetupScreen() {
  const { isLoaded } = usePermitClassificationsLoad()

  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen />
  ) : (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }}>
      <VStack spacing={8} align="start" w="full">
        <VStack spacing={0.5} align="start" w="full">
          <Heading mb={0} fontSize="3xl">
            {t(`${i18nPrefix}.title`)}
          </Heading>
          <Text fontSize="sm" color="text.secondary">
            {t(`${i18nPrefix}.description`)}
          </Text>
        </VStack>
        <Suspense fallback={<LoadingScreen />}>
          {isLoaded && currentJurisdiction && <Form jurisdiction={currentJurisdiction} />}
        </Suspense>
      </VStack>
    </Container>
  )
})
