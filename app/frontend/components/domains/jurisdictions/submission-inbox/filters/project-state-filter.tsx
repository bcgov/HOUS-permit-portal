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

export const ProjectStateFilter = observer(function ProjectStateFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()

  const options: IOption[] = Object.values(EProjectState)
    .filter((state) => state !== EProjectState.closed)
    .map((state) => ({
      value: state,
      // @ts-ignore
      label: t(`submissionInbox.projectStates.${state}`),
    }))

  return (
    <InboxFilter
      title={t("submissionInbox.filters.projectStates")}
      isMulti={true}
      value={value}
      onChange={(val) => onChange(val as string[])}
      options={options}
      onApply={onApply}
      onClear={onClear}
    />
  )
})
