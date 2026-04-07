import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EPermitApplicationStatus } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const StatusFilter = observer(function StatusFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = [
    EPermitApplicationStatus.newlySubmitted,
    EPermitApplicationStatus.inReview,
    EPermitApplicationStatus.revisionsRequested,
    EPermitApplicationStatus.resubmitted,
    EPermitApplicationStatus.approved,
    EPermitApplicationStatus.issued,
    EPermitApplicationStatus.withdrawn,
  ].map((status) => ({
    value: status,
    // @ts-ignore
    label: t(`submissionInbox.applicationStatuses.${status}`),
  }))

  return (
    <InboxFilter
      title={t("submissionInbox.filters.status")}
      badgeCount={value.length}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
