import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  EditableInputWithControls,
  IEditableInputWithControlsProps,
} from "../../../shared/editable-input-with-controls"
import { IControlProps } from "./types"

export type TEditableLabelProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<IEditableInputWithControlsProps>

export function EditableLabel<TFieldValues extends FieldValues>({
  controlProps,
  ...editableLabelProps
}: TEditableLabelProps<TFieldValues>) {
  const {
    field: { onChange, value },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <EditableInputWithControls
      initialHint={t("ui.clickToEdit")}
      defaultValue={(value as string) || t("requirementsLibrary.modals.defaultRequirementLabel")}
      onSubmit={onChange}
      onCancel={onChange}
      {...editableLabelProps}
    />
  )
}
