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
    <Checkbox {...checkboxProps} isChecked={value} {...restField}>
      {t("requirementsLibrary.modals.isAnElectiveField")}
    </Checkbox>
  )
}
