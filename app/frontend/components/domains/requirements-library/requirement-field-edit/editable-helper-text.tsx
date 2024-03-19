import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  EditableInputWithControls,
  IEditableInputWithControlsProps,
} from "../../../shared/editable-input-with-controls"
import { IControlProps } from "./types"

export type TEditableHelperTextProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<IEditableInputWithControlsProps>

export function EditableHelperText<TFieldValues extends FieldValues>({
  controlProps,
  ...editableHelperTextProps
}: TEditableHelperTextProps<TFieldValues>) {
  const {
    field: { onChange, value },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <EditableInputWithControls
      initialHint={t("requirementsLibrary.modals.addHelpText")}
      placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
      defaultValue={(value as string) || ""}
      onSubmit={onChange}
      onCancel={onChange}
      {...editableHelperTextProps}
    />
  )
}
