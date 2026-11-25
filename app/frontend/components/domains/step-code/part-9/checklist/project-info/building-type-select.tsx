import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../../setup/root"
import { EStepCodeBuildingType } from "../../../../../../types/enums"
import { OptionMenu } from "../../../option-menu"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeBuildingType
  isInvalid?: boolean
}

export const BuildingTypeSelect = observer(function BuildingTypeSelect({ onChange, value, isInvalid }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      placeholder={t(`${i18nPrefix}.buildingType.placeholder`)}
      options={selectOptions.buildingTypes}
      label={(option) => t(`${i18nPrefix}.buildingType.options.${option}`)}
    />
  )
})
