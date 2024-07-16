import { Flex, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { i18nPrefix } from "./i18n-prefix"

import { IStepCodeEnergyComplianceReport } from "../../../../../models/step-code-energy-compliance-report"
import { EEnergyStep } from "../../../../../types/enums"

interface IProps {
  compliance: IStepCodeEnergyComplianceReport
}

export const EnergySteps = function EnergySteps({ compliance }: IProps) {
  const steps = Object.values(EEnergyStep)
  const numSteps = steps.length

  return (
    <Flex align="end" w="full">
      {[...Array(numSteps).keys()].map((stepOffset) => {
        const step = steps[stepOffset]
        const isRequiredStep = step == compliance.requiredStep
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
              {t(`${i18nPrefix}.energyStepCode.steps.${step}`)}
            </Flex>
          </VStack>
        )
      })}
    </Flex>
  )
}
