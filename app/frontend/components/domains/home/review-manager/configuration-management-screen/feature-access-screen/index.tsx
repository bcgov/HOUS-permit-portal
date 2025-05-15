import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { FeatureAccessScreen } from "../../../../../shared/base/feature-access-screen"

export const ReviewManagerFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.globalFeatureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()
  const location = useLocation()

  const features = [
    {
      label: t(`${i18nPrefix}.submissionInbox`),
      enabled: currentJurisdiction?.inboxEnabled,
      route: "submission-inbox",
    },
    // Add more features as needed
  ]

  return (
    <FeatureAccessScreen
      i18nPrefix={i18nPrefix}
      title={t(`${i18nPrefix}.featureAccess`)}
      description={t(`${i18nPrefix}.description`)}
      features={features}
    />
  )
})
