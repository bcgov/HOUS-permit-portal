import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProjectStore } from "../../../stores/permit-project-store"
import { EPermitProjectRollupStatus } from "../../../types/enums"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IPermitProjectStore
}

export const RollupStatusFilter = observer(function RollupStatusFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { rollupStatusFilter, setRollupStatusFilter, search } = searchModel

  const rollupStatuses = [
    EPermitProjectRollupStatus.empty,
    EPermitProjectRollupStatus.newDraft,
    EPermitProjectRollupStatus.revisionsRequested,
    EPermitProjectRollupStatus.newlySubmitted,
    EPermitProjectRollupStatus.resubmitted,
  ] as const

  const options = rollupStatuses.map((rollupStatus) => ({
    value: rollupStatus,
    label: t(`permitProject.rollupStatus.${rollupStatus}`),
  }))

  const handleChange = (nextValue: string[]) => {
    setRollupStatusFilter(nextValue as EPermitProjectRollupStatus[])
    search()
  }

  const handleReset = () => {
    setRollupStatusFilter([] as EPermitProjectRollupStatus[])
    search()
  }

  return (
    <CheckboxFilter
      value={rollupStatusFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("permitProject.rollupStatusFilter")}
    />
  )
})
