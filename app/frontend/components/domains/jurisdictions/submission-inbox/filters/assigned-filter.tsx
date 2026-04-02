import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
  loadOptions: () => Promise<IOption[]>
}

export const AssignedFilter = observer(function AssignedFilter({
  value,
  onChange,
  onApply,
  onClear,
  loadOptions,
}: IProps) {
  const { t } = useTranslation()

  return (
    <InboxFilter
      title={t("submissionInbox.filters.assigned")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      loadOptions={loadOptions}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
