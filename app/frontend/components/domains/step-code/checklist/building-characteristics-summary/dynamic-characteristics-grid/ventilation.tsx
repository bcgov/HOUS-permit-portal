import { t } from "i18next"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { NumberFormControl, TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"

export const Ventilation = function BuildingCharacteristicsSummaryVentilation() {
  const { control } = useFormContext()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.ventilationLines"
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const handleAddLine = () => {
    append({ details: null, percentEff: null, litersPerSec: null })
  }

  return (
    <>
      <GridColumnHeader colSpan={3} borderRightWidth={1}>
        {t(`${i18nPrefix}.ventilation`)}
      </GridColumnHeader>

      {fields.map((field, index) => {
        GridData.defaultProps = {
          borderTopWidth: index == 0 ? 1 : 0,
        }

        return (
          <React.Fragment key={`${fieldArrayName}.${index}`}>
            <GridData gap={1} alignItems="start" pos="relative">
              <DetailsInput
                fieldName={`${fieldArrayName}.${index}.details`}
                isRemovable={fields.length > 1}
                isLast={index == fields.length - 1}
                onAdd={handleAddLine}
                onRemove={() => remove(index)}
              />
            </GridData>
            <GridData>
              <NumberFormControl
                fieldName={`${fieldArrayName}.${index}.percentEff`}
                hint={index == fields.length - 1 && t(`${i18nPrefix}.percent_eff`)}
              />
            </GridData>
            <GridData borderRightWidth={1}>
              <TextFormControl
                fieldName={`${fieldArrayName}.${index}.litersPerSec`}
                hint={index == fields.length - 1 && t(`${i18nPrefix}.litersPerSec`)}
              />
            </GridData>
          </React.Fragment>
        )
      })}
    </>
  )
}
