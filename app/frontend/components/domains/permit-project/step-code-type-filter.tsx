import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IStepCodeStore } from "../../../stores/step-code-store"
import { EStepCodeType } from "../../../types/enums"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IStepCodeStore
}

export const StepCodeTypeFilter = observer(function StepCodeTypeFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { typeFilter, setTypeFilter, searchStepCodes } = searchModel

  const types = [EStepCodeType.part3StepCode, EStepCodeType.part9StepCode] as const

  const options = types.map((type) => ({
    value: type,
    label: type === EStepCodeType.part3StepCode ? t("stepCode.types.Part3StepCode") : t("stepCode.types.Part9StepCode"),
  }))

  const handleChange = (nextValue: string[]) => {
    setTypeFilter(nextValue as EStepCodeType[])
    searchStepCodes()
  }

  const handleReset = () => {
    setTypeFilter([] as EStepCodeType[])
    searchStepCodes()
  }

  return (
    <CheckboxFilter
      value={typeFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("stepCode.columns.type")}
    />
  )
})
