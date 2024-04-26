import { Checkbox, CheckboxProps } from "@chakra-ui/react"
import React from "react"
import { FieldValues, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IControlProps } from "./types"

export type TIsOptionalCheckboxProps<TFieldValues extends FieldValues> = IControlProps<TFieldValues> &
  Partial<CheckboxProps>

export function IsOptionalCheckbox<TFieldValues extends FieldValues>({
  controlProps,
  ...checkboxProps
}: TIsOptionalCheckboxProps<TFieldValues>) {
  const {
    field: { value, onChange, ...restField },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    //   This is checked inverse of the boolean value. This is because the db field is for "required", instead of
    //   optional, and by default it should be required

    <Checkbox
      {...checkboxProps}
      isChecked={value === undefined ? value : !value}
      onChange={(e) => {
        onChange(!e.target.checked)
      }}
      {...restField}
    >
      {t("requirementsLibrary.modals.optionalForSubmitters")}
    </Checkbox>
  )
}
