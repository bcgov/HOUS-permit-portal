import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { generateUUID } from "../../../../../../utils/utility-functions"
import { TextFormControl } from "../../../../../shared/form/input-form-control"
import { GridData } from "../../shared/grid/data"
import { DetailsInput } from "../details-input"
import { RowHeader } from "../row-header"

interface IProps {
  fieldArrayName: string
  rowName: string
  isLast?: boolean
}

export const Characteristic = function StaticCharacteristic({ fieldArrayName, rowName, isLast = false }: IProps) {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName,
  })

  const handleAddLine = () => {
    append({ details: null, rsi: null })
  }

  return (
    <>
      {fields.map((field, index) => (
        <React.Fragment key={`buildingCharacteristic${rowName}${generateUUID()}`}>
          {index == 0 && (
            <RowHeader
              rowSpan={fields.length}
              borderTopWidth={1}
              borderLeftWidth={1}
              borderBottomWidth={isLast ? 1 : 0}
            >
              {rowName}
            </RowHeader>
          )}
          <GridData
            gap={1}
            pos="relative"
            borderTopWidth={index == 0 ? 1 : 0}
            borderBottomWidth={isLast && index == fields.length - 1 ? 1 : 0}
          >
            <DetailsInput
              fieldName={`${fieldArrayName}.${index}.details`}
              isRemovable={fields.length > 1}
              isLast={index == fields.length - 1}
              onAdd={handleAddLine}
              onRemove={() => remove(index)}
            />
          </GridData>
          <GridData
            borderRightWidth={1}
            borderTopWidth={index == 0 ? 1 : 0}
            borderBottomWidth={isLast && index == fields.length - 1 ? 1 : 0}
          >
            <TextFormControl fieldName={`${fieldArrayName}.${index}.rsi`} />
          </GridData>
        </React.Fragment>
      ))}
    </>
  )
}
