import { Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { useMst } from "../../../../../../setup/root"
import { ESpaceHeatingCoolingVariant } from "../../../../../../types/enums"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"
import { PerformanceTypeSelect } from "./performance-type-select"

export const SpaceHeatingCooling = observer(function StepCodeBuildingCharacteristicsSpaceHeatingCooling() {
  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.spaceHeatingCooling`)}
      </GridColumnHeader>
      <GridData alignItems="start">
        <Text color="text.primary" fontWeight="bold" fontSize="md">
          {t(`${i18nPrefix}.principal`)}
        </Text>
      </GridData>
      <GridData />
      <GridData borderRightWidth={1} />
      <Fields variant={ESpaceHeatingCoolingVariant.principal} />
      <GridData alignItems="start">
        <Text color="text.primary" fontWeight="bold" fontSize="md">
          {t(`${i18nPrefix}.secondary`)}
        </Text>
      </GridData>
      <GridData />
      <GridData borderRightWidth={1} />
      <Fields variant={ESpaceHeatingCoolingVariant.secondary} />
    </>
  )
})

interface IFieldsProps {
  variant: ESpaceHeatingCoolingVariant
}

const Fields = observer(({ variant }: IFieldsProps) => {
  const { control } = useFormContext()
  const {
    stepCodeStore: { selectOptions },
  } = useMst()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.spaceHeatingCoolingLines"
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const getIndex = (field) => R.findIndex((f) => f.id == field.id, fields)

  // @ts-ignore
  const variantFields = R.filter((f) => f.variant == variant, fields)

  const onAdd = () => {
    append({ variant, details: null, performanceType: null, performanceValue: null })
  }

  return variantFields.map((field, index) => {
    const trueIndex = getIndex(field)
    return (
      <React.Fragment key={`${fieldArrayName}.${trueIndex}`}>
        <GridData alignItems="start" pos="relative" borderTopWidth={0}>
          <DetailsInput
            fieldName={`${fieldArrayName}.${trueIndex}.details`}
            isRemovable={variantFields.length > 1}
            isLast={index == variantFields.length - 1}
            onAdd={onAdd}
            onRemove={() => remove(trueIndex)}
          />
        </GridData>
        <GridData borderTopWidth={0} justifyContent="start">
          <Controller
            control={control}
            name={`${fieldArrayName}.${trueIndex}.performanceType`}
            render={({ field: { onChange, value } }) => (
              <PerformanceTypeSelect
                onChange={onChange}
                value={value}
                options={selectOptions.buildingCharacteristicsSummary.performanceTypes.spaceHeatingCooling}
              />
            )}
          />
        </GridData>
        <GridData borderTopWidth={0} borderRightWidth={1}>
          <TextFormControl fieldName={`${fieldArrayName}.${trueIndex}.performanceValue`} />
        </GridData>
      </React.Fragment>
    )
  })
})
