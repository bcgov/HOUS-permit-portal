import { t } from "i18next"
import React from "react"
import { EFlashMessageStatus } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"

export const DrawingsWarning = function StepCodeWarning() {
  return (
    <CustomMessageBox
      status={EFlashMessageStatus.warning}
      title={t("stepCode.drawingsWarning.title")}
      description={t("stepCode.drawingsWarning.description")}
    />
  )
}
