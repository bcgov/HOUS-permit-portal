import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { useMst } from "../../../../../../../setup/root"
import { NumberFormControl } from "../../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"
import { PerformanceTypeSelect } from "./performance-type-select"

// HUB-5472: Rev. 7 removes Principal/Secondary system-type separations in favour
// of four open detail lines (Doors/Hot water pattern). Line count is padded in
// defaultFormValues; MEUI cooling coverage is unchanged (HOT2000-driven).
export const SpaceHeatingCooling = observer(function StepCodeBuildingCharacteristicsSpaceHeatingCooling() {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()
  const { control } = useFormContext()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.spaceHeatingCoolingLines"
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const handleAddLine = () => {
    append({ details: null, performanceType: null, performanceValue: null })
  }

  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.spaceHeatingCooling`)}
      </GridColumnHeader>

      {fields.map((field, index) => (
        <React.Fragment key={field.id}>
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
                  options={selectOptions.buildingCharacteristicsSummary.performanceTypes.spaceHeatingCooling}
                />
              )}
            />
          </GridData>
          <GridData borderTopWidth={index == 0 ? 1 : 0} borderRightWidth={1}>
            <NumberFormControl fieldName={`${fieldArrayName}.${index}.performanceValue`} />
          </GridData>
        </React.Fragment>
      ))}
    </>
  )
})
