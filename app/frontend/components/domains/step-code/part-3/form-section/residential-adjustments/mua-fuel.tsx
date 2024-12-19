import { FormControl, FormHelperText, IconButton, Input, InputGroup, InputRightElement } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { Controller, UseFieldArrayRemove, useFormContext } from "react-hook-form"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { IMakeUpAirFuel } from "../../../../../../types/types"
import FuelTypeSelect from "../../../../../shared/select/selectors/fuel-type-select"
import { GridData } from "../../../step-generic/shared/grid/data"

interface IMUAFuelProps {
  field: IMakeUpAirFuel
  idx: number
  remove: UseFieldArrayRemove
}

export const MUAFuelRow = observer(function MUAFuelRow({ field, idx, remove }: IMUAFuelProps) {
  const i18nPrefix = "stepCode.part3.residentialAdjustments"
  const { checklist } = usePart3StepCode()
  const { register, control, formState, watch, trigger, getValues, setValue } = useFormContext()
  const { errors } = formState

  const watchFuelTypeId = watch(`makeUpAirFuelsAttributes.${idx}.fuelTypeId`)
  const watchPercentOfLoad = watch(`makeUpAirFuelsAttributes.${idx}.percentOfLoad`)

  const handleRemove = () => {
    if (getValues(`makeUpAirFuelsAttributes.${idx}.id`)) {
      setValue(`makeUpAirFuelsAttributes.${idx}._destroy`, true)
      setValue(`makeUpAirFuelsAttributes.${idx}.percentOfLoad`, undefined)
    } else {
      remove(idx)
    }
  }

  const emissionsFactor = useMemo(() => {
    const fuelType = checklist.fuelType(watchFuelTypeId)
    return fuelType?.emissionsFactor
  }, [watchFuelTypeId])

  useEffect(() => {
    if (errors.makeUpAirFuelsAttributes?.root) {
      trigger()
    }
  }, [watchPercentOfLoad])

  return (
    <>
      <GridData px={3}>
        <FormControl>
          <Controller
            control={control}
            rules={{
              required: t(`${i18nPrefix}.muaFuel.mixture.fuelType.error`),
            }}
            name={`makeUpAirFuelsAttributes.${idx}.fuelTypeId`}
            render={({ field: { onChange, value } }) => (
              <FuelTypeSelect
                options={checklist.fuelTypeSelectOptions}
                onChange={onChange}
                value={value}
                selectProps={{
                  isClearable: true,
                  styles: {
                    container: (base) => ({
                      ...base,
                      width: "100%",
                      boxShadow: "none",
                    }),
                  },
                }}
              />
            )}
          />
          <FormHelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`makeUpAirFuelsAttributes.${idx}.fuelTypeId`} />
          </FormHelperText>
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <Input value={emissionsFactor || ""} isDisabled />
        </FormControl>
      </GridData>
      <GridData>
        <FormControl pos="relative">
          <InputGroup>
            <Input
              {...register(`makeUpAirFuelsAttributes.${idx}.percentOfLoad`, {
                required: t(`${i18nPrefix}.muaFuel.mixture.percentOfLoad.error`),
              })}
            />
            <InputRightElement>{t(`${i18nPrefix}.muaFuel.mixture.percentOfLoad.units`)}</InputRightElement>
          </InputGroup>
          <FormHelperText color="semantic.error">
            <ErrorMessage errors={errors} name={`makeUpAirFuelsAttributes.${idx}.percentOfLoad`} />
          </FormHelperText>
          {idx > 1 && (
            <IconButton
              aria-label={t("ui.remove")}
              pos="absolute"
              right={-14}
              top={0}
              bottom={0}
              margin="auto"
              variant="link"
              icon={<X />}
              onClick={handleRemove}
            />
          )}
        </FormControl>
      </GridData>
    </>
  )
})
