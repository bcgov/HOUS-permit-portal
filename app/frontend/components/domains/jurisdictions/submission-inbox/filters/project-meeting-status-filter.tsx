import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EProjectMeetingStatus } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const ProjectMeetingStatusFilter = observer(function ProjectMeetingStatusFilter({
  value,
  onChange,
  onApply,
  onClear,
}: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = [
    EProjectMeetingStatus.open,
    EProjectMeetingStatus.scheduled,
    EProjectMeetingStatus.completed,
    EProjectMeetingStatus.closed,
  ].map((status) => ({
    value: status,
    label: t(`projectMeeting.status.${status}`),
  }))

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
