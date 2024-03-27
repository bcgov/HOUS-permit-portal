import { t } from "i18next"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { GridColumnHeader } from "../../shared/grid/column-header"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { i18nPrefix } from "../i18n-prefix"

export const Other = function BuildingCharacteristicsSummaryOther() {
  const { control } = useFormContext()
  const fieldArrayName = "buildingCharacteristicsSummaryAttributes.otherLines"
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
        {t(`${i18nPrefix}.other`)}
      </GridColumnHeader>

      {fields.map((field, index) => (
        <React.Fragment key={`${fieldArrayName}.${index}`}>
          <GridData
            colSpan={3}
            gap={1}
            alignItems="start"
            pos="relative"
            borderTopWidth={index == 0 ? 1 : 0}
            borderRightWidth={1}
          >
            <DetailsInput
              fieldName={`${fieldArrayName}.${index}.details`}
              isRemovable={fields.length > 1}
              isLast={index == fields.length - 1}
              onAdd={handleAddLine}
              onRemove={() => remove(index)}
            />
          </GridData>
        </React.Fragment>
      ))}
    </>
  )
}
