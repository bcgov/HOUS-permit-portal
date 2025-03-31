import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { FeatureToggleScreen } from "../../../../components/shared/base/feature-toggle-screen"
import { useMst } from "../../../../setup/root"

export const InboxFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const [inboxEnabled, setInboxEnabled] = useState(false)

  const updateInboxEnabled = async (checked) => {
    // optimistic update is fine
    setInboxEnabled(checked)
    await updateSiteConfiguration({
      inboxEnabled: checked,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setInboxEnabled(siteConfigurationStore.inboxEnabled || false)
    }
  }, [configurationLoaded])

  return (
    <FeatureToggleScreen
      i18nPrefix={i18nPrefix}
      featureKey="submissionInbox"
      backUrl="/configuration-management/global-feature-access/"
      isEnabled={inboxEnabled}
      onToggle={updateInboxEnabled}
    />
  )
})
