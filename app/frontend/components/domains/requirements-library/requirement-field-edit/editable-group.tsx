import { Stack, StackProps, useDisclosure } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EEnergyStepCodeDependencyRequirementCode, ERequirementType } from "../../../../types/enums"
import { isStepCodePackageFileRequirementCode } from "../../../../utils/utility-functions"
import { EditableHelperText, TEditableHelperTextProps } from "./editable-helper-text"
import { EditableInstructionsText, TEditableInstructionsTextProps } from "./editable-instructions-text"
import { EditableLabel, TEditableLabelProps } from "./editable-label"
import { IsElectiveCheckbox } from "./is-elective-checkbox"
import { IsMultipleFilesCheckbox } from "./is-multiple-files-checkbox"
import { IsOptionalCheckbox } from "./is-optional-checkbox"
import { TIsElectiveCheckboxProps, TIsMultipleFilesCheckboxProps, TIsOptionalCheckboxProps } from "./types"

export type TEditableGroupProps<TFieldValues extends FieldValues> = {
  requirementCode?: ERequirementType
  editableLabelProps: TEditableLabelProps<TFieldValues>
  editableHelperTextProps?: TEditableHelperTextProps<TFieldValues>
  isOptionalCheckboxProps: TIsOptionalCheckboxProps<TFieldValues>
  isElectiveCheckboxProps: TIsElectiveCheckboxProps<TFieldValues>
  isMultipleFilesCheckboxProps?: TIsMultipleFilesCheckboxProps<TFieldValues>
  multiOptionEditableInput?: JSX.Element
  label: string
  helperText?: string
  editableInput?: ReactNode
  editableInstructionsTextProps?: TEditableInstructionsTextProps<TFieldValues>
} & Partial<StackProps>

export function EditableGroup<TFieldValues>({
  requirementCode,
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
  ...containerProps
}: TEditableGroupProps<TFieldValues>) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isEditLimited =
    isStepCodePackageFileRequirementCode(requirementCode) ||
    Object.values(EEnergyStepCodeDependencyRequirementCode).includes(
      requirementCode as EEnergyStepCodeDependencyRequirementCode
    )

  return (
    <Stack spacing={4} {...containerProps}>
      <EditableLabel {...editableLabelProps} />
      <EditableInstructionsText {...editableInstructionsTextProps} />
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
