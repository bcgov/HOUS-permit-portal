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
    <Checkbox.Root {...checkboxProps} {...restField} checked={!!value}>
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{t("requirementsLibrary.modals.allowMultipleFilesLabel")}</Checkbox.Label>
    </Checkbox.Root>
  )
}
