import { Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { EEnergyOutputUseType } from "../../../../../../types/enums"
import { IEnergyOutput } from "../../../../../../types/types"
import { AnnualEnergyWholeBuildingGrid } from "./annual-energy-whole-building-grid"
import { ModelledEnergyOutputsGrid } from "./modelled-energy-outputs-grid"
import { StepCodeBuildingPortionsGrid } from "./step-code-building-portions-grid"

export interface IMpdelledEnergyOutputChecklistForm {
  modelledEnergyOutputsAttributes: Omit<IEnergyOutput, "source">[]
  totalAnnualThermalEnergyDemand: number
  totalAnnualCoolingEnergyDemand: number
  stepCodeAnnualThermalEnergyDemand: number
}

function initializeModelledEnergyOutputs(
  existingEnergyOutputs: Omit<IEnergyOutput, "source">[]
): Omit<IEnergyOutput, "source">[] {
  const otherEnergyOutputs: Omit<IEnergyOutput, "source">[] = existingEnergyOutputs.filter(
    (output) => output.useType === EEnergyOutputUseType.other
  )
  const defaultEnergyOutputs: Omit<IEnergyOutput, "source">[] = Object.values(EEnergyOutputUseType)
    .filter((useType) => useType !== EEnergyOutputUseType.other)
    .map((useType) => {
      const existingEnergyOutput = existingEnergyOutputs.find((output) => output.useType === useType)
      return {
        id: existingEnergyOutput?.id,
        useType,
        annualEnergy: existingEnergyOutput?.annualEnergy || 0,
        name: existingEnergyOutput?.name,
        fuelTypeId: existingEnergyOutput?.fuelTypeId,
      }
    })

  return defaultEnergyOutputs.concat(otherEnergyOutputs)
}

function createFormValues(checklist: IPart3StepCodeChecklist | undefined) {
  return {
    modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(checklist?.modelledEnergyOutputs),
    totalAnnualThermalEnergyDemand: Number(checklist?.totalAnnualThermalEnergyDemand ?? 0),
    totalAnnualCoolingEnergyDemand: Number(checklist?.totalAnnualCoolingEnergyDemand ?? 0),
    stepCodeAnnualThermalEnergyDemand: Number(checklist?.stepCodeAnnualThermalEnergyDemand ?? 0),
  }
}

export const ModelledOutputs = observer(function Part3StepCodeFormModelledOutputs() {
  const { t } = useTranslation()
  const { stepCode } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.modelledOutputs"
  const formMethods = useForm<IMpdelledEnergyOutputChecklistForm>({
    defaultValues: createFormValues(stepCode?.checklist),
  })
  const { reset } = formMethods

  useEffect(() => {
    reset({
      modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(
        stepCode?.checklist?.modelledEnergyOutputs || []
      ),
    })
  }, [
    stepCode?.checklist?.totalAnnualCoolingEnergyDemand,
    stepCode?.checklist?.stepCodeAnnualThermalEnergyDemand,
    stepCode?.checklist?.totalAnnualThermalEnergyDemand,
    stepCode?.checklist?.modelledEnergyOutputs,
  ])

  return (
    <Flex direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md" mt={3}>
        {t(`${i18nPrefix}.description`)}
      </Text>
      <FormProvider {...formMethods}>
        <Stack gap={8}>
          <ModelledEnergyOutputsGrid mt={6} />
          <AnnualEnergyWholeBuildingGrid />
          <StepCodeBuildingPortionsGrid />
        </Stack>
      </FormProvider>
    </Flex>
  )
})
