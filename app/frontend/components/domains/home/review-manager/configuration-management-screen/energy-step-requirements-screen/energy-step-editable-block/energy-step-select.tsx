import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../../setup/root"
import { EEnergyStep } from "../../../../../../../types/enums"
import { OptionMenu } from "../../../../../step-code/option-menu"
import { i18nPrefix } from "../i18n-prefix"

const NOT_REQUIRED = "__not_required__"

interface IProps {
  onChange: (event: any) => void
  value: EEnergyStep
  isDisabled?: boolean
  allowNull?: boolean
}

export const EnergyStepSelect = observer(function EnergyStepSelect({ onChange, value, isDisabled, allowNull }: IProps) {
  const {
    stepCodeStore: { getEnergyStepOptions },
  } = useMst()
  const options = getEnergyStepOptions(allowNull).map((option) => option || NOT_REQUIRED)

  return (
    <OptionMenu
      isDisabled={isDisabled}
      value={value === undefined ? undefined : value || NOT_REQUIRED}
      onChange={(option) => onChange(option === NOT_REQUIRED ? null : option)}
      placeholder={t("ui.selectPlaceholder")}
      options={options}
      label={(option) =>
        option === NOT_REQUIRED
          ? t(`${i18nPrefix}.notRequired`)
          : t(`${i18nPrefix}.stepRequired.energy.options.${option}`)
      }
    />
  )
})
