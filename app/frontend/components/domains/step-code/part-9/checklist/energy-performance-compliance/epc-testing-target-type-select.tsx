import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../setup/root"
import { EStepCodeEPCTestingTargetType } from "../../../../../../types/enums"
import { OptionMenu } from "../../../option-menu"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeEPCTestingTargetType
}

export const EPCTestingTargetTypeSelect = observer(function EPCTestingTargetTypeSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      placeholder={t(`${i18nPrefix}.epcTestingTargetType.select`)}
      options={selectOptions.epcTestingTargetTypes}
      label={(option) => t(`${i18nPrefix}.epcTestingTargetType.options.${option}`)}
    />
  )
})
