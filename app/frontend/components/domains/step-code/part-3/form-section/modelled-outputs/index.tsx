import { Flex, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ModelledEnergyOutputsGrid } from "./modelled-energy-outputs-grid"

export const ModelledOutputs = observer(function Part3StepCodeFormModelledOutputs() {
  const { t } = useTranslation()
  const i18nPrefix = "stepCode.part3.modelledOutputs"

  return (
    <Flex direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md" mt={3}>
        {t(`${i18nPrefix}.description`)}
      </Text>
      <ModelledEnergyOutputsGrid mt={6} />
    </Flex>
  )
})
