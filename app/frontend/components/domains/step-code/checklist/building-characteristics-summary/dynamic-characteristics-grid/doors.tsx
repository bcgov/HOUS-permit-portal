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
import { translationPrefix } from "../translation-prefix"
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
        {t(`${translationPrefix}.doors`)}
      </GridColumnHeader>

      {fields.map((field, index) => {
        GridData.defaultProps = {
          borderTopWidth: index == 0 ? 1 : 0,
        }
        return (
          <React.Fragment key={`buildingCharacteristicDoors${generateUUID()}`}>
            <GridData gap={1} alignItems="start" pos="relative">
              <DetailsInput
                fieldName={`${fieldArrayName}.${index}.details`}
                isRemovable={fields.length > 1}
                isLast={index == fields.length - 1}
                onAdd={handleAddLine}
                onRemove={() => remove(index)}
              />
            </GridData>
            <GridData justifyContent="start">
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
            <GridData borderRightWidth={1}>
              <TextFormControl fieldName={`${fieldArrayName}.${index}.performanceValue`} />
            </GridData>
          </React.Fragment>
        )
      })}
    </>
  )
})