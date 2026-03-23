// ### SUBMISSION INDEX STUB FEATURE
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const AssignedFilter = observer(function AssignedFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()

  return (
    <InboxFilter
      title={t("submissionInbox.filters.assigned")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={[]}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
