import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { useMst } from "../../../../../../setup/root"
import { generateUUID } from "../../../../../../utils/utility-functions"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"
import { PerformanceTypeSelect } from "./performance-type-select"

export const WindowsGlazedDoors = observer(function WindowsGlazedDoors() {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  const { control } = useFormContext()
  const fieldPrefix = "buildingCharacteristicsSummaryAttributes.windowsGlazedDoors"
  const fieldArrayName = `${fieldPrefix}.lines`
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const handleAddLine = () => {
    append({ peformanceType: null, details: null, performanceValue: null, shgc: null })
  }

  return (
    <>
      <GridColumnHeader>{t(`${i18nPrefix}.windowsGlazedDoors`)}</GridColumnHeader>
      <GridColumnHeader>
        <Controller
          control={control}
          name={`${fieldPrefix}.performanceType`}
          render={({ field: { onChange, value } }) => (
            <PerformanceTypeSelect
              onChange={onChange}
              value={value}
              options={selectOptions.buildingCharacteristicsSummary.performanceTypes.windowsGlazedDoors}
            />
          )}
        />
      </GridColumnHeader>
      <GridColumnHeader borderRightWidth={1}>
        <TextFormControl inputProps={{ isDisabled: true, value: t(`${i18nPrefix}.shgc`) }} />
      </GridColumnHeader>
      {fields.map((field, index) => (
        <React.Fragment key={`buildingCharacteristicWindowsGlazedDoors${generateUUID()}`}>
          <GridData gap={1} pos="relative" borderTopWidth={index == 0 ? 1 : 0}>
            <DetailsInput
              fieldName={`${fieldArrayName}.${index}.details`}
              isRemovable={fields.length > 1}
              isLast={index == fields.length - 1}
              onAdd={handleAddLine}
              onRemove={() => remove(index)}
            />
          </GridData>
          <GridData borderTopWidth={index == 0 ? 1 : 0}>
            <TextFormControl fieldName={`${fieldArrayName}.${index}.performanceValue`} />
          </GridData>
          <GridData borderTopWidth={index == 0 ? 1 : 0} borderRightWidth={1}>
            <TextFormControl fieldName={`${fieldArrayName}.${index}.shgc`} />
          </GridData>
        </React.Fragment>
      ))}
    </>
  )
})
