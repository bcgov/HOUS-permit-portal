import { BoxProps, Stack } from "@chakra-ui/react"
import React from "react"
import { ERequirementType } from "../../../../types/enums"
import { TGenericContactDisplayProps } from "../requirement-field-display/generic-contact-display"
import { GenericMultiDisplay } from "../requirement-field-display/generic-multi-display"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsOptionalCheckbox, TIsOptionalCheckboxProps } from "./is-optional-checkbox"
import { IControlProps } from "./types"

export type TPinInfoEditProps<TFieldValues> = {
  editableLabelProps: TEditableLabelProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
  fieldItems: Array<{
    type: ERequirementType
    key: string
    label: string
    required?: boolean
    containerProps?: BoxProps
  }>
} & TGenericContactDisplayProps<TFieldValues> &
  IControlProps<TFieldValues>

export function PidInfoEdit<TFieldValues>({
  controlProps,
  editableLabelProps,
  isOptionalCheckboxProps,
  fieldItems,
  requirementType,
}: TPinInfoEditProps<TFieldValues>) {
  return (
    <Stack spacing={4}>
      <GenericMultiDisplay
        containerProps={{
          borderBottomRadius: "none",
        }}
        requirementType={requirementType}
        fieldItems={fieldItems}
        renderHeading={() => <EditableLabel {...editableLabelProps} />}
      />
      <IsOptionalCheckbox {...isOptionalCheckboxProps} />
    </Stack>
  )
}
