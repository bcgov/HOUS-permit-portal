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
    {
      value: EPermitApplicationStatus.newlySubmitted,
      label: t("permitApplication.status.newlySubmitted"),
    },
    {
      value: EPermitApplicationStatus.resubmitted,
      label: t("permitApplication.status.resubmitted"),
    },
  ]

  return (
    <InboxFilter
      title={t("submissionInbox.filters.status")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
