import { Radio, RadioGroup } from "@/components/ui/radio"
import { Button, Field, Flex, Grid, Stack, Text } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { Plus } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EFuelType } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { Part3FormFooter } from "../shared/form-footer"
import { SectionHeading } from "../shared/section-heading"
import { MUAFuelRow } from "./mua-fuel"
import { SuiteSubMeteringFields } from "./suite-sub-metering"

export const ResidentialAdjustments = observer(function Part3StepCodeFormResidentialAdjustments() {
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.residentialAdjustments"

  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: {
      pressurizedDoorsCount: checklist.pressurizedDoorsCount,
      pressurizationAirflowPerDoor: parseFloat(checklist.pressurizationAirflowPerDoor),
      pressurizedCorridorsArea: parseFloat(checklist.pressurizedCorridorsArea),
      isSuiteSubMetered: checklist.isSuiteSubMetered,
      suiteHeatingEnergy: parseFloat(checklist.suiteHeatingEnergy),
      makeUpAirFuelsAttributes: checklist.makeUpAirFuels.map((muaFuel) => ({
        id: muaFuel.id,
        _destroy: null,
        fuelTypeId: muaFuel.fuelTypeId,
        percentOfLoad: parseFloat(muaFuel.percentOfLoad as string),
      })),
    },
  })
  const { handleSubmit, formState, register, control, reset, resetField, watch, getValues } = formMethods
  const { isSubmitting, isValid, isSubmitted, errors } = formState
  const { fields, replace, append, remove } = useFieldArray({
    control,
    rules: {
      validate: (value, formValues) => {
        const isMixture = value.length > 1
        let error
        if (!isMixture) {
          const isSelected = value.length == 1 && !!value[0].fuelTypeId
          error = !isSelected && t(`${i18nPrefix}.muaFuel.mixture.required`)
        } else if (R.all((v) => !!v.percentOfLoad, value)) {
          const totalPercentage = value.reduce((sum, muaFuel) => sum + Number(muaFuel.percentOfLoad), 0)
          error = totalPercentage != 100 && t(`${i18nPrefix}.muaFuel.mixture.totalPercentOfLoad.error`)
        } else {
          error = null
        }
        return !!error ? error : true
      },
    },
    name: "makeUpAirFuelsAttributes",
  })
  const watchMuaFuels = watch("makeUpAirFuelsAttributes")

  const onSubmit = async (values) => {
    if (!checklist) return
    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")
    await checklist.completeSection("residentialAdjustments")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <FormProvider {...formMethods}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <Field.Root>
            <Field.Label>{t(`${i18nPrefix}.hdd.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.hdd.hint`)}
            </Field.HelperText>
            <Input maxW={"200px"} value={checklist.heatingDegreeDays} disabled />
          </Field.Root>
          <Field.Root>
            <Field.Label>{t(`${i18nPrefix}.pressurizedDoors.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="pressurizedDoorsCount" />
            </Field.HelperText>
            <Input
              maxW={"200px"}
              type="number"
              step={1}
              {...register("pressurizedDoorsCount", { required: t(`${i18nPrefix}.pressurizedDoors.error`) })}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.airflow.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="pressurizedCorridorsArea" />
            </Field.HelperText>
            <Input
              maxW={"200px"}
              type="number"
              step={"any"}
              {...register("pressurizedCorridorsArea", { required: t(`${i18nPrefix}.airflow.error`) })}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label pb={1}>
              <Trans i18nKey={`${i18nPrefix}.area.label`} components={{ sup: <sup /> }} />
            </Field.Label>
            <Field.HelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.area.hint`)}
            </Field.HelperText>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="pressurizationAirflowPerDoor" />
            </Field.HelperText>
            <Input
              maxW={"200px"}
              type="number"
              step={"any"}
              {...register("pressurizationAirflowPerDoor", { required: t(`${i18nPrefix}.area.error`) })}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.muaFuel.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              {fields.length <= 1 && <ErrorMessage errors={errors} name="makeUpAirFuelsAttributes.root" />}
            </Field.HelperText>
            <Controller
              name="makeUpAirFuelsAttributes.0.fuelTypeId"
              control={control}
              rules={{ required: fields.length > 1 && t(`${i18nPrefix}.muaFuel.error`) }}
              render={() => {
                const [value, setValue] = useState()
                const defaultValue =
                  fields.length == 1 ? fields[0].fuelTypeId : fields.length > 1 ? "muaMixture" : undefined
                const handleChange = (value) => {
                  if (value == "muaMixture" && fields.length <= 1) {
                    replace([
                      { id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined },
                      { id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined },
                    ])
                  } else {
                    resetField("makeUpAirFuelsAttributes")
                    replace([{ id: undefined, _destroy: undefined, fuelTypeId: value, percentOfLoad: 100 }])
                  }
                  setValue(value)
                }
                return (
                  <RadioGroup.Root defaultValue={defaultValue} value={value} onValueChange={handleChange}>
                    <Stack gap={1}>
                      {checklist.fuelTypes.map((ft) => (
                        <Radio key={ft.id} value={ft.id}>
                          {ft.key == EFuelType.other
                            ? ft.description
                            : t(`stepCode.part3.fuelTypes.fuelTypeKeys.${ft.key}`)}
                        </Radio>
                      ))}
                      <RadioGroup.Item key="muaMixture" value="muaMixture">
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>{t(`${i18nPrefix}.muaFuel.mixture.option`)}</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    </Stack>
                  </RadioGroup.Root>
                )
              }}
            />
          </Field.Root>
          {fields.length > 1 && (
            <Field.Root>
              <Grid
                w="full"
                templateColumns={`auto repeat(2, minmax(auto, 170px))`}
                borderWidth={1}
                borderTopWidth={0}
                borderColor="borders.light"
              >
                <GridColumnHeader>
                  <Text>{t(`${i18nPrefix}.muaFuel.mixture.fuelType.label`)}</Text>
                </GridColumnHeader>
                <GridColumnHeader>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.muaFuel.mixture.emissionsFactor`} components={{ sub: <sub /> }} />
                  </Text>
                </GridColumnHeader>
                <GridColumnHeader>
                  <Text>{t(`${i18nPrefix}.muaFuel.mixture.percentOfLoad.label`)}</Text>
                </GridColumnHeader>

                {fields.map((f, idx) => {
                  return (
                    !getValues(`makeUpAirFuelsAttributes.${idx}._destroy`) && (
                      <MUAFuelRow key={f.id} field={f} idx={idx} remove={remove} />
                    )
                  )
                })}
              </Grid>
              <Field.HelperText color="semantic.error">
                {R.all((f) => !!f.fuelTypeId && !!f.percentOfLoad, watchMuaFuels) && (
                  <ErrorMessage errors={errors} name={"makeUpAirFuelsAttributes.root"} />
                )}
              </Field.HelperText>
              {fields.length < checklist.fuelTypes.length && (
                <Button
                  variant="plain"
                  onClick={() =>
                    append({ id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined })
                  }
                >
                  <Plus />
                  {t(`${i18nPrefix}.muaFuel.mixture.add`)}
                </Button>
              )}
            </Field.Root>
          )}
          <SuiteSubMeteringFields />
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
        </Flex>
      </FormProvider>
    </>
  )
})
