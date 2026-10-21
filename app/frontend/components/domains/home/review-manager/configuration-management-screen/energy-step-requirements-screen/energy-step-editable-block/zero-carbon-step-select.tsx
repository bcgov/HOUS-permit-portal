import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../../setup/root"
import { EZeroCarbonStep } from "../../../../../../../types/enums"
import { OptionMenu } from "../../../../../step-code/option-menu"
import { i18nPrefix } from "../i18n-prefix"

const NOT_REQUIRED = "__not_required__"

interface IProps {
  onChange: (event: any) => void
  value: EZeroCarbonStep
  isDisabled?: boolean
  allowNull?: boolean
}

export const ZeroCarbonStepSelect = observer(function ZeroCarbonStepSelect({
  onChange,
  value,
  isDisabled,
  allowNull,
}: IProps) {
  const {
    stepCodeStore: { getZeroCarbonStepOptions },
  } = useMst()
  const options = getZeroCarbonStepOptions(allowNull).map((option) => option || NOT_REQUIRED)

  return (
    <OptionMenu
      isDisabled={isDisabled}
      value={value === undefined || value === null ? undefined : value || NOT_REQUIRED}
      onChange={(option) => onChange(option === NOT_REQUIRED ? 0 : option)}
      placeholder={t("ui.selectPlaceholder")}
      options={options}
      label={(option) =>
        option === NOT_REQUIRED
          ? t(`${i18nPrefix}.notRequired`)
          : t(`${i18nPrefix}.stepRequired.zeroCarbon.options.${option}`)
      }
    />
  )
})
