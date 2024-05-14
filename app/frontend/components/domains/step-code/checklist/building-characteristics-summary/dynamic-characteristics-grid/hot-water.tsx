import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { useMst } from "../../../../../../setup/root"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"
import { PerformanceTypeSelect } from "./performance-type-select"

export const HotWater = observer(function BuildingCharacteristicsSummaryHotWater() {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()
  const { control } = useFormContext()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.hotWaterLines"
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const handleAddLine = () => {
    append({ performanceType: null, details: null, performanceValue: null })
  }

  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.hotWater`)}
      </GridColumnHeader>

      {fields.map((field, index) => (
        <React.Fragment key={`${fieldArrayName}.${index}`}>
          <GridData gap={1} alignItems="start" pos="relative" borderTopWidth={index == 0 ? 1 : 0}>
            <DetailsInput
              fieldName={`${fieldArrayName}.${index}.details`}
              isRemovable={fields.length > 1}
              isLast={index == fields.length - 1}
              onAdd={handleAddLine}
              onRemove={() => remove(index)}
            />
          </GridData>
          <GridData borderTopWidth={index == 0 ? 1 : 0} justifyContent="start">
            <Controller
              control={control}
              name={`${fieldArrayName}.${index}.performanceType`}
              render={({ field: { onChange, value } }) => (
                <PerformanceTypeSelect
                  onChange={onChange}
                  value={value}
                  options={selectOptions.buildingCharacteristicsSummary.performanceTypes.hotWater}
                />
              )}
            />
          </GridData>
          <GridData borderTopWidth={index == 0 ? 1 : 0} borderRightWidth={1}>
            <TextFormControl fieldName={`${fieldArrayName}.${index}.performanceValue`} />
          </GridData>
        </React.Fragment>
      ))}
    </>
  )
})
