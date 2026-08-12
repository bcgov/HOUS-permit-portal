import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProjectStore } from "../../../stores/permit-project-store"
import { EProjectState } from "../../../types/enums"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IPermitProjectStore
}

export const StateFilter = observer(function StateFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { stateFilter, setStateFilter, search } = searchModel

  const options = Object.values(EProjectState)
    .filter((state) => state !== EProjectState.closed)
    .map((state) => ({
      value: state,
      // @ts-ignore
      label: t(`submissionInbox.projectStates.${state}`),
    }))

  const handleChange = (nextValue: string[]) => {
    setStateFilter(nextValue as EProjectState[])
    search()
  }

  const handleReset = () => {
    setStateFilter([] as EProjectState[])
    search()
  }

  return (
    <CheckboxFilter
      value={stateFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("permitProject.stateFilter")}
    />
  )
})
