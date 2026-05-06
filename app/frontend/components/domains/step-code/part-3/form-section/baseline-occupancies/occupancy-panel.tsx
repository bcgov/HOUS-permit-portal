import { InputGroup } from "@/components/ui/input-group"
import { Radio, RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Input, InputElement, Stack } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { EBaselinePerformanceRequirement } from "../../../../../../types/enums"
import { IBaselineOccupancy } from "../../../../../../types/types"

interface IProps {
  occupancy: IBaselineOccupancy
  idx: number
}

export const OccupancyPanel = observer(function Part3StepCodeFormBaselineDetails({ occupancy, idx }: IProps) {
  const { register, control, getValues, formState, resetField, setValue } = useFormContext()
  const { errors } = formState

  const i18nPrefix = "stepCode.part3.baselineDetails"
  const oci18nPrefix = "stepCode.part3.baselineOccupancyKeys"

  const [isCustomRequirement, setIsCustomRequirement] = useState(
    getValues(`baselineOccupanciesAttributes.${idx}.requirementSource`) ? "yes" : "no"
  )

  useEffect(() => {
    if (isCustomRequirement == "no") {
      // reset the requirementSource field and clear the value
      resetField(`baselineOccupanciesAttributes.${idx}.requirementSource`)
      setValue(`baselineOccupanciesAttributes.${idx}.requirementSource`, "")
    }
  }, [isCustomRequirement])

  return (
    <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
      <Field.Root>
        <Field.Label>
          {t(`${i18nPrefix}.modelledFloorArea.label`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </Field.Label>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.modelledFloorArea`} />
        </Field.HelperText>
        <InputGroup maxW={"200px"}>
          <Input
            type="number"
            {...register(`baselineOccupanciesAttributes.${idx}.modelledFloorArea`, {
              required: t(`${i18nPrefix}.modelledFloorArea.error`, {
                occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
              }),
            })}
          />
          <InputElement placement="end" pointerEvents="none">
            <Trans
              i18nKey={`${i18nPrefix}.modelledFloorArea.units`}
              components={{
                sup: <sup />,
              }}
            />
          </InputElement>
        </InputGroup>
      </Field.Root>
      <Field.Root>
        <Field.Label pb={1}>
          {t(`${i18nPrefix}.performanceRequirement.label`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </Field.Label>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.performanceRequirement`} />
        </Field.HelperText>
        <Controller
          name={`baselineOccupanciesAttributes.${idx}.performanceRequirement`}
          control={control}
          rules={{
            required: t(`${i18nPrefix}.performanceRequirement.error`, {
              occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
            }),
          }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup.Root defaultValue={value} onValueChange={onChange}>
              <Stack gap={1}>
                {Object.values(EBaselinePerformanceRequirement).map((requirement) => (
                  <Radio key={requirement} value={requirement}>
                    {t(`stepCode.part3.performanceRequirements.${requirement}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup.Root>
          )}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          {t(`${i18nPrefix}.isCustomRequirement`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </Field.Label>
        <RadioGroup.Root onValueChange={setIsCustomRequirement} value={isCustomRequirement}>
          <Stack gap={5} direction="row">
            <RadioGroup.Item variant="binary" value={"yes"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.yes")}</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item variant="binary" value={"no"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.no")}</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
      </Field.Root>
      {isCustomRequirement == "yes" && (
        <Field.Root>
          <Field.Label>{t(`${i18nPrefix}.requirementSource.label`)}</Field.Label>
          <Field.HelperText mb={1} mt={0} maxW={"430px"}>
            {t(`${i18nPrefix}.requirementSource.hint`)}
          </Field.HelperText>
          <Field.HelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.requirementSource`} />
          </Field.HelperText>
          <Input
            {...register(`baselineOccupanciesAttributes.${idx}.requirementSource`, {
              required: t(`${i18nPrefix}.requirementSource.error`, {
                occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
              }),
            })}
          />
        </Field.Root>
      )}
    </Flex>
  )
})
