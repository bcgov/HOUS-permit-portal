import { BoxProps, Stack } from "@chakra-ui/react"
import React from "react"
import { ERequirementType } from "../../../../types/enums"
import { GenericMultiDisplay } from "../requirement-field-display/generic-multi-display"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsOptionalCheckbox } from "./is-optional-checkbox"
import { IControlProps, TIsOptionalCheckboxProps } from "./types"

export type TPinInfoEditProps<TFieldValues> = {
  editableLabelProps: TEditableLabelProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
  requirementType: ERequirementType
  fieldItems: Array<{
    type: ERequirementType
    key: string
    label: string
    required?: boolean
    containerProps?: BoxProps
  }>
} & IControlProps<TFieldValues>

export function PidInfoEdit<TFieldValues>({
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
