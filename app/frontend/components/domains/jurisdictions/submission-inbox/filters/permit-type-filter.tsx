import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const RequirementTemplateInboxFilter = observer(function RequirementTemplateInboxFilter({
  value,
  onChange,
  onApply,
  onClear,
}: IProps) {
  const { t } = useTranslation()
  const { requirementTemplateStore } = useMst()

  useEffect(() => {
    requirementTemplateStore.fetchFilterOptions()
  }, [])

  return (
    <InboxFilter
      title={t("submissionInbox.filters.permitType")}
      badgeCount={value.length}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={[...requirementTemplateStore.filterOptions]}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
