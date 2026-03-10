import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { EEnergyOutputUseType } from "../../../../../../types/enums"
import { IEnergyOutput } from "../../../../../../types/types"
import { SharedSpinner } from "../../../../../shared/base/shared-spinner"
import { usePart3Navigation } from "../../use-part-3-navigation"
import { AnnualEnergyWholeBuildingGrid } from "./annual-energy-whole-building-grid"
import { ModelledEnergyOutputsGrid } from "./modelled-energy-outputs-grid"
import { StepCodeBuildingPortionsGrid } from "./step-code-building-portions-grid"

export interface IMpdelledEnergyOutputChecklistForm {
  modelledEnergyOutputsAttributes: (Omit<IEnergyOutput, "source" | "annualEnergy"> & {
    annualEnergy: number | null
  })[]
  totalAnnualThermalEnergyDemand: number | null
  totalAnnualCoolingEnergyDemand: number | null
  stepCodeAnnualThermalEnergyDemand: number | null
}

function initializeModelledEnergyOutputs(
  existingEnergyOutputs: Omit<IEnergyOutput, "source">[]
): IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] {
  const otherEnergyOutputs: IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] =
    existingEnergyOutputs
      ?.filter((output) => output.useType === EEnergyOutputUseType.other)
      ?.map((output) => ({
        ...output,
        annualEnergy: output.annualEnergy ? parseFloat(output.annualEnergy) : null,
      })) ?? []
  const defaultEnergyOutputs: IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] =
    Object.values(EEnergyOutputUseType)
      ?.filter((useType) => useType !== EEnergyOutputUseType.other)
      ?.map((useType) => {
        const existingEnergyOutput = existingEnergyOutputs?.find((output) => output.useType === useType)
        return {
          id: existingEnergyOutput?.id,
          useType,
          annualEnergy: existingEnergyOutput?.annualEnergy ? parseFloat(existingEnergyOutput.annualEnergy) : null,
          name: existingEnergyOutput?.name,
          fuelTypeId: existingEnergyOutput?.fuelTypeId,
        }
      }) ?? []

  return defaultEnergyOutputs.concat(otherEnergyOutputs)
}

function createFormValues(checklist: IPart3StepCodeChecklist | undefined) {
  return {
    modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(checklist?.modelledEnergyOutputs),
    totalAnnualThermalEnergyDemand: checklist?.totalAnnualThermalEnergyDemand
      ? Number(checklist.totalAnnualThermalEnergyDemand)
      : null,
    totalAnnualCoolingEnergyDemand: checklist?.totalAnnualCoolingEnergyDemand
      ? Number(checklist.totalAnnualCoolingEnergyDemand)
      : null,
    stepCodeAnnualThermalEnergyDemand: checklist?.stepCodeAnnualThermalEnergyDemand
      ? Number(checklist.stepCodeAnnualThermalEnergyDemand)
      : null,
  }
}

export const ModelledOutputs = observer(function Part3StepCodeFormModelledOutputs() {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.modelledOutputs"
  const formMethods = useForm<IMpdelledEnergyOutputChecklistForm>({
    defaultValues: createFormValues(checklist),
    mode: "onSubmit",
  })
  const { reset, handleSubmit } = formMethods
  const navigate = useNavigate()
  const { navigateToNext, goBackPath } = usePart3Navigation()

  useEffect(() => {
    reset({
      modelledEnergyOutputsAttributes: initializeModelledEnergyOutputs(checklist?.modelledEnergyOutputs || []),
    })
  }, [
    checklist?.totalAnnualCoolingEnergyDemand,
    checklist?.stepCodeAnnualThermalEnergyDemand,
    checklist?.totalAnnualThermalEnergyDemand,
    checklist?.modelledEnergyOutputs,
  ])

  const onSubmit = handleSubmit(async (data, event) => {
    if (!checklist) return

    const saveAndGoBack = (event?.nativeEvent as CustomEvent)?.detail?.saveAndGoBack

    const deletedEnergyOutputsAttributes = data.modelledEnergyOutputsAttributes
      .filter((output) => !output.fuelTypeId && output.id)
      .map((output) => ({ id: output.id, _destroy: true }))
    const createdOrUpdatedEnergyOutputsAttributes = data.modelledEnergyOutputsAttributes.filter(
      (output) => output.fuelTypeId
    )
    const deletedOtherEnergyOutputsAttributes = (checklist?.modelledEnergyOutputs ?? [])
      .filter(
        (output) =>
          output.useType === EEnergyOutputUseType.other &&
          !data.modelledEnergyOutputsAttributes.some((o) => o.id === output.id)
      )
      .map((output) => ({ id: output.id, _destroy: true }))
    const energyOutputs = [
      ...deletedEnergyOutputsAttributes,
      ...createdOrUpdatedEnergyOutputsAttributes,
      ...deletedOtherEnergyOutputsAttributes,
    ]
    const updated = await checklist?.update({ ...data, modelledEnergyOutputsAttributes: energyOutputs })

    if (updated) {
      await checklist?.completeSection("modelledOutputs")

      if (saveAndGoBack) {
        navigate(goBackPath)
      } else {
        navigateToNext()
      }
    }
  })

  return (
    <Flex direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md" mt={3}>
        {t(`${i18nPrefix}.description`)}
      </Text>
      <FormProvider {...formMethods}>
        {checklist ? (
          <Stack as="form" onSubmit={onSubmit} gap={8} name="part3SectionForm">
            <ModelledEnergyOutputsGrid mt={6} />
            <AnnualEnergyWholeBuildingGrid />
            <StepCodeBuildingPortionsGrid />
            <Button type="submit" variant="primary">
              {t("stepCode.part3.cta")}
            </Button>
          </Stack>
        ) : (
          <SharedSpinner mt={16} />
        )}
      </FormProvider>
    </Flex>
  )
})
