import { Stack, StackProps } from "@chakra-ui/react"
import React from "react"
import { FieldValues } from "react-hook-form"
import { EditableHelperText, TEditableHelperTextProps } from "./editable-helper-text"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsElectiveCheckbox, TIsElectiveCheckboxProps } from "./is-elective-checkbox"
import { IsOptionalCheckbox, TIsOptionalCheckboxProps } from "./is-optional-checkbox"

export type TEditableGroupProps<TFieldValues extends FieldValues> = {
  editableLabelProps?: TEditableLabelProps<TFieldValues>
  editableHelperTextProps?: TEditableHelperTextProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
  isElectiveCheckboxProps: TIsElectiveCheckboxProps<TFieldValues>
  editableInput?: JSX.Element
  multiOptionEditableInput?: JSX.Element
} & Partial<StackProps>

export function EditableGroup<TFieldValues>({
  editableLabelProps,
  editableHelperTextProps,
  editableInput,
  multiOptionEditableInput,
  isOptionalCheckboxProps,
  isElectiveCheckboxProps,
  ...containerProps
}: TEditableGroupProps<TFieldValues>) {
  return (
    <Stack spacing={4} {...containerProps}>
      <EditableLabel {...editableLabelProps} />
      {editableInput}
      {editableInput && <EditableHelperText {...editableHelperTextProps} />}
      {multiOptionEditableInput && (
        <Stack>
          {multiOptionEditableInput}
          <EditableHelperText {...editableHelperTextProps} />
        </Stack>
      )}
      <IsOptionalCheckbox {...isOptionalCheckboxProps} />
      <IsElectiveCheckbox mt={"0.625rem"} {...isElectiveCheckboxProps} />
    </Stack>
  )
}
