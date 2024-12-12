import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { IPart3StepCodeChecklist } from "../../../../../../models/part-3-step-code-checklist"
import { EEnergyOutputUseType } from "../../../../../../types/enums"
import { IEnergyOutput } from "../../../../../../types/types"
import { AnnualEnergyWholeBuildingGrid } from "./annual-energy-whole-building-grid"
import { ModelledEnergyOutputsGrid } from "./modelled-energy-outputs-grid"
import { StepCodeBuildingPortionsGrid } from "./step-code-building-portions-grid"

export interface IMpdelledEnergyOutputChecklistForm {
  modelledEnergyOutputsAttributes: (Omit<IEnergyOutput, "source" | "annualEnergy"> & {
    annualEnergy: number
  })[]
  totalAnnualThermalEnergyDemand: number
  totalAnnualCoolingEnergyDemand: number
  stepCodeAnnualThermalEnergyDemand: number
}

function initializeModelledEnergyOutputs(
  existingEnergyOutputs: Omit<IEnergyOutput, "source">[]
): IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] {
  const otherEnergyOutputs: IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] =
    existingEnergyOutputs
      ?.filter((output) => output.useType === EEnergyOutputUseType.other)
      ?.map((output) => ({
        ...output,
        annualEnergy: parseFloat(output.annualEnergy ?? "0"),
      })) ?? []
  const defaultEnergyOutputs: IMpdelledEnergyOutputChecklistForm["modelledEnergyOutputsAttributes"] =
    Object.values(EEnergyOutputUseType)
      ?.filter((useType) => useType !== EEnergyOutputUseType.other)
      ?.map((useType) => {
        const existingEnergyOutput = existingEnergyOutputs?.find((output) => output.useType === useType)
        return {
          id: existingEnergyOutput?.id,
          useType,
          annualEnergy: parseFloat(existingEnergyOutput?.annualEnergy ?? "0"),
          name: existingEnergyOutput?.name,
          fuelTypeId: existingEnergyOutput?.fuelTypeId,
        }
      }) ?? []

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
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.modelledOutputs"
  const formMethods = useForm<IMpdelledEnergyOutputChecklistForm>({
    defaultValues: createFormValues(checklist),
    mode: "onSubmit",
  })
  const { reset, handleSubmit } = formMethods
  const navigate = useNavigate()
  const location = useLocation()

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

  const onSubmit = handleSubmit(async (data) => {
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
      navigate(location.pathname.replace("modelled-outputs", "renewable-energy"))
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
          <Stack as="form" onSubmit={onSubmit} gap={8}>
            <ModelledEnergyOutputsGrid mt={6} />
            <AnnualEnergyWholeBuildingGrid />
            <StepCodeBuildingPortionsGrid />
            <Button type="submit" variant="primary">
              {t("stepCode.part3.cta")}
            </Button>
          </Stack>
        ) : null}
      </FormProvider>
    </Flex>
  )
})
