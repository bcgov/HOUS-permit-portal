import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { DesignatedReviewerSettings } from "../../../../../shared/designated-reviewer-settings"

export const DesignatedReviewerScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction } = useJurisdiction()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isEnabled, setIsEnabled] = useState(currentJurisdiction?.allowDesignatedReviewer ?? false)

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked)
    currentJurisdiction.update({ allowDesignatedReviewer: checked })
  }

  return (
    <DesignatedReviewerSettings
      handleBack={() => navigate(-1)}
      title={t(`${i18nPrefix}.designatedReviewer`)}
      description={t(`${i18nPrefix}.editDesignatedReviewer`)}
      isEnabled={isEnabled}
      onToggle={handleToggle}
    />
  )
})
