import { InputGroup } from "@/components/ui/input-group"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Field, Input, InputElement, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { EIsSuiteSubMetered } from "../../../../../../types/enums"
import { generateUUID } from "../../../../../../utils/utility-functions"

export const SuiteSubMeteringFields = () => {
  const i18nPrefix = "stepCode.part3.residentialAdjustments.suiteSubMetering"
  const { control, register, formState, watch } = useFormContext()
  const { errors } = formState

  const watchIsSuiteSubMetered = watch("isSuiteSubMetered")

  return (
    <>
      <Field.Root>
        <Field.Label pb={1}>{t(`${i18nPrefix}.isRelevant.label`)}</Field.Label>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name="isSuiteSubMetered" />
        </Field.HelperText>
        <Controller
          name="isSuiteSubMetered"
          control={control}
          rules={{ required: t(`${i18nPrefix}.isRelevant.error`) }}
          render={({ field: { value, onChange } }) => (
            <RadioGroup.Root value={value} onValueChange={onChange}>
              <Stack gap={1}>
                {Object.values(EIsSuiteSubMetered).map((v) => (
                  <Radio key={generateUUID()} value={v}>
                    {t(`${i18nPrefix}.isRelevant.options.${v}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup.Root>
          )}
        />
      </Field.Root>
      {watchIsSuiteSubMetered == EIsSuiteSubMetered.no && (
        <Field.Root>
          <Field.Label>{t(`${i18nPrefix}.heatingEnergy.label`)}</Field.Label>
          <Field.HelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.heatingEnergy.hint`)}
          </Field.HelperText>
          <Field.HelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="suiteHeatingEnergy" />
          </Field.HelperText>
          <InputGroup maxW="200px">
            <Input
              type="number"
              step={"any"}
              {...register("suiteHeatingEnergy", { required: t(`${i18nPrefix}.heatingEnergy.error`) })}
            />
            <InputElement placement="end">{t(`${i18nPrefix}.heatingEnergy.units`)}</InputElement>
          </InputGroup>
        </Field.Root>
      )}
    </>
  )
}
