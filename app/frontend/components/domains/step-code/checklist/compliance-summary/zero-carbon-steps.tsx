import { Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../models/step-code-zero-carbon-compliance-report"
import { EZeroCarbonStep } from "../../../../../types/enums"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  compliance: IStepCodeZeroCarbonComplianceReport
}

export const ZeroCarbonSteps = function ZeroCarbonSteps({ compliance }: IProps) {
  const steps = Object.values(EZeroCarbonStep)
  const numSteps = steps.length
  return (
    <Flex align="end" w="full">
      {[...Array(numSteps).keys()].map((stepOffset) => {
        const step = steps[stepOffset]
        const isRequiredStep = compliance.requiredStep && step == compliance.requiredStep.slice(-1)
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
            {isRequiredStep && (
              <Text fontSize="xs" textAlign="center">
                {t(`${i18nPrefix}.required`)}
              </Text>
            )}
            <Flex
              justify="center"
              align="center"
              h={`${height}px`}
              rounded="none"
              borderStyle={isRequiredStep ? "solid" : "dashed"}
              borderWidth={2}
              borderRightWidth={stepOffset + 1 == numSteps ? 2 : 0}
              borderColor={isRequiredStep ? "semantic.info" : "border.base"}
              bg={isRequiredStep ? "semantic.infoLight" : "greys.grey03"}
            >
              {t(`${i18nPrefix}.zeroCarbonStepCode.steps.${step}`)}
            </Flex>
          </VStack>
        )
      })}
    </Flex>
  )
}
