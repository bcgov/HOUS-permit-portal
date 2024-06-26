import { Stack } from "@chakra-ui/react"
import React from "react"
import { useController } from "react-hook-form"
import {
  GenericContactDisplay,
  TGenericContactDisplayProps,
} from "../requirement-field-display/generic-contact-display"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsOptionalCheckbox, TIsOptionalCheckboxProps } from "./is-optional-checkbox"
import { IControlProps } from "./types"

export type TGenericContactEditProps<TFieldValues> = {
  editableLabelProps: TEditableLabelProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
} & TGenericContactDisplayProps<TFieldValues> &
  IControlProps<TFieldValues>

export function GenericContactEdit<TFieldValues>({
  controlProps,
  editableLabelProps,
  isOptionalCheckboxProps,
  ...contactDisplayProps
}: TGenericContactEditProps<TFieldValues>) {
  const {
    field: { value, ...restField },
  } = useController(controlProps)

  return (
    <Stack spacing={4}>
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
      <IsOptionalCheckbox {...isOptionalCheckboxProps} />
    </Stack>
  )
}
