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
  badgeCount?: number
}

export const UnreadFilter = observer(function UnreadFilter({ value, onChange, onApply, badgeCount }: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = [
    { value: ERadioFilterValue.include, label: t("submissionInbox.filters.all") },
    { value: ERadioFilterValue.onlyShow, label: t("submissionInbox.filters.onlyShow") },
    { value: ERadioFilterValue.hide, label: t("submissionInbox.filters.hide") },
  ]
  const title =
    value === ERadioFilterValue.onlyShow
      ? t("submissionInbox.filters.isUnread")
      : value === ERadioFilterValue.hide
        ? t("submissionInbox.filters.unreadHidden")
        : t("submissionInbox.filters.unread")

  return (
    <InboxFilter
      title={title}
      badgeCount={badgeCount}
      showResultsBadge
      isMulti={false}
      value={value}
      onChange={(val) => onChange(val as ERadioFilterValue)}
      options={options}
      onApply={onApply}
    />
  )
})
