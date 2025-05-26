import { Container, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../../../hooks/resources/use-permit-classifications-load"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Form } from "./form"

export const SubmissionsInboxSetupScreen = observer(function SubmissionsInboxSetupScreen() {
  const { isLoaded } = usePermitClassificationsLoad()

  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen />
  ) : (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }}>
      <VStack spacing={8} align="start" w="full">
        <Suspense fallback={<LoadingScreen />}>
          {isLoaded && currentJurisdiction && <Form jurisdiction={currentJurisdiction} />}
        </Suspense>
      </VStack>
    </Container>
  )
})
