import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../../../setup/root"
import { FeatureAccessScreen } from "../../../../../shared/base/feature-access-screen"

export const ReviewManagerFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()
  const { siteConfigurationStore } = useMst()
  const { allowDesignatedReviewer } = siteConfigurationStore

  const features = [
    {
      label: t(`${i18nPrefix}.submissionInbox`),
      enabled: currentJurisdiction?.inboxEnabled,
      route: "submissions-inbox-setup",
    },
    {
      label: t(`${i18nPrefix}.myJurisdictionAboutPage`),
      enabled: currentJurisdiction?.showAboutPage,
      route: "my-jurisdiction-about-page",
    },
  ]

  if (allowDesignatedReviewer) {
    features.push({
      label: t(`${i18nPrefix}.designatedReviewer`),
      enabled: currentJurisdiction?.allowDesignatedReviewer,
      route: "limit-who-can-request-revisions-from-submitters",
    })
  }

  return (
    <FeatureAccessScreen
      i18nPrefix={i18nPrefix}
      title={t(`${i18nPrefix}.title`)}
      description={t(`${i18nPrefix}.description`)}
      features={features}
    />
  )
})
