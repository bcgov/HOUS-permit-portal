import { Stack, StackProps } from "@chakra-ui/react"
import React from "react"
import { FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EEnergyStepCodeDependencyRequirementCode } from "../../../../types/enums"
import { isStepCodePackageFileRequirementCode } from "../../../../utils/utility-functions"
import { EditableHelperText, TEditableHelperTextProps } from "./editable-helper-text"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsElectiveCheckbox } from "./is-elective-checkbox"
import { IsMultipleFilesCheckbox } from "./is-multiple-files-checkbox"
import { IsOptionalCheckbox } from "./is-optional-checkbox"
import { TIsElectiveCheckboxProps, TIsMultipleFilesCheckboxProps, TIsOptionalCheckboxProps } from "./types"

export type TEditableGroupProps<TFieldValues extends FieldValues> = {
  editableLabelProps?: TEditableLabelProps<TFieldValues>
  editableHelperTextProps?: TEditableHelperTextProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
  isElectiveCheckboxProps: TIsElectiveCheckboxProps<TFieldValues>
  isMultipleFilesCheckboxProps?: TIsMultipleFilesCheckboxProps<TFieldValues>
  editableInput?: JSX.Element
  multiOptionEditableInput?: JSX.Element
  requirementCode: string
} & Partial<StackProps>

export function EditableGroup<TFieldValues>({
  editableLabelProps,
  editableHelperTextProps,
  editableInput,
  multiOptionEditableInput,
  isOptionalCheckboxProps,
  isElectiveCheckboxProps,
  isMultipleFilesCheckboxProps,
  requirementCode,
  ...containerProps
}: TEditableGroupProps<TFieldValues>) {
  const { t } = useTranslation()
  const isEditLimited =
    isStepCodePackageFileRequirementCode(requirementCode) ||
    Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
      requirementCode as EEnergyStepCodeDependencyRequirementCode
    )
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
      {isMultipleFilesCheckboxProps && (
        <IsMultipleFilesCheckbox isDisabled={isEditLimited} mt={2} {...isMultipleFilesCheckboxProps} />
      )}
      <IsOptionalCheckbox isDisabled={isEditLimited} mt={2} {...isOptionalCheckboxProps} />
      <IsElectiveCheckbox isDisabled={isEditLimited} mt={2} {...isElectiveCheckboxProps} />
    </Stack>
  )
}
