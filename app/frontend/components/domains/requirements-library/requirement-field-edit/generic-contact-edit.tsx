import React from "react"
import { useController } from "react-hook-form"
import {
  GenericContactDisplay,
  TGenericContactDisplayProps,
} from "../requirement-field-display/generic-contact-display"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IControlProps } from "./types"

export type TGenericContactEditProps<TFieldValues> = {
  editableLabelProps: TEditableLabelProps<TFieldValues>
} & TGenericContactDisplayProps &
  IControlProps<TFieldValues>

export function GenericContactEdit<TFieldValues>({
  controlProps,
  editableLabelProps,
  ...contactDisplayProps
}: TGenericContactEditProps<TFieldValues>) {
  const {
    field: { value, ...restField },
  } = useController(controlProps)
  return (
    <GenericContactDisplay
      containerProps={{
        borderBottomRadius: "none",
      }}
      renderHeading={() => <EditableLabel {...editableLabelProps} />}
      addMultipleContactProps={{
        switchProps: {
          isChecked: !!value,
          ...restField,
        },
        shouldRender: true,
      }}
      {...contactDisplayProps}
    />
  )
}
