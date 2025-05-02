import { Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { useMst } from "../../../../../../setup/root"
import { EZeroCarbonStep } from "../../../../../../types/enums"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  requiredStep?: EZeroCarbonStep
  achievedStep?: EZeroCarbonStep
  isPlaceholder?: boolean
  offset?: number
}

export const ZeroCarbonSteps = function ZeroCarbonSteps({
  requiredStep,
  achievedStep,
  isPlaceholder,
  offset = 0,
}: IProps) {
  const { stepCodeStore } = useMst()
  const steps = stepCodeStore.getZeroCarbonStepOptions()
  const numSteps = steps.length - offset

  return (
    <Flex align="end" w="full">
      {[...Array(numSteps).keys()].map((stepOffset) => {
        const step = Number(steps[stepOffset]) + offset
        const isRequiredStep = step == Number(requiredStep)
        const isAchievedStep = step == Number(achievedStep)
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
          <VStack key={`zeroCarbonStepsStep${step}`} align="stretch" flex={1}>
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
              {isPlaceholder ? "-" : t(`${i18nPrefix}.zeroCarbonStepCode.steps.${step}`)}
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
