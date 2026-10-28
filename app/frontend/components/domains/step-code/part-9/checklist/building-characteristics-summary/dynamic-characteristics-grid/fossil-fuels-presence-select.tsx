import { t } from "i18next"
import React from "react"
import { EFossilFuelsPresence } from "../../../../../../../types/enums"
import { OptionMenu } from "../../../../option-menu"
import { i18nPrefix } from "../i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EFossilFuelsPresence
  options: EFossilFuelsPresence[]
}

export const FossilFuelsPresenceSelect = ({ onChange, value, options }: IProps) => {
  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      options={options}
      placeholder={t("ui.select")}
      label={(option) => t(`${i18nPrefix}.fossilFuels.${option}`)}
    />
  )
}
