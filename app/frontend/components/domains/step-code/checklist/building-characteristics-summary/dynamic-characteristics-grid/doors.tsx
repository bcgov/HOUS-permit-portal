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

export const Doors = observer(function BuildingCharacteristicsSummaryDoors() {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()
  const { control } = useFormContext()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.doorsLines"
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
        {t(`${i18nPrefix}.doors`)}
      </GridColumnHeader>

      {fields.map((field, index) => {
        return (
          <React.Fragment key={`buildingCharacteristicDoors${generateUUID()}`}>
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
              <Controller
                control={control}
                name={`${fieldArrayName}.${index}.performanceType`}
                render={({ field: { onChange, value } }) => (
                  <PerformanceTypeSelect
                    onChange={onChange}
                    value={value}
                    options={selectOptions.buildingCharacteristicsSummary.performanceTypes.doors}
                  />
                )}
              />
            </GridData>
            <GridData borderRightWidth={1} borderTopWidth={index == 0 ? 1 : 0}>
              <TextFormControl fieldName={`${fieldArrayName}.${index}.performanceValue`} />
            </GridData>
          </React.Fragment>
        )
      })}
    </>
  )
})
