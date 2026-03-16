import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../../setup/root"
import { IOption } from "../../../../../types/types"
import { InboxFilter } from "../../../../shared/filters/inbox-filter"

interface IProps {
  value: string[]
  onChange: (value: string[]) => void
  onApply: () => void
  onClear: () => void
}

export const PermitTypeFilter = observer(function PermitTypeFilter({ value, onChange, onApply, onClear }: IProps) {
  const { t } = useTranslation()
  const { permitClassificationStore } = useMst()

  const options: IOption[] = useMemo(() => {
    return permitClassificationStore.permitTypes.map((pt) => ({
      value: pt.id,
      label: pt.name,
    }))
  }, [permitClassificationStore.permitTypes])

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
