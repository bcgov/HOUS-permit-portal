import { Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { i18nPrefix } from "./i18n-prefix"

import { useMst } from "../../../../../../setup/root"
import { EEnergyStep } from "../../../../../../types/enums"

interface IProps {
  requiredStep?: EEnergyStep
  achievedStep?: EEnergyStep
  isPlaceholder?: boolean
}

export const EnergySteps = function EnergySteps({ requiredStep, achievedStep, isPlaceholder }: IProps) {
  const { stepCodeStore } = useMst()
  const steps = stepCodeStore.getEnergyStepOptions()
  const numSteps = steps.length

  return (
    <Flex align="end" w="full">
      {[...Array(numSteps).keys()].map((stepOffset) => {
        const step = steps[stepOffset]
        const isRequiredStep = step == requiredStep
        const isAchievedStep = step == achievedStep
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
            <Text fontSize="xs" textAlign="center" visibility={isAchievedStep ? "visible" : "hidden"}>
              {t(`${i18nPrefix}.achieved`)}
            </Text>
            <Flex
              justify="center"
              align="center"
              h={`${height}px`}
              rounded="none"
              borderStyle={isRequiredStep || isAchievedStep ? "solid" : "dashed"}
              borderWidth={2}
              borderRightWidth={stepOffset + 1 == numSteps ? 2 : 0}
              borderColor={isAchievedStep ? "semantic.success" : isRequiredStep ? "semantic.info" : "border.base"}
              bg={isAchievedStep ? "semantic.successLight" : isRequiredStep ? "semantic.infoLight" : "greys.grey03"}
            >
              {isPlaceholder ? "-" : t(`${i18nPrefix}.energyStepCode.steps.${step}`)}
            </Flex>
            <Text fontSize="xs" textAlign="center" visibility={isRequiredStep ? "visible" : "hidden"}>
              {t(`${i18nPrefix}.required`)}
            </Text>
          </VStack>
        )
      })}
    </Flex>
  )
}
