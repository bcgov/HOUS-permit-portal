// ### SUBMISSION INDEX STUB FEATURE
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ERadioFilterValue } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: ERadioFilterValue
  onChange: (value: ERadioFilterValue) => void
  onApply: () => void
}

export const MeetingRequestsFilter = observer(function MeetingRequestsFilter({ value, onChange, onApply }: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = [
    { value: ERadioFilterValue.include, label: t("submissionInbox.filters.include") },
    { value: ERadioFilterValue.hide, label: t("submissionInbox.filters.hide") },
    { value: ERadioFilterValue.onlyShow, label: t("submissionInbox.filters.onlyShow") },
  ]

  return (
    <InboxFilter
      title={t("submissionInbox.filters.meetingRequests")}
      isMulti={false}
      value={value}
      onChange={(val) => onChange(val as ERadioFilterValue)}
      options={options}
      onApply={onApply}
      isDisabled
    />
  )
})
