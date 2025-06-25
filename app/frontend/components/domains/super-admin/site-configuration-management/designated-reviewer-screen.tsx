import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { DesignatedReviewerSettings } from "../../../shared/designated-reviewer-settings"

export const AdminDesignatedReviewerScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const [allowDesignatedReviewer, setAllowDesignatedReviewer] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setAllowDesignatedReviewer(checked)
    await updateSiteConfiguration({
      allowDesignatedReviewer: checked,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setAllowDesignatedReviewer(siteConfigurationStore.allowDesignatedReviewer || false)
    }
  }, [configurationLoaded])

  return (
    <DesignatedReviewerSettings
      handleBack={() => navigate(-1)}
      title={t(`${i18nPrefix}.designatedReviewer`)}
      description={t(`${i18nPrefix}.designatedReviewerDescription`)}
      isEnabled={allowDesignatedReviewer}
      onToggle={handleToggle}
    />
  )
})
