import { Button, Center, Container, HStack, Heading, StackDivider, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const StepCodeChecklistsScreen = observer(function StepCodeChecklistsScreen() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes, stepCodes },
  } = useMst()

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  return (
    <Container>
      <Heading>{t("stepCode.index.heading")}</Heading>
      <Suspense
        fallback={
          <Center p={50} flex={1}>
            <SharedSpinner />
          </Center>
        }
      >
        {isLoaded && (
          <VStack divider={<StackDivider borderColor="border.light" />}>
            {stepCodes.map((stepCode) => (
              <HStack key={stepCode.id} w="full" justify="space-between">
                <Text>{stepCode.name}</Text>
                <Button
                  as={RouterLinkButton}
                  to={`/step-codes/${stepCode.id}/checklists/${stepCode.preConstructionChecklist.id}`}
                >
                  View
                </Button>
              </HStack>
            ))}
          </VStack>
        )}
      </Suspense>
      <Button as={RouterLinkButton} to="/step-codes/new">
        {t("stepCode.index.newStepCode")}
      </Button>
    </Container>
  )
})
