import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../setup/root"
import { EStepCodeAirtightnessValue } from "../../../../../../types/enums"
import { OptionMenu } from "../../../option-menu"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeAirtightnessValue
}

export const AirtightnessSelect = observer(function AirtightnessSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      placeholder={t(`${i18nPrefix}.airtightnessValue.select`)}
      options={selectOptions.airtightnessValues}
      label={(option) => t(`${i18nPrefix}.airtightnessValue.options.${option}`)}
    />
  )
})
