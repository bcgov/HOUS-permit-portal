import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useMemo } from "react"
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { GridColumnHeader } from "../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../part-9/checklist/shared/grid/data"
import { SectionHeading } from "./shared/section-heading"

export const BaselinePerformance = observer(function Part3StepCodeFormBaselinePerformance() {
  const i18nPrefix = "stepCode.part3.baselinePerformance"
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

  const formMethods = useForm({
    defaultValues: {
      refAnnualThermalEnergyDemand: parseFloat(checklist?.refAnnualThermalEnergyDemand ?? "0"),
      referenceEnergyOutputsAttributes:
        checklist?.fuelTypes?.map((ft) => {
          const energyOutput = checklist.referenceEnergyOutputs?.find((o) => o.fuelTypeId === ft.id)
          return {
            id: energyOutput?.id,
            fuelTypeId: ft.id,
            annualEnergy: energyOutput ? parseFloat(energyOutput.annualEnergy) : 0,
          }
        }) ?? [],
    },
  })

  const { handleSubmit, formState, register, control, reset, watch } = formMethods
  const { isSubmitting, isValid, isSubmitted, errors } = formState

  const { fields } = useFieldArray({
    control,
    name: "referenceEnergyOutputsAttributes",
  })

  const watchEnergyOutputs = watch("referenceEnergyOutputsAttributes")

  const onSubmit = async (values) => {
    if (!checklist) return

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("baselinePerformance")

      if (alternatePath) {
        navigate(alternatePath)
      } else {
        navigate(location.pathname.replace("baseline-performance", "step-code-occupancies"))
      }
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  const totalAnnualEnergy = useMemo(() => {
    const total = R.reduce((sum, output) => sum + Number(output.annualEnergy), 0, watchEnergyOutputs)
    return total == 0 ? "-" : total
  }, [watchEnergyOutputs.map((eo) => eo.annualEnergy)])

  const totalEmissions = useMemo(() => {
    const total = R.reduce(
      (sum, output) =>
        (sum += calculateEmissions(output.annualEnergy, checklist.fuelType(output.fuelTypeId).emissionsFactor)),
      0,
      watchEnergyOutputs
    )
    return total == 0 ? "-" : total
  }, [watchEnergyOutputs.map((eo) => eo.annualEnergy)])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
        {/* TODO: instructions (pending copy) */}
        {/* <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text> */}
      </Flex>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.refAnnualThermalEnergyDemand.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.refAnnualThermalEnergyDemand.hint`)}
              </FormHelperText>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="refAnnualThermalEnergyDemand" />
              </FormHelperText>
              <InputGroup maxW={"200px"}>
                <Input
                  type="number"
                  step={1}
                  {...register("refAnnualThermalEnergyDemand", {
                    required: t(`${i18nPrefix}.refAnnualThermalEnergyDemand.error`),
                  })}
                />
                <InputRightElement>{t(`${i18nPrefix}.refAnnualThermalEnergyDemand.units`)}</InputRightElement>
              </InputGroup>
            </FormControl>

            <FormLabel>{t(`${i18nPrefix}.refEnergyOutputs.label`)}</FormLabel>

            <Grid
              w="full"
              templateColumns={`auto repeat(3, minmax(auto, 170px))`}
              borderWidth={1}
              borderTopWidth={0}
              borderBottomWidth={0}
              borderX={0}
              borderColor="borders.light"
            >
              <GridColumnHeader>
                <Text>{t(`${i18nPrefix}.refEnergyOutputs.fuelType`)}</Text>
              </GridColumnHeader>
              <GridColumnHeader>
                <Text>{t(`${i18nPrefix}.refEnergyOutputs.annualEnergy`)}</Text>
              </GridColumnHeader>
              <GridColumnHeader>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.refEnergyOutputs.emissionsFactor`} components={{ sub: <sub /> }} />
                </Text>
              </GridColumnHeader>
              <GridColumnHeader borderRightWidth={1}>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.refEnergyOutputs.emissions`} components={{ sub: <sub /> }} />
                </Text>
              </GridColumnHeader>

              {fields.map((f, idx) => (
                <ReferenceEnergyOutputRow field={f} idx={idx} />
              ))}

              <GridData borderX={0} borderTopWidth={1} justifyContent="center" px={0}>
                <Text fontSize="sm" fontWeight="bold">
                  {t(`${i18nPrefix}.refEnergyOutputs.totalAnnualEnergy`)}
                </Text>
              </GridData>
              <GridData borderX={0} borderTopWidth={1}>
                <Input isDisabled textAlign="center" value={totalAnnualEnergy} />
              </GridData>
              <GridData borderX={0} borderTopWidth={1} justifyContent="center" px={0}>
                <Text fontSize="sm" fontWeight="bold">
                  {t(`${i18nPrefix}.refEnergyOutputs.totalAnnualEmissions`)}
                </Text>
              </GridData>
              <GridData borderX={0} borderTopWidth={1}>
                <Input value={totalEmissions} isReadOnly isDisabled textAlign="center" />
              </GridData>
            </Grid>

            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </>
  )
})

const ReferenceEnergyOutputRow = ({ field, idx }) => {
  const { watch, register } = useFormContext()
  const { checklist } = usePart3StepCode()
  const fuelType = checklist.fuelType(field.fuelTypeId)
  const watchAnnualEnergy = watch(`referenceEnergyOutputsAttributes.${idx}.annualEnergy`)

  const emissions = useMemo(() => {
    if (!watchAnnualEnergy) return "-"
    return calculateEmissions(watchAnnualEnergy, fuelType.emissionsFactor)
  }, [watchAnnualEnergy])

  return (
    <>
      <GridData px={3} justifyContent={"center"}>
        <Input isDisabled value={t(`stepCode.part3.fuelTypes.fuelTypeKeys.${fuelType.key}`)} />
      </GridData>
      <GridData>
        <Input
          type="number"
          step="any"
          textAlign="center"
          {...register(`referenceEnergyOutputsAttributes.${idx}.annualEnergy`)}
        />
      </GridData>
      <GridData>
        <Input value={fuelType.emissionsFactor} isReadOnly isDisabled textAlign="center" />
      </GridData>
      <GridData borderRightWidth={1}>
        <Input value={emissions} isReadOnly isDisabled textAlign="center" />
      </GridData>
    </>
  )
}

function calculateEmissions(annualEnergy, emissionsFactor) {
  return Math.round(Number(annualEnergy) * Number(emissionsFactor))
}
