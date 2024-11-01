import { t } from "i18next"
import React from "react"
import { CustomMessageBox } from "../../shared/base/custom-message-box"

export const DrawingsWarning = function StepCodeWarning() {
  return (
    <CustomMessageBox
      status="warning"
      title={t("stepCode.drawingsWarning.title")}
      description={t("stepCode.drawingsWarning.description")}
    />
  )
}
