import { observer } from "mobx-react-lite"
import React from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { FeatureToggleScreen } from "../../../../../shared/base/feature-toggle-screen"

export const InboxFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction } = useJurisdiction()

  const handleToggle = (checked) => {
    currentJurisdiction.update({ inboxEnabled: checked })
  }

  return (
    <FeatureToggleScreen
      i18nPrefix={i18nPrefix}
      featureKey="submissionInbox"
      backUrl={`/jurisdictions/${currentJurisdiction?.slug}/configuration-management/feature-access/`}
      isEnabled={currentJurisdiction?.inboxEnabled || false}
      onToggle={handleToggle}
    />
  )
})
