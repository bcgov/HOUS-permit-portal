import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react"
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
      <FormControl>
        <FormLabel pb={1}>{t(`${i18nPrefix}.isRelevant.label`)}</FormLabel>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name="isSuiteSubMetered" />
        </FormHelperText>
        <Controller
          name="isSuiteSubMetered"
          control={control}
          rules={{ required: t(`${i18nPrefix}.isRelevant.error`) }}
          render={({ field: { value, onChange } }) => (
            <RadioGroup value={value} onChange={onChange}>
              <Stack spacing={1}>
                {Object.values(EIsSuiteSubMetered).map((v) => (
                  <Radio key={generateUUID()} value={v}>
                    {t(`${i18nPrefix}.isRelevant.options.${v}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
      </FormControl>
      {watchIsSuiteSubMetered == EIsSuiteSubMetered.no && (
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.heatingEnergy.label`)}</FormLabel>
          <FormHelperText mb={1} mt={0}>
            {t(`${i18nPrefix}.heatingEnergy.hint`)}
          </FormHelperText>
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="suiteHeatingEnergy" />
          </FormHelperText>
          <InputGroup maxW="200px">
            <Input
              type="number"
              step={"any"}
              {...register("suiteHeatingEnergy", { required: t(`${i18nPrefix}.heatingEnergy.error`) })}
            />
            <InputRightElement>{t(`${i18nPrefix}.heatingEnergy.units`)}</InputRightElement>
          </InputGroup>
        </FormControl>
      )}
    </>
  )
}
