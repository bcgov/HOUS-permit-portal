import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { FeatureAccessScreen, FeatureItem } from "../../../../../../components/shared/base/feature-access-screen"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"

export const ReviewManagerGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.globalFeatureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()

  const features: FeatureItem[] = [
    {
      label: t(`${i18nPrefix}.submissionInbox`),
      enabled: currentJurisdiction?.inboxEnabled,
      route: "submission-inbox",
    },
    // Add more features here as needed
  ]

  return (
    <FeatureAccessScreen
      title={t(`${i18nPrefix}.title`)}
      description={t(`${i18nPrefix}.description`)}
      features={features}
      i18nPrefix={i18nPrefix}
    />
  )
})
