import { Checkbox } from "@chakra-ui/react"
import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TIsMultipleFilesCheckboxProps } from "./types" // Import the correct type

export function IsMultipleFilesCheckbox<TFieldValues extends FieldValues>({
  controlProps,
  ...checkboxProps
}: TIsMultipleFilesCheckboxProps<TFieldValues>) {
  const {
    field: { value, ...restField },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <Checkbox {...checkboxProps} isChecked={!!value} {...restField}>
      {t("requirementsLibrary.modals.allowMultipleFilesLabel")}
    </Checkbox>
  )
}
