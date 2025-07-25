import { Container, Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"

export const StepCodeIndexScreen = observer(() => {
  const { stepCodeStore } = useMst()
  const { stepCodes } = stepCodeStore

  // TODO: add a step code index
  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6}>{t("stepCode.index.title", "Step Code Tools")}</Heading>
      <VStack spacing={8} align="stretch">
        {stepCodes.map((stepCode) => (
          <Text>{stepCode.fullAddress}</Text>
        ))}
      </VStack>
    </Container>
  )
})

export default StepCodeIndexScreen
