import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplicationStore } from "../../../stores/permit-application-store"
import { EPermitApplicationStatus } from "../../../types/enums"
import { CheckboxFilter } from "../../shared/filters/checkbox-filter"

interface IProps {
  searchModel: IPermitApplicationStore
}

export const StatusFilter = observer(function StatusFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { statusFilter, setStatusFilter, searchPermitApplications } = searchModel

  const statuses = [
    EPermitApplicationStatus.newDraft,
    EPermitApplicationStatus.newlySubmitted,
    EPermitApplicationStatus.revisionsRequested,
    EPermitApplicationStatus.resubmitted,
  ] as const

  const options = statuses.map((status) => ({
    value: status,
    label: t(`permitApplication.status.${status}`),
  }))

  const handleChange = (nextValue: string[]) => {
    setStatusFilter(nextValue as EPermitApplicationStatus[])
    searchPermitApplications()
  }

  const handleReset = () => {
    setStatusFilter([] as EPermitApplicationStatus[])
    searchPermitApplications()
  }

  return (
    <CheckboxFilter
      value={statusFilter || []}
      onChange={handleChange}
      onReset={handleReset}
      options={options}
      title={t("permitApplication.statusFilter")}
    />
  )
})
