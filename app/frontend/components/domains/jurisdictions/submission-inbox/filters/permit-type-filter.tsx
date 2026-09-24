import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
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
  const { jurisdictionId, permitProjectId } = useParams<{
    jurisdictionId?: string
    permitProjectId?: string
  }>()
  const { requirementTemplateStore, sandboxStore } = useMst()
  const { currentSandboxId } = sandboxStore

  useEffect(() => {
    if (!jurisdictionId) return
    requirementTemplateStore.fetchFilterOptions({
      jurisdictionId,
      ...(permitProjectId ? { permitProjectId } : {}),
    })
  }, [jurisdictionId, permitProjectId, currentSandboxId])

  return (
    <InboxFilter
      title={t("submissionInbox.filters.permitType")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={[...requirementTemplateStore.filterOptions]}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
