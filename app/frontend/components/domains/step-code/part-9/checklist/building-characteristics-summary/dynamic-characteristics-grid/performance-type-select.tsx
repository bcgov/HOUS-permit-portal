import { t } from "i18next"
import React from "react"
import {
  EDoorsPerformanceType,
  EHotWaterPerformanceType,
  ESpaceHeatingCoolingPerformanceType,
  EWindowsGlazedDoorsPerformanceType,
} from "../../../../../../../types/enums"
import { OptionMenu } from "../../../../option-menu"
import { i18nPrefix } from "../i18n-prefix"

type TPerformanceType =
  | EWindowsGlazedDoorsPerformanceType
  | EDoorsPerformanceType
  | ESpaceHeatingCoolingPerformanceType
  | EHotWaterPerformanceType

interface IProps {
  onChange: (event: any) => void
  value: TPerformanceType
  options: TPerformanceType[]
}

export const PerformanceTypeSelect = ({ onChange, value, options }: IProps) => {
  return (
    <OptionMenu
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-"
      label={(option) => t(`${i18nPrefix}.${option}`)}
    />
  )
}
