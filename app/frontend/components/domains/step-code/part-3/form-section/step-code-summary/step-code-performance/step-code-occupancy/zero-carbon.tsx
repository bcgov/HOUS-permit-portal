import { Flex, FormControl, FormLabel, Heading, Input, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { IStepCodeOccupancy } from "../../../../../../../../types/types"
import { ZeroCarbonSteps } from "../../../../../part-9/checklist/compliance-summary/zero-carbon-steps"

export const StepCodeZeroCarbonPerformance = observer(function StepCodeZeroCarbonPerformance() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode.zeroCarbon"
  const { checklist } = usePart3StepCode()
  const stepAchieved = checklist.complianceReport.performance.complianceSummary.zeroCarbonStepAchieved
  const occupancy: IStepCodeOccupancy = checklist.stepCodeOccupancies[0]

  return (
    <VStack flex={1} spacing={4} borderWidth={1} borderColor="border.light" rounded="md" p={4}>
      <Heading variant="heading4">{t(`${i18nPrefix}.title`)}</Heading>
      <FormControl w="auto" mx="auto">
        <FormLabel mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.levelRequired`)}
        </FormLabel>
        <Input
          maxW={"124px"}
          value={t(
            `stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${occupancy.zeroCarbonStepRequired}`
          )}
          isDisabled
        />
      </FormControl>

      <Flex maxW="240px" w="full">
        <ZeroCarbonSteps offset={1} requiredStep={occupancy.zeroCarbonStepRequired} achievedStep={stepAchieved} />
      </Flex>
      <FormControl w="auto" mx="auto">
        <FormLabel mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.achieved`)}
        </FormLabel>
        <Input
          maxW={"124px"}
          value={t(`stepCodeChecklist.edit.codeComplianceSummary.zeroCarbonStepCode.steps.${stepAchieved}`)}
          isDisabled
        />
      </FormControl>
    </VStack>
  )
})
