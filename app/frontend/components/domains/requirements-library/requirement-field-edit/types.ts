import { CheckboxProps } from "@chakra-ui/react"
import { FieldPath, FieldValues, UseControllerProps } from "react-hook-form"

export interface IControlProps<TFieldValues extends FieldValues> {
  controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
}

export type TIsOptionalCheckboxProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<CheckboxProps>

export type TIsElectiveCheckboxProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<CheckboxProps>

export type TIsMultipleFilesCheckboxProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<CheckboxProps>

export type TEditableRichTextProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> & {
  defaultValue?: string | null
  // Placement is linked to a bank question (derive from requirementQuestionId in callers).
  usesBankQuestion?: boolean
  isQuestionBankDefault?: boolean
}

export type TEditableInstructionsTextProps<TFieldValues extends FieldValues> = TEditableRichTextProps<TFieldValues>
