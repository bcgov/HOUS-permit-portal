import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { FeatureAccessScreen, FeatureItem } from "../../../../components/shared/base/feature-access-screen"
import { useMst } from "../../../../setup/root"

export const AdminGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()

  const features: FeatureItem[] = [
    {
      label: t(`${i18nPrefix}.submissionInbox`),
      enabled: siteConfigurationStore?.inboxEnabled,
      route: "submission-inbox",
    },
    {
      label: t(`${i18nPrefix}.designatedReviewer`),
      enabled: siteConfigurationStore?.allowDesignatedReviewer,
      route: "designated-reviewer",
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
