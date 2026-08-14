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
  options: IOption[]
}

export const RequirementTemplateInboxFilter = observer(function RequirementTemplateInboxFilter({
  value,
  onChange,
  onApply,
  onClear,
  options,
}: IProps) {
  const { t } = useTranslation()

  return (
    <InboxFilter
      title={t("submissionInbox.filters.permitType")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
