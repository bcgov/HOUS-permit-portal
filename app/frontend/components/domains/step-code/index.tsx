import { Center, Container, Flex, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useEffect } from "react"
import { useMst } from "../../../setup/root"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { StepCodeChecklistForm } from "./checklist"
import { DrawingsWarning } from "./drawings-warning"
import { H2KImport } from "./import"
import { Info } from "./info"
import { Title } from "./title"

export const StepCodeForm = observer(function NewStepCodeForm() {
  const {
    stepCodeStore: { isLoaded, fetchStepCodes, currentStepCode },
  } = useMst()

  const navHeight = document.getElementById("mainNav").offsetHeight

  useEffect(() => {
    const fetch = async () => await fetchStepCodes()
    !isLoaded && fetch()
  }, [isLoaded])

  return (
    <Flex
      flex={1}
      w="full"
      h="full"
      maxH={`calc(100vh - ${navHeight}px)`}
      overflow="auto"
      pos="absolute"
      top={`${navHeight}px`}
      zIndex={11}
      bg="white"
    >
      <Suspense
        fallback={
          <Center p={50}>
            <SharedSpinner />
          </Center>
        }
      >
        {isLoaded && (
          <Container my={10} maxW="container.md">
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
        )}
      </Suspense>
    </Flex>
  )
})
