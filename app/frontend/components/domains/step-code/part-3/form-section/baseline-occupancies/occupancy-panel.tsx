import {
  Flex,
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
      <FormControl>
        <FormLabel>
          {t(`${i18nPrefix}.modelledFloorArea.label`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </FormLabel>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.modelledFloorArea`} />
        </FormHelperText>
        <InputGroup maxW={"200px"}>
          <Input
            type="number"
            {...register(`baselineOccupanciesAttributes.${idx}.modelledFloorArea`, {
              required: t(`${i18nPrefix}.modelledFloorArea.error`, {
                occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
              }),
            })}
          />
          <InputRightElement pointerEvents="none">
            <Trans
              i18nKey={`${i18nPrefix}.modelledFloorArea.units`}
              components={{
                sup: <sup />,
              }}
            />
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel pb={1}>
          {t(`${i18nPrefix}.performanceRequirement.label`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </FormLabel>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.performanceRequirement`} />
        </FormHelperText>
        <Controller
          name={`baselineOccupanciesAttributes.${idx}.performanceRequirement`}
          control={control}
          rules={{
            required: t(`${i18nPrefix}.performanceRequirement.error`, {
              occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
            }),
          }}
          render={({ field: { onChange, value } }) => (
            <RadioGroup defaultValue={value} onChange={onChange}>
              <Stack spacing={1}>
                {Object.values(EBaselinePerformanceRequirement).map((requirement) => (
                  <Radio key={requirement} value={requirement}>
                    {t(`stepCode.part3.performanceRequirements.${requirement}`)}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          )}
        />
      </FormControl>

      <FormControl>
        <FormLabel>
          {t(`${i18nPrefix}.isCustomRequirement`, { occupancyName: t(`${oci18nPrefix}.${occupancy.key}`) })}
        </FormLabel>
        <RadioGroup onChange={setIsCustomRequirement} value={isCustomRequirement}>
          <Stack spacing={5} direction="row">
            <Radio variant="binary" value={"yes"}>
              {t("ui.yes")}
            </Radio>
            <Radio variant="binary" value={"no"} defaultChecked>
              {t("ui.no")}
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      {isCustomRequirement == "yes" && (
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.requirementSource.label`)}</FormLabel>
          <FormHelperText mb={1} mt={0} maxW={"430px"}>
            {t(`${i18nPrefix}.requirementSource.hint`)}
          </FormHelperText>
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name={`baselineOccupanciesAttributes.${idx}.requirementSource`} />
          </FormHelperText>
          <Input
            {...register(`baselineOccupanciesAttributes.${idx}.requirementSource`, {
              required: t(`${i18nPrefix}.requirementSource.error`, {
                occupancyName: t(`${oci18nPrefix}.${occupancy.key}`),
              }),
            })}
          />
        </FormControl>
      )}
    </Flex>
  )
})
