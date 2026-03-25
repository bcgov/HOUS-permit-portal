import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectState } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const ProjectStatusFilter = observer(function ProjectStatusFilter({
  value,
  onChange,
  onApply,
  onClear,
}: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = Object.values(EProjectState)
    .filter((status) => status !== EProjectState.closed)
    .map((status) => ({
      value: status,
      // @ts-ignore
      label: t(`submissionInbox.projectStatuses.${status}`),
    }))

  return (
    <InboxFilter
      title={t("submissionInbox.filters.projectStatuses")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
