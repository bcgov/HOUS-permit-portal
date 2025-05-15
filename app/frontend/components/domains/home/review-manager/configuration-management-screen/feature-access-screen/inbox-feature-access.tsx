import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { FeatureToggleScreen } from "../../../../../shared/base/feature-toggle-screen"
import { SubmissionsInboxSetupScreen } from "../submissions-inbox-setup-screen"

export const InboxFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.globalFeatureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()
  const location = useLocation()

  const handleToggle = (checked) => {
    currentJurisdiction.update({ inboxEnabled: checked })
  }

  return (
    <>
      <FeatureToggleScreen
        i18nPrefix={i18nPrefix}
        featureKey="submissionInbox"
        backUrl={`/jurisdictions/${currentJurisdiction?.slug}/configuration-management/feature-access/`}
        isEnabled={currentJurisdiction?.inboxEnabled || false}
        onToggle={handleToggle}
      />
      {location.pathname.endsWith("/submission-inbox") && <SubmissionsInboxSetupScreen />}
    </>
  )
})
