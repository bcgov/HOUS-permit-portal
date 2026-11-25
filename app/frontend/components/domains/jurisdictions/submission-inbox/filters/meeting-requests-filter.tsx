import { Icon } from "@chakra-ui/react"
import { CalendarDots } from "@phosphor-icons/react"
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
  onClear?: () => void
}

export const MeetingRequestsFilter = observer(function MeetingRequestsFilter({
  value,
  onChange,
  onApply,
  onClear,
}: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = [
    // @ts-ignore
    { value: ERadioFilterValue.include, label: t("submissionInbox.filters.all") },
    // @ts-ignore
    { value: ERadioFilterValue.onlyShow, label: t("submissionInbox.filters.onlyShow") },
    // @ts-ignore
    { value: ERadioFilterValue.hide, label: t("submissionInbox.filters.hide") },
  ]
  const title =
    value === ERadioFilterValue.onlyShow
      ? t("submissionInbox.filters.hasMeetingRequest")
      : value === ERadioFilterValue.hide
        ? t("submissionInbox.filters.meetingRequestsHidden")
        : t("submissionInbox.filters.meetingRequests")

  return (
    <InboxFilter
      title={title}
      leftIcon={<Icon as={CalendarDots} boxSize={5} color="theme.blueActive" />}
      isMulti={false}
      value={value}
      onChange={(val) => onChange(val as ERadioFilterValue)}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
