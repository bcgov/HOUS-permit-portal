import { observer } from "mobx-react-lite"
import React from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { FeatureToggleScreen } from "../../../../../shared/base/feature-toggle-screen"

export const myJurisdictionAboutPageScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction } = useJurisdiction()

  const handleToggle = (checked) => {
    currentJurisdiction.update({ showAboutPage: checked })
  }

  return (
    <FeatureToggleScreen
      i18nPrefix={i18nPrefix}
      featureKey="myJurisdictionAboutPage"
      backUrl={`/jurisdictions/${currentJurisdiction?.slug}/configuration-management/feature-access/`}
      isEnabled={currentJurisdiction?.showAboutPage || false}
      editPageUrl={`/jurisdictions/${currentJurisdiction?.slug}/`}
      onToggle={handleToggle}
    />
  )
})
