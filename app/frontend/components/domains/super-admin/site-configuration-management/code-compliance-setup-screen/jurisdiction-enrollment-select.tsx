import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../../types/types"
import { JurisdictionAccessSelect } from "../../../../shared/jurisdiction/jurisdiction-access-select"

interface JurisdictionEnrollmentSelectProps {
  servicePartner: string
  value: IOption[]
  enabledForAll: boolean
  onChange: (selectedOptions: IOption[]) => void
  onSave: (selectedOptions: IOption[]) => Promise<void>
  onToggleEnabledForAll: (enabled: boolean) => Promise<void>
  isLoading?: boolean
}

export const JurisdictionEnrollmentSelect = observer(function JurisdictionEnrollmentSelect({
  servicePartner,
  value,
  enabledForAll,
  onChange,
  onSave,
  onToggleEnabledForAll,
  isLoading = false,
}: JurisdictionEnrollmentSelectProps) {
  const { t } = useTranslation()
  const i18nPrefix = "siteConfiguration.globalFeatureAccess.codeComplianceSetup"

  return (
    <JurisdictionAccessSelect
      title={t(`${i18nPrefix}.archistarEcheck`)}
      value={value}
      enabledForAll={enabledForAll}
      onChange={onChange}
      onSave={onSave}
      onToggleEnabledForAll={onToggleEnabledForAll}
      isLoading={isLoading}
    />
  )
})
