import { Flex, Heading, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EEnergyOutputUseType } from "../../../../../../types/enums"
import { IEnergyOutput } from "../../../../../../types/types"
import { ModelledEnergyOutputsGrid } from "./modelled-energy-outputs-grid"

export interface IMpdelledEnergyOutputChecklistForm {
  modelledEnergyOutputsAttributes: Omit<IEnergyOutput, "source">[]
}

function initializeModelledEnergyOutputs(existingEnergyOutputs: Omit<IEnergyOutput, "source">[]) {
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
export const ModelledOutputs = observer(function Part3StepCodeFormModelledOutputs() {
  const { t } = useTranslation()
  const { stepCode } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.modelledOutputs"
  const formMethods = useForm<IMpdelledEnergyOutputChecklistForm>({
    defaultValues: {
      modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(
        stepCode?.checklist?.modelledEnergyOutputs || []
      ),
    },
  })
  const { reset } = formMethods

  useEffect(() => {
    reset({
      modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(
        stepCode?.checklist?.modelledEnergyOutputs || []
      ),
    })
  }, [stepCode?.checklist?.modelledEnergyOutputs])

  return (
    <Flex direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md" mt={3}>
        {t(`${i18nPrefix}.description`)}
      </Text>
      <FormProvider {...formMethods}>
        <ModelledEnergyOutputsGrid mt={6} />
      </FormProvider>
    </Flex>
  )
})
