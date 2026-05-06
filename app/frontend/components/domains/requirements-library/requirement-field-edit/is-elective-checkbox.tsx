import { Checkbox } from "@chakra-ui/react"
import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TIsElectiveCheckboxProps } from "./types"

export function IsElectiveCheckbox<TFieldValues extends FieldValues>({
  controlProps,
  ...checkboxProps
}: TIsElectiveCheckboxProps<TFieldValues>) {
  const {
    field: { value, ...restField },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <Checkbox.Root {...checkboxProps} {...restField} checked={value}>
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
      <Checkbox.Label>{t("requirementsLibrary.modals.isAnElectiveField")}</Checkbox.Label>
    </Checkbox.Root>
  )
}
