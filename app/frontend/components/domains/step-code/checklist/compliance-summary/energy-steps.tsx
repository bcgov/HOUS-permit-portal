import { Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { translationPrefix } from "./translation-prefix"

export const EnergySteps = function EnergySteps({ checklist }) {
  return (
    <Flex align="end" w="full">
      {[...Array(checklist.numberOfEnergySteps).keys()].map((stepOffset) => {
        const step = parseInt(checklist.minEnergyStep) + stepOffset
        const isRequiredStep = step.toString() == checklist.requiredEnergyStep
        let height = 38
        switch (stepOffset) {
          case 0:
            break
          case 1:
            height = height + 33
            break
          default:
            height = height + 33 + 22 * (stepOffset - 1)
            break
        }

        return (
          <VStack key={`energyStepsStep${step}`} align="stretch" flex={1}>
            {isRequiredStep && (
              <Text fontSize="xs" textAlign="center">
                {t(`${translationPrefix}.required`)}
              </Text>
            )}
            <Flex
              justify="center"
              align="center"
              h={`${height}px`}
              rounded="none"
              borderStyle={isRequiredStep ? "solid" : "dashed"}
              borderWidth={2}
              borderRightWidth={stepOffset + 1 == checklist.numberOfEnergySteps ? 2 : 0}
              borderColor={isRequiredStep ? "semantic.info" : "border.base"}
              bg={isRequiredStep ? "semantic.infoLight" : "greys.grey03"}
            >
              {t(`${translationPrefix}.energyStepCode.steps.${step}`)}
            </Flex>
          </VStack>
        )
      })}
    </Flex>
  )
}
