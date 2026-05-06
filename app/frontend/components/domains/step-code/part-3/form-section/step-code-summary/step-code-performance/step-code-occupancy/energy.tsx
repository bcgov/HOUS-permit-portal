import { Field, Flex, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { IStepCodeOccupancy } from "../../../../../../../../types/types"
import { EnergySteps } from "../../../../../part-9/checklist/compliance-summary/energy-steps"

export const StepCodeEnergyPerformance = observer(function StepCodeEnergyPerformance() {
  const i18nPrefix = "stepCode.part3.stepCodeSummary.stepCode.energy"
  const { checklist } = usePart3StepCode()
  const stepAchieved = checklist.complianceReport.performance.complianceSummary.energyStepAchieved
  const occupancy: IStepCodeOccupancy = checklist.stepCodeOccupancies[0]

  return (
    <VStack flex={1} gap={4} borderWidth={1} borderColor="border.light" rounded="md" p={4}>
      <Heading variant="heading4">{t(`${i18nPrefix}.title`)}</Heading>
      <Field.Root w="auto" mx="auto">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.stepRequired`)}
        </Field.Label>
        <Input
          maxW={"124px"}
          value={t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${occupancy.energyStepRequired}`)}
          disabled
        />
      </Field.Root>
      <Flex maxW="240px" w="full">
        <EnergySteps
          requiredStep={occupancy.energyStepRequired}
          achievedStep={checklist.complianceReport.performance.complianceSummary.energyStepAchieved}
        />
      </Flex>
      <Field.Root w="100%">
        <Field.Label mr={0} my={1} textAlign="center" fontWeight="normal">
          {t(`${i18nPrefix}.achieved`)}
        </Field.Label>
        <Input
          value={
            stepAchieved
              ? t(`stepCodeChecklist.edit.codeComplianceSummary.energyStepCode.steps.${stepAchieved}`)
              : t(`${i18nPrefix}.notAchieved`)
          }
          _disabled={{
            fontWeight: "bold",
            bg: !!stepAchieved ? "semantic.successLight" : "semantic.errorLight",
            borderColor: !!stepAchieved ? "semantic.success" : "semantic.error",
          }}
          disabled
        />
      </Field.Root>
      <Text textAlign="center">{t(`${i18nPrefix}.result.${!!stepAchieved ? "success" : "failure"}`)}</Text>
    </VStack>
  )
})
