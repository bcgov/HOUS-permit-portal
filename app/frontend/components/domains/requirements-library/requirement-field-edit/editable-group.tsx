import { Stack, StackProps } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EEnergyStepCodeDependencyRequirementCode, ERequirementType } from "../../../../types/enums"
import { isArchitecturalDrawingRequirement } from "../../../../utils/utility-functions"
import { EditableHelperText, TEditableHelperTextProps } from "./editable-helper-text"
import { EditableInstructionsText, TEditableInstructionsTextProps } from "./editable-instructions-text"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsElectiveCheckbox } from "./is-elective-checkbox"
import { IsMultipleFilesCheckbox } from "./is-multiple-files-checkbox"
import { IsOptionalCheckbox } from "./is-optional-checkbox"
import { TIsElectiveCheckboxProps, TIsMultipleFilesCheckboxProps, TIsOptionalCheckboxProps } from "./types"

export type TEditableGroupProps<TFieldValues extends FieldValues> = {
  requirementCode?: string
  requirementType?: ERequirementType
  editableLabelProps: TEditableLabelProps<TFieldValues>
  editableHelperTextProps?: TEditableHelperTextProps<TFieldValues>
  isOptionalCheckboxProps?: TIsOptionalCheckboxProps<TFieldValues>
  isElectiveCheckboxProps?: TIsElectiveCheckboxProps<TFieldValues>
  isMultipleFilesCheckboxProps?: TIsMultipleFilesCheckboxProps<TFieldValues>
  multiOptionEditableInput?: JSX.Element
  label: string
  helperText?: string
  editableInput?: ReactNode
  editableInstructionsTextProps?: TEditableInstructionsTextProps<TFieldValues>
  /** Shared bank questions: definition fields are owned by the Question bank, not the block. */
  lockDefinition?: boolean
} & Partial<StackProps>

export function EditableGroup<TFieldValues>({
  requirementCode,
  requirementType,
  editableLabelProps,
  editableHelperTextProps,
  isOptionalCheckboxProps,
  isElectiveCheckboxProps,
  isMultipleFilesCheckboxProps,
  multiOptionEditableInput,
  label,
  helperText,
  editableInput,
  editableInstructionsTextProps,
  lockDefinition = false,
  ...containerProps
}: TEditableGroupProps<TFieldValues>) {
  const { t } = useTranslation()
  const isEnergyStepCodeDependency = Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
    requirementCode as EEnergyStepCodeDependencyRequirementCode
  )
  const isArchitecturalDependency = isArchitecturalDrawingRequirement(requirementType)
  const isEditLimited = isEnergyStepCodeDependency || isArchitecturalDependency

  return (
    <Stack spacing={4} {...containerProps}>
      <EditableInstructionsText {...editableInstructionsTextProps} />
      <EditableLabel {...editableLabelProps} isDisabled={lockDefinition || editableLabelProps.isDisabled} />
      {editableInput}
      {editableInput && <EditableHelperText {...editableHelperTextProps} />}
      {multiOptionEditableInput && (
        <Stack>
          {multiOptionEditableInput}
          <EditableHelperText {...editableHelperTextProps} />
        </Stack>
      )}
      {isMultipleFilesCheckboxProps && (
        <IsMultipleFilesCheckbox
          isDisabled={isEditLimited || lockDefinition}
          mt={2}
          {...isMultipleFilesCheckboxProps}
        />
      )}
      {isOptionalCheckboxProps && <IsOptionalCheckbox isDisabled={isEditLimited} mt={2} {...isOptionalCheckboxProps} />}
      {isElectiveCheckboxProps && <IsElectiveCheckbox isDisabled={isEditLimited} mt={2} {...isElectiveCheckboxProps} />}
    </Stack>
  )
}
